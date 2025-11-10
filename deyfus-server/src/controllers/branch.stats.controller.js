import prisma from '../prisma.js';

// Obtener una sucursal específica con toda su información
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    res.json({
      message: 'Sucursal obtenida exitosamente',
      data: branch
    });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    res.status(500).json({ 
      message: 'Error al obtener sucursal',
      error: error.message 
    });
  }
};

// Obtener estadísticas de una sucursal
export const getBranchStats = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Obtener ventas del mes
    const sales = await prisma.sale.findMany({
      where: {
        branchId: parseInt(id),
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        status: 'COMPLETED'
      },
      select: {
        total: true
      }
    });

    // Obtener inventario con valor
    const inventory = await prisma.inventory.findMany({
      where: {
        branchId: parseInt(id)
      },
      include: {
        product: {
          select: {
            name: true,
            price: true
          }
        }
      }
    });

    // Calcular alertas de stock
    const alerts = [];
    const inventoryWithStatus = inventory.map(item => {
      const value = Number(item.product.price) * item.quantity;
      if (item.quantity <= item.minStock) {
        alerts.push({
          type: 'low_stock',
          message: `Stock bajo para ${item.product.name} (${item.quantity} unidades)`
        });
      }
      return {
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        value,
        status: item.quantity <= 0 ? 'out' : item.quantity <= item.minStock ? 'low' : 'ok'
      };
    });

    // Calcular estadísticas
    const monthlySales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const avgTicket = sales.length ? monthlySales / sales.length : 0;
    const stockValue = inventoryWithStatus.reduce((sum, item) => sum + item.value, 0);

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        monthlySales,
        avgTicket,
        totalProducts: inventory.length,
        stockValue,
        inventory: inventoryWithStatus,
        alerts,
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};