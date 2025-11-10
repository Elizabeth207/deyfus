import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Obtener conteos de todas las tablas
  const counts = {
    users: await prisma.user.count(),
    branches: await prisma.branch.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    inventory: await prisma.inventory.count(),
    sales: await prisma.sale.count(),
    saleItems: await prisma.saleItem.count(),
    financialTransactions: await prisma.financialTransaction.count(),
    inventoryMovements: await prisma.inventoryMovement.count(),
    stockAlerts: await prisma.stockAlert.count()
  };

  console.log('Estado actual de la base de datos:');
  console.table(counts);

  // Mostrar algunos productos nuevos como ejemplo
  const products = await prisma.product.findMany({ 
    take: 5,
    include: {
      category: true,
      inventory: true
    }
  });
  
  console.log('\nEjemplos de productos nuevos:');
  products.forEach(p => {
    console.log(`\n${p.name} (${p.sku})`);
    console.log(`- Categoría: ${p.category?.name}`);
    console.log(`- Precio: ${p.price}`);
    console.log(`- Stock por tallas:`, p.inventory.map(i => `${i.size}: ${i.quantity}`).join(', '));
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());