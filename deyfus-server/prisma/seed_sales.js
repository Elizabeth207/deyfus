import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Buscar sucursal, usuario y productos existentes
  const branch = await prisma.branch.findFirst();
  const user = await prisma.user.findFirst();
  const products = await prisma.product.findMany({ take: 2 });
  if (!branch || !user || products.length === 0) {
    console.error('Faltan datos base: sucursal, usuario o productos. Corre primero el seed principal.');
    process.exit(1);
  }

  for (let i = 1; i <= 10; i++) {
    const sale = await prisma.sale.create({
      data: {
        userId: user.id,
        branchId: branch.id,
        total: 199.99 + i,
        subtotal: 179.99 + i,
        tax: 20.00,
        discount: 0,
        paymentMethod: i % 2 === 0 ? 'CASH' : 'CARD',
        paymentStatus: 'COMPLETED',
        status: 'COMPLETED',
        invoiceNumber: `FCT-00${i}`,
        createdAt: new Date(Date.now() - i * 86400000), // días atrás
        items: {
          create: products.map((p, idx) => ({
            productId: p.id,
            quantity: 1 + idx,
            price: p.price,
            cost: p.cost,
            discount: 0,
            size: idx === 0 ? '42' : '41',
          }))
        }
      }
    });
    console.log('Venta creada:', sale.invoiceNumber);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
