const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const outPath = path.resolve(__dirname, '..', 'data_export.json');
  console.log('Exportando datos a', outPath);

  const data = {};

  data.branches = await prisma.branch.findMany();
  data.categories = await prisma.category.findMany();
  data.products = await prisma.product.findMany();
  data.users = await prisma.user.findMany();

  // Sales with items and transactions
  data.sales = await prisma.sale.findMany({
    include: { items: true, transactions: true }
  });

  data.saleItems = await prisma.saleItem.findMany();
  data.inventory = await prisma.inventory.findMany();
  data.inventoryMovements = await prisma.inventoryMovement.findMany();
  data.stockAlerts = await prisma.stockAlert.findMany();
  data.financialTransactions = await prisma.financialTransaction.findMany();

  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log('Export completo — filas exportadas:');
  Object.keys(data).forEach(k => console.log(k, Array.isArray(data[k]) ? data[k].length : '??'));
}

main()
  .catch((e) => {
    console.error('Error exportando datos:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
