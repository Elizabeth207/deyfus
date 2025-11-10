import prisma from '../prisma.js';

export const getInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        branch: true
      }
    });
    res.json(inventory);
  } catch (error) {
    console.error('Error obtener inventario:', error);
    res.status(500).json({ message: 'Error al obtener inventario' });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { productId, branchId, quantity, minStock, maxStock, location, size } = req.body;

    const inventory = await prisma.inventory.create({
      data: {
        productId: parseInt(productId),
        branchId: parseInt(branchId),
        quantity: parseInt(quantity),
        minStock: parseInt(minStock),
        maxStock: maxStock ? parseInt(maxStock) : null,
        location,
        size
      },
      include: {
        product: true,
        branch: true
      }
    });

    // Crear movimiento inicial
    await prisma.inventoryMovement.create({
      data: {
        productId: parseInt(productId),
        branchId: parseInt(branchId),
        userId: req.user.id,
        type: 'ENTRY',
        quantity: parseInt(quantity),
        previousStock: 0,
        newStock: parseInt(quantity),
        reason: 'Inventario inicial',
      }
    });

    res.json(inventory);
  } catch (error) {
    console.error('Error crear inventario:', error);
    res.status(500).json({ message: 'Error al crear inventario' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { minStock, maxStock, location } = req.body;

    const inventory = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        minStock: minStock ? parseInt(minStock) : undefined,
        maxStock: maxStock ? parseInt(maxStock) : null,
        location
      },
      include: {
        product: true,
        branch: true
      }
    });

    res.json(inventory);
  } catch (error) {
    console.error('Error actualizar inventario:', error);
    res.status(500).json({ message: 'Error al actualizar inventario' });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventory.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Inventario eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminar inventario:', error);
    res.status(500).json({ message: 'Error al eliminar inventario' });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;

    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }

    const previousStock = inventory.quantity;
    let newStock;

    switch (type) {
      case 'ENTRY':
        newStock = previousStock + parseInt(quantity);
        break;
      case 'EXIT':
        if (previousStock < parseInt(quantity)) {
          return res.status(400).json({ message: 'Stock insuficiente' });
        }
        newStock = previousStock - parseInt(quantity);
        break;
      case 'ADJUSTMENT':
        newStock = parseInt(quantity);
        break;
      default:
        return res.status(400).json({ message: 'Tipo de ajuste inválido' });
    }

    const updated = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: { quantity: newStock },
      include: {
        product: true,
        branch: true
      }
    });

    await prisma.inventoryMovement.create({
      data: {
        productId: inventory.productId,
        branchId: inventory.branchId,
        userId: req.user.id,
        type,
        quantity: Math.abs(newStock - previousStock),
        previousStock,
        newStock,
        reason: reason || `Ajuste ${type.toLowerCase()}`,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error ajustar stock:', error);
    res.status(500).json({ message: 'Error al ajustar stock' });
  }
};

export const getMovements = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        productId: inventory.productId,
        branchId: inventory.branchId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(movements);
  } catch (error) {
    console.error('Error obtener movimientos:', error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};