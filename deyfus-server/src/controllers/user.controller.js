import prisma from '../prisma.js';

export const listUsers = async (req, res) => {
  try {
  const { branchId, isActive } = req.query;
    const { user } = req;

    // Only ADMIN and MANAGER allowed
    if (!['ADMIN', 'MANAGER'].includes(user.role)) return res.status(403).json({ message: 'No autorizado' });

    const where = {};
    if (user.role === 'MANAGER') {
      // managers can only see their branch
      where.branchId = user.branchId;
    }
    if (branchId) where.branchId = parseInt(branchId, 10);
    // Si se pasa isActive en query, filtramos por estado
    if (typeof isActive !== 'undefined' && isActive !== null && isActive !== '') {
      // aceptar 'true'/'1' como true, 'false'/'0' como false
      const b = String(isActive).toLowerCase();
      where.isActive = (b === 'true' || b === '1');
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, branchId: true, lastLogin: true, createdAt: true }
    });

    res.json({ data: users });
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ message: 'Error listing users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { user } = req;

    if (!['ADMIN', 'MANAGER'].includes(user.role)) return res.status(403).json({ message: 'No autorizado' });

    // managers can only view users in their branch
    const target = await prisma.user.findUnique({ where: { id }, include: { branch: true } });
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'MANAGER' && target.branchId !== user.branchId) return res.status(403).json({ message: 'No autorizado' });

    // Fetch recent sales for the user (last 10)
    const sales = await prisma.sale.findMany({ where: { userId: id }, take: 10, orderBy: { createdAt: 'desc' } });

    res.json({ data: { user: target, recentSales: sales } });
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ message: 'Error getting user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role, isActive, branchId } = req.body;
    const actor = req.user;

    if (!['ADMIN', 'MANAGER'].includes(actor.role)) return res.status(403).json({ message: 'No autorizado' });

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });

    // MANAGER restrictions
    if (actor.role === 'MANAGER') {
      if (target.branchId !== actor.branchId) return res.status(403).json({ message: 'No autorizado' });
      // Managers cannot assign ADMIN
      if (role === 'ADMIN') return res.status(403).json({ message: 'Managers no pueden asignar rol ADMIN' });
    }
    // Si se envía branchId, validar que exista
    let finalBranchId = branchId ?? target.branchId;
    if (branchId !== undefined && branchId !== null) {
      const exists = await prisma.branch.findUnique({ where: { id: Number(branchId) } });
      if (!exists) return res.status(400).json({ message: 'La sucursal indicada no existe' });
    }

    const updated = await prisma.user.update({ where: { id }, data: { role: role ?? target.role, isActive: typeof isActive === 'boolean' ? isActive : target.isActive, branchId: finalBranchId } });
    res.json({ data: updated });
  } catch (err) {
    console.error('updateUser error', err);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const actor = req.user;
    if (actor.role !== 'ADMIN') return res.status(403).json({ message: 'No autorizado' });

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar si el usuario tiene registros relacionados que impedirían el borrado
    const [salesCount, txCount, movCount, alertsCount] = await Promise.all([
      prisma.sale.count({ where: { userId: id } }),
      prisma.financialTransaction.count({ where: { userId: id } }),
      prisma.inventoryMovement.count({ where: { userId: id } }),
      prisma.stockAlert.count({ where: { userId: id } })
    ]);

    if (salesCount > 0 || txCount > 0 || movCount > 0 || alertsCount > 0) {
      return res.status(400).json({ message: 'El usuario tiene registros relacionados (ventas, transacciones o movimientos). Desactívelo en lugar de eliminarlo.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('deleteUser error', err);
    // Si es un error de integridad referencial de la base de datos, devolver mensaje más claro
    const msg = err?.message || 'Error deleting user';
    res.status(500).json({ message: msg });
  }
};
