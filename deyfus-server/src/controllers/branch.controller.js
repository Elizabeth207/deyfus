import prisma from '../prisma.js';

export const createBranch = async (req, res) => {
  try {
    const { name, address, phone, isActive } = req.body;
    
    // Validación básica
    if (!name || !address) {
      return res.status(400).json({ 
        message: 'Nombre y dirección son requeridos' 
      });
    }

    const data = { name, address, phone: phone || null };
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const branch = await prisma.branch.create({
      data
    });

    res.status(201).json({
      message: 'Sucursal creada exitosamente',
      data: branch
    });

  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ 
      message: 'Error al crear sucursal',
      error: error.message 
    });
  }
};

export const getBranches = async (req, res) => {
  try {
    // Soporta búsqueda por nombre/dirección y filtro por estado
    const { search, status } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    const branches = await prisma.branch.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { 
            products: true,
            sales: true,
            users: true,
            stockAlerts: true,
            inventoryMovements: true,
            financialTransactions: true
          }
        }
      }
    });

    res.json({
      message: 'Sucursales obtenidas exitosamente',
      data: branches
    });

  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ 
      message: 'Error al obtener sucursales',
      error: error.message 
    });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, isActive } = req.body;

    // Validar que la sucursal existe
    const branchExists = await prisma.branch.findUnique({
      where: { id: parseInt(id) }
    });

    if (!branchExists) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    const data = { name, address, phone };
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const updatedBranch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({
      message: 'Sucursal actualizada exitosamente',
      data: updatedBranch
    });

  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    res.status(500).json({ 
      message: 'Error al actualizar sucursal',
      error: error.message 
    });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que la sucursal existe
    const branchExists = await prisma.branch.findUnique({
      where: { id: parseInt(id) }
    });

    if (!branchExists) {
      return res.status(404).json({ 
        message: 'Sucursal no encontrada' 
      });
    }

    // Verificar si hay productos o ventas asociadas
    const { _count } = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
      select: {
        _count: {
          select: {
            products: true,
            sales: true
          }
        }
      }
    });

    if (_count.products > 0 || _count.sales > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la sucursal porque tiene productos o ventas asociadas'
      });
    }

    await prisma.branch.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Sucursal eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    res.status(500).json({ 
      message: 'Error al eliminar sucursal',
      error: error.message 
    });
  }
};