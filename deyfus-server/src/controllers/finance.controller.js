import prisma from '../prisma.js';

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, branchId } = req.body;
    const userId = req.user && req.user.id;

    // Validaciones básicas
    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de transacción inválido' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    // Determinar branchId: usar el proporcionado o el de la sesión del usuario
    let branchIdToUse = null;
    if (branchId !== undefined && branchId !== null && branchId !== '') {
      branchIdToUse = parseInt(branchId);
      if (isNaN(branchIdToUse)) {
        return res.status(400).json({ message: 'Sucursal inválida' });
      }
    } else if (req.user && req.user.branchId) {
      branchIdToUse = req.user.branchId;
    } else {
      return res.status(400).json({ message: 'Sucursal requerida' });
    }

    if (!userId) {
      console.error('Usuario no autenticado al crear transacción');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        type,
        amount: amountNum,
        description: description || '',
        category: 'MANUAL',
        branchId: branchIdToUse,
        userId
      }
    });

    res.status(201).json({
      message: 'Transacción registrada exitosamente',
      data: transaction
    });
  } catch (error) {
    console.error('Error al crear transacción:', error?.message || error);
    // Dev-friendly response with error message for debugging (can be sanitized later)
    res.status(500).json({ message: error?.message || 'Error al registrar transacción' });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;

    const transactions = await prisma.financialTransaction.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: {
        branch: true
      }
    });

    const summary = {
      income: transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      expenses: transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    };

    res.json({
      summary: {
        ...summary,
        balance: summary.income - summary.expenses
      },
      transactions
    });
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    res.status(500).json({ message: 'Error al obtener resumen financiero' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, branchId } = req.body;
    const userId = req.user && req.user.id;

    if (!id) return res.status(400).json({ message: 'ID de transacción requerido' });

    const txId = parseInt(id);
    if (isNaN(txId)) return res.status(400).json({ message: 'ID inválido' });

    const existing = await prisma.financialTransaction.findUnique({ where: { id: txId } });
    if (!existing) return res.status(404).json({ message: 'Transacción no encontrada' });

    // permiso: si no es ADMIN, debe pertenecer a la misma sucursal
    if (req.user && req.user.role !== 'ADMIN' && req.user.branchId !== existing.branchId) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta transacción' });
    }

    const updateData = {};
    if (type && ['INCOME', 'EXPENSE'].includes(type)) updateData.type = type;
    if (amount !== undefined) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) return res.status(400).json({ message: 'Monto inválido' });
      updateData.amount = amountNum;
    }
    if (description !== undefined) updateData.description = description;
    if (branchId !== undefined && branchId !== null && branchId !== '') {
      const b = parseInt(branchId);
      if (isNaN(b)) return res.status(400).json({ message: 'Sucursal inválida' });
      updateData.branchId = b;
    }

    const updated = await prisma.financialTransaction.update({ where: { id: txId }, data: updateData });
    res.json({ message: 'Transacción actualizada', data: updated });
  } catch (error) {
    console.error('Error al actualizar transacción:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Error al actualizar transacción' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'ID de transacción requerido' });
    const txId = parseInt(id);
    if (isNaN(txId)) return res.status(400).json({ message: 'ID inválido' });

    const existing = await prisma.financialTransaction.findUnique({ where: { id: txId } });
    if (!existing) return res.status(404).json({ message: 'Transacción no encontrada' });

    if (req.user && req.user.role !== 'ADMIN' && req.user.branchId !== existing.branchId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta transacción' });
    }

    await prisma.financialTransaction.delete({ where: { id: txId } });
    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Error al eliminar transacción' });
  }
};