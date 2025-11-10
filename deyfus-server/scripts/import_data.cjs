const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve(__dirname, '..', 'data_export.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo de datos no encontrado: ${filePath}`);
    process.exit(1);
  }

  console.log(`📥 Importando datos desde ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  try {
    // Limpiar tablas primero (en orden de dependencias inversas)
    console.log('🧹 Limpiando tablas...');
    await prisma.stockAlert.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.financialTransaction.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.inventory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.branch.deleteMany({});

    // Importar en orden de dependencias
    console.log('📦 Importando datos...');

    if (data.branches && data.branches.length > 0) {
      await prisma.branch.createMany({ data: data.branches });
      console.log(`  ✓ ${data.branches.length} ramas importadas`);
    }

    if (data.categories && data.categories.length > 0) {
      await prisma.category.createMany({ data: data.categories });
      console.log(`  ✓ ${data.categories.length} categorías importadas`);
    }

    if (data.products && data.products.length > 0) {
      // Convertir Decimal a string si es necesario
      const products = data.products.map(p => ({
        ...p,
        price: typeof p.price === 'object' ? p.price.toString() : p.price,
        cost: typeof p.cost === 'object' ? p.cost.toString() : p.cost,
      }));
      await prisma.product.createMany({ data: products });
      console.log(`  ✓ ${data.products.length} productos importados`);
    }

    if (data.users && data.users.length > 0) {
      await prisma.user.createMany({ data: data.users });
      console.log(`  ✓ ${data.users.length} usuarios importados`);
    }

    if (data.sales && data.sales.length > 0) {
      for (const sale of data.sales) {
        const { items, transactions, ...saleData } = sale;
        // Convertir Decimal a string
        const cleanSale = {
          ...saleData,
          total: typeof saleData.total === 'object' ? saleData.total.toString() : saleData.total,
          subtotal: typeof saleData.subtotal === 'object' ? saleData.subtotal.toString() : saleData.subtotal,
          tax: typeof saleData.tax === 'object' ? saleData.tax.toString() : saleData.tax,
          discount: typeof saleData.discount === 'object' ? saleData.discount.toString() : saleData.discount,
        };
        await prisma.sale.create({ data: cleanSale });
      }
      console.log(`  ✓ ${data.sales.length} ventas importadas`);
    }

    if (data.saleItems && data.saleItems.length > 0) {
      const saleItems = data.saleItems.map(item => ({
        ...item,
        price: typeof item.price === 'object' ? item.price.toString() : item.price,
        cost: typeof item.cost === 'object' ? item.cost.toString() : item.cost,
        discount: typeof item.discount === 'object' ? item.discount.toString() : item.discount,
      }));
      await prisma.saleItem.createMany({ data: saleItems });
      console.log(`  ✓ ${data.saleItems.length} líneas de venta importadas`);
    }

    if (data.inventory && data.inventory.length > 0) {
      await prisma.inventory.createMany({ data: data.inventory });
      console.log(`  ✓ ${data.inventory.length} registros de inventario importados`);
    }

    if (data.inventoryMovements && data.inventoryMovements.length > 0) {
      await prisma.inventoryMovement.createMany({ data: data.inventoryMovements });
      console.log(`  ✓ ${data.inventoryMovements.length} movimientos de inventario importados`);
    }

    if (data.financialTransactions && data.financialTransactions.length > 0) {
      const transactions = data.financialTransactions.map(t => ({
        ...t,
        amount: typeof t.amount === 'object' ? t.amount.toString() : t.amount,
      }));
      await prisma.financialTransaction.createMany({ data: transactions });
      console.log(`  ✓ ${data.financialTransactions.length} transacciones financieras importadas`);
    }

    if (data.stockAlerts && data.stockAlerts.length > 0) {
      await prisma.stockAlert.createMany({ data: data.stockAlerts });
      console.log(`  ✓ ${data.stockAlerts.length} alertas de stock importadas`);
    }

    console.log('\n✅ ¡Importación completada exitosamente!');
    console.log('Todos tus datos están ahora en la base de datos local.');
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
