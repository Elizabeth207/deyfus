import prisma from '../prisma.js';

export const createSale = async (req, res) => {
  try {
    const { items, total, subtotal, tax, discount, paymentMethod } = req.body;
    const userId = req.user?.id;
    const branchId = req.user?.branchId || req.body.branchId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No hay items para procesar' });
    }

    // Transacción atómica: verificar stock, actualizar inventario, crear venta y transacción financiera
    const result = await prisma.$transaction(async (tx) => {
      // Verificar y descontar stock
      for (const item of items) {
        const productId = item.productId ? parseInt(item.productId) : null;
        const size = item.size || null;
        const qty = parseInt(item.quantity);

        // Prefer explicit inventoryId if provided by frontend
        let inv = null;
        if (item.inventoryId) {
          inv = await tx.inventory.findUnique({ where: { id: parseInt(item.inventoryId) } });
        } else if (productId) {
          inv = await tx.inventory.findFirst({ where: { productId, branchId: parseInt(branchId), size } });
        }
        if (!inv) {
          throw new Error(`No hay inventario para el producto ${productId ?? item.inventoryId} en la sucursal ${branchId}`);
        }
        if (inv.quantity < qty) {
          throw new Error(`Stock insuficiente para el producto ${productId} (disponible: ${inv.quantity})`);
        }

        await tx.inventory.update({
          where: { id: inv.id },
          data: { quantity: inv.quantity - qty }
        });

        // Registrar movimiento de inventario
        await tx.inventoryMovement.create({
          data: {
            productId,
            branchId: parseInt(branchId),
            userId: parseInt(userId),
            type: 'EXIT',
            quantity: qty,
            previousStock: inv.quantity,
            newStock: inv.quantity - qty,
            reason: 'Venta'
          }
        });
      }

      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          userId: parseInt(userId),
          branchId: parseInt(branchId),
          total: parseFloat(total),
          subtotal: parseFloat(subtotal || total),
          tax: parseFloat(tax || 0),
          discount: parseFloat(discount || 0),
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus: 'COMPLETED',
          status: 'COMPLETED',
          items: {
            create: items.map(item => ({
              productId: parseInt(item.productId),
              size: item.size || null,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price || 0),
              cost: parseFloat(item.cost || 0)
            }))
          }
        },
        include: { items: { include: { product: true } } }
      });

      // Crear transacción financiera vinculada a la venta
      await tx.financialTransaction.create({
        data: {
          type: 'INCOME',
          amount: parseFloat(total),
          description: `Venta ${sale.id}`,
          branchId: parseInt(branchId),
          userId: parseInt(userId),
          category: 'SALE',
          saleId: sale.id,
          reference: sale.invoiceNumber || null
        }
      });

      return sale;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error crear venta:', error.message || error);
    res.status(500).json({ message: error.message || 'Error al crear venta' });
  }
};

export const getSales = async (req, res) => {
  try {
    // Support filters: startDate, endDate, branchId, userId, status, q (invoiceNumber)
    const { startDate, endDate, branchId, userId, status, q, take, skip } = req.query || {};

    const where = {};
    if (branchId) where.branchId = parseInt(branchId);
    if (userId) where.userId = parseInt(userId);
    if (status) where.status = status;
    if (q) where.OR = [{ invoiceNumber: { contains: String(q) } }];
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        // include the whole day for endDate
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        branch: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined
    });

    res.json(sales);
  } catch (error) {
    console.error('Error getSales:', error.message || error);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } }
      }
    });
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(sale);
  } catch (error) {
    console.error('Error getSaleById:', error.message || error);
    res.status(500).json({ message: 'Error al obtener la venta' });
  }
};

export const cancelSale = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { cancelReason } = req.body || {};

    const sale = await prisma.sale.findUnique({ include: { items: true }, where: { id } });
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    if (sale.status === 'CANCELLED') return res.status(400).json({ message: 'Venta ya cancelada' });

    // Start transaction: revert inventory, create movements, update sale and financial transaction
    const result = await prisma.$transaction(async (tx) => {
      // Revert inventory quantities
      for (const it of sale.items) {
        const inv = await tx.inventory.findFirst({ where: { productId: it.productId, branchId: sale.branchId, size: it.size || null } });
        if (inv) {
          await tx.inventory.update({ where: { id: inv.id }, data: { quantity: inv.quantity + it.quantity } });
          await tx.inventoryMovement.create({
            data: {
              productId: it.productId,
              branchId: sale.branchId,
              userId: req.user?.id || null,
              type: 'ENTRY',
              quantity: it.quantity,
              previousStock: inv.quantity,
              newStock: inv.quantity + it.quantity,
              reason: 'Cancelación de venta'
            }
          });
        }
      }

      // Update sale status
      const updated = await tx.sale.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: cancelReason || 'Cancelada desde UI', cancelledAt: new Date() }, include: { items: { include: { product: true } }, user: true, branch: true } });

      // Create reversing financial transaction
      await tx.financialTransaction.create({
        data: {
          type: 'EXPENSE',
          amount: updated.total,
          description: `Reversión venta ${updated.id}`,
          branchId: updated.branchId,
          userId: req.user?.id || null,
          category: 'SALE_REFUND',
          saleId: updated.id,
          reference: updated.invoiceNumber || null
        }
      });

      return updated;
    });

    res.json(result);
  } catch (error) {
    console.error('Error cancelar venta:', error.message || error);
    res.status(500).json({ message: error.message || 'Error al cancelar venta' });
  }
};

export const updateSale = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { paymentMethod, status } = req.body || {};

    if (status === 'CANCELLED') {
      return res.status(400).json({ message: 'Use el endpoint /:id/cancel para cancelar ventas (se revertirá stock)' });
    }

    const data = {};
    if (paymentMethod) data.paymentMethod = paymentMethod;
    if (status) data.status = status;

    const updated = await prisma.sale.update({
      where: { id },
      data,
      include: { items: { include: { product: true } }, user: true, branch: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updateSale:', error.message || error);
    res.status(500).json({ message: error.message || 'Error al actualizar venta' });
  }
};