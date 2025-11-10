import prisma from '../prisma.js';

export const getDashboardData = async (req, res) => {
  try {
    const { user } = req;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Filtro de sucursal basado en el rol
    const branchFilter = user.role === 'ADMIN' ? {} : { branchId: user.branchId };

    const [
      dailySales,
      weeklySales,
      lowStockProducts,
      financialSummary,
      salesByBranch,
      topProducts,
      recentSales,
      productsByCategory,
      stockAlerts
    ] = await Promise.all([
      // Ventas del día
      prisma.sale.findMany({
        where: {
          ...branchFilter,
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0))
          },
          status: 'COMPLETED'
        },
        select: {
          id: true,
          total: true,
          createdAt: true
        }
      }),
      
      // Ventas de la semana
      prisma.sale.findMany({
        where: {
          ...branchFilter,
          createdAt: {
            gte: startOfWeek
          },
          status: 'COMPLETED'
        },
        select: {
          id: true,
          total: true,
          createdAt: true
        }
      }),
      
      // Productos con stock bajo
      prisma.inventory.findMany({
        where: {
          ...branchFilter,
          quantity: { lte: 5 }
        },
        include: {
          product: true,
          branch: true
        }
      }),
      
      // Resumen financiero (ingresos vs gastos)
      prisma.financialTransaction.groupBy({
        by: ['type'],
        where: {
          ...branchFilter,
          createdAt: {
            gte: startOfWeek
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Ventas por sucursal (solo para admin/manager)
      user.role === 'ADMIN' || user.role === 'MANAGER' ? 
        prisma.sale.groupBy({
          by: ['branchId'],
          where: {
            createdAt: {
              gte: startOfWeek
            },
            status: 'COMPLETED'
          },
          _sum: {
            total: true
          },
          _count: true
        }) : Promise.resolve([]),
      
      // Top productos más vendidos
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            ...branchFilter,
            createdAt: {
              gte: startOfWeek
            },
            status: 'COMPLETED'
          }
        },
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // Ventas recientes
      prisma.sale.findMany({
        where: {
          ...branchFilter,
          status: 'COMPLETED'
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true }
          },
          user: {
            select: { name: true }
          },
          branch: {
            select: { name: true }
          }
        }
      }),
      
      // Productos por categoría
      prisma.category.findMany({
        include: {
          products: {
            where: branchFilter,
            select: {
              id: true
            }
          }
        }
      }),

      // Alertas de stock pendientes
      prisma.stockAlert.findMany({
        where: {
          ...branchFilter,
          status: 'PENDING'
        },
        include: {
          product: true,
          branch: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    // Calcular totales de ventas
    const dailyTotal = dailySales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const weeklyTotal = weeklySales.reduce((sum, sale) => sum + Number(sale.total), 0);

    // Procesar resumen financiero
    const income = financialSummary.find(t => t.type === 'INCOME')?._sum.amount ?? 0;
    const expenses = financialSummary.find(t => t.type === 'EXPENSE')?._sum.amount ?? 0;

    res.json({
      dailySales: {
        total: dailyTotal,
        count: dailySales.length,
        sales: dailySales
      },
      weeklySales: {
        total: weeklyTotal,
        count: weeklySales.length,
        sales: weeklySales
      },
      lowStockProducts,
      financialSummary: {
        income,
        expenses,
        balance: income - expenses
      },
      salesByBranch,
      topProducts,
      recentSales,
      productsByCategory,
      stockAlerts
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ message: 'Error al cargar datos del dashboard' });
  }
};