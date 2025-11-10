import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function generateSalesAndTransactions() {
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const branches = await prisma.branch.findMany();
    
    // Fechas del último mes (octubre-noviembre 2025)
    const startDate = new Date('2025-10-07');
    const endDate = new Date('2025-11-07');

    // Generar 30 ventas
    for (let i = 0; i < 30; i++) {
        const saleDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const seller = users[Math.floor(Math.random() * users.length)];
        const branch = branches[Math.floor(Math.random() * branches.length)];
        
        // Crear entre 1 y 4 items por venta
        const numItems = Math.floor(Math.random() * 4) + 1;
        const saleItems = [];
        let totalAmount = 0;

        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 pares
            const size = String(Math.floor(Math.random() * 5) + 38); // Tallas 38-42
            
            saleItems.push({
                productId: product.id,
                quantity,
                size,
                unitPrice: product.price,
                subtotal: product.price * quantity
            });
            
            totalAmount += product.price * quantity;
        }

        // Calcular impuestos (15% IVA)
        const tax = totalAmount * 0.15;
        const total = totalAmount + tax;
        
        // Crear la venta
        const sale = await prisma.sale.create({
            data: {
                createdAt: saleDate,
                total: total,
                subtotal: totalAmount,
                tax: tax,
                status: 'COMPLETED',
                paymentMethod: Math.random() > 0.3 ? 'CARD' : 'CASH',
                paymentStatus: 'COMPLETED',
                items: {
                    create: saleItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        size: item.size,
                        price: item.unitPrice,
                        cost: item.unitPrice * 0.6, // 40% de margen
                        discount: 0
                    }))
                },
                user: {
                    connect: { id: seller.id }
                },
                branch: {
                    connect: { id: branch.id }
                },
                discount: 0,
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
            }
        });

        // Crear transacción financiera correspondiente
        await prisma.financialTransaction.create({
            data: {
                createdAt: saleDate,
                amount: total,
                type: 'INCOME',
                category: 'SALE',
                description: `Venta ${sale.id} - ${sale.invoiceNumber}`,
                branch: {
                    connect: { id: branch.id }
                },
                user: {
                    connect: { id: seller.id }
                },
                sale: {
                    connect: { id: sale.id }
                }
            }
        });

        // Registrar movimientos de inventario
        for (const item of saleItems) {
            const prevStock = await prisma.inventory.findFirst({
                    where: {
                        productId: item.productId,
                        branchId: branch.id,
                        size: item.size
                    }
                });
                
                const newStock = (prevStock?.quantity || 0) - item.quantity;
                
                await prisma.inventoryMovement.create({
                    data: {
                        createdAt: saleDate,
                        quantity: -item.quantity,
                        type: 'EXIT',
                        product: {
                            connect: { id: item.productId }
                        },
                        branch: {
                            connect: { id: branch.id }
                        },
                        user: {
                            connect: { id: seller.id }
                        },
                        previousStock: prevStock?.quantity || 0,
                        newStock: newStock,
                        reason: `Venta ${sale.id} - ${sale.invoiceNumber} (Talla: ${item.size})`,
                        reference: sale.invoiceNumber
                    }
                });
        }
    }

    // Generar 30 transacciones financieras adicionales (gastos operativos)
    const expenseCategories = [
        { category: 'RENT', minAmount: 2000, maxAmount: 3000 },
        { category: 'UTILITIES', minAmount: 300, maxAmount: 800 },
        { category: 'SALARIES', minAmount: 1500, maxAmount: 2500 },
        { category: 'MAINTENANCE', minAmount: 100, maxAmount: 500 },
        { category: 'SUPPLIES', minAmount: 200, maxAmount: 1000 }
    ];

    for (let i = 0; i < 30; i++) {
        const expense = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const expenseDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const branch = branches[Math.floor(Math.random() * branches.length)];
        
        // Seleccionar un usuario administrador o gerente para el gasto
        const adminUser = users.find(u => u.role === 'ADMIN') || users.find(u => u.role === 'MANAGER') || users[0];
        
        await prisma.financialTransaction.create({
            data: {
                createdAt: expenseDate,
                amount: Math.floor(Math.random() * (expense.maxAmount - expense.minAmount) + expense.minAmount),
                type: 'EXPENSE',
                category: expense.category,
                description: `Gasto ${expense.category.toLowerCase()} - ${branch.name}`,
                branch: {
                    connect: { id: branch.id }
                },
                user: {
                    connect: { id: adminUser.id }
                },
                reference: `EXP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
            }
        });
    }

    console.log('¡Datos de ventas y transacciones financieras generados exitosamente!');
}

generateSalesAndTransactions()
    .catch(e => {
        console.error('Error al generar datos:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });