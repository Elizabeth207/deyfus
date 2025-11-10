import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearAllExceptUsers() {
  console.log('Borrando datos existentes (excepto users) ...');
  // Orden seguro: dependencias primero
  await prisma.saleItem.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // No eliminamos branches porque pueden estar referenciadas por usuarios
  console.log('Borrado completado.');
}

async function seed() {
  try {
    await clearAllExceptUsers();

    // Crear branch principal
    const mainBranch = await prisma.branch.create({
      data: {
        name: 'Sucursal Principal',
        address: 'Av. Principal 123',
        phone: '999-000-111'
      }
    });

    // Categorías de calzado
    const categoryNames = ['Calzado Deportivo', 'Casual', 'Sandalias', 'Botas', 'Escolar'];
    const categories = [];
    for (const name of categoryNames) {
      const c = await prisma.category.create({ data: { name, description: `${name} de Deyfus` } });
      categories.push(c);
    }

    // Productos reales (20)
    const sampleProducts = [
      { sku: 'DF-NK-001', name: 'Nike Runner 001', brand: 'Nike', price: 199.99 },
      { sku: 'DF-NK-002', name: 'Nike Runner 002', brand: 'Nike', price: 219.99 },
      { sku: 'DF-AD-001', name: 'Adidas Classic 001', brand: 'Adidas', price: 179.99 },
      { sku: 'DF-AD-002', name: 'Adidas Classic 002', brand: 'Adidas', price: 189.99 },
      { sku: 'DF-PU-001', name: 'Puma Sport 001', brand: 'Puma', price: 159.99 },
      { sku: 'DF-RO-001', name: 'Roshe Casual 001', brand: 'Roshe', price: 129.99 },
      { sku: 'DF-CON-001', name: 'Converse AllStar', brand: 'Converse', price: 99.99 },
      { sku: 'DF-SAL-001', name: 'Sandalia Playa', brand: 'Deyfus', price: 49.99 },
      { sku: 'DF-BOT-001', name: 'Bota Trekking', brand: 'Deyfus', price: 249.99 },
      { sku: 'DF-ESC-001', name: 'Uniform Escolar', brand: 'Deyfus', price: 79.99 },
      { sku: 'DF-SPORT-003', name: 'Sport Flex 003', brand: 'Deyfus', price: 139.99 },
      { sku: 'DF-URB-001', name: 'Urban Walk 001', brand: 'Deyfus', price: 149.99 },
      { sku: 'DF-URB-002', name: 'Urban Walk 002', brand: 'Deyfus', price: 159.99 },
      { sku: 'DF-LUX-001', name: 'Lux Comfort', brand: 'Deyfus', price: 299.99 },
      { sku: 'DF-CAS-001', name: 'Casual Easy', brand: 'Deyfus', price: 89.99 },
      { sku: 'DF-RUN-004', name: 'Run Pro 004', brand: 'Deyfus', price: 229.99 },
      { sku: 'DF-RUN-005', name: 'Run Pro 005', brand: 'Deyfus', price: 239.99 },
      { sku: 'DF-TR-001', name: 'Trail Master', brand: 'Deyfus', price: 199.99 },
      { sku: 'DF-KID-001', name: 'Kids Soft', brand: 'Deyfus', price: 59.99 },
      { sku: 'DF-XL-001', name: 'Extra Large', brand: 'Deyfus', price: 129.99 }
    ];

    const createdProducts = [];
    for (let i = 0; i < sampleProducts.length; i++) {
      const p = sampleProducts[i];
      const category = categories[i % categories.length];
      const prod = await prisma.product.create({
        data: {
          name: p.name,
          description: `${p.name} - Calzado de alta calidad`,
          sku: p.sku,
          barcode: `BC-${p.sku}`,
          price: p.price,
          cost: Math.max(10, Number((p.price * 0.6).toFixed(2))),
          brand: p.brand,
          qrCode: `QR-${p.sku}`,
          categoryId: category.id,
          branchId: mainBranch.id
        }
      });
      createdProducts.push(prod);
    }

    // Inventario: crear varias tallas por producto
    const sizes = ['38','39','40','41','42'];
    let inventoryCount = 0;
    for (const prod of createdProducts) {
      for (const size of sizes) {
        const qty = randInt(5, 30);
        await prisma.inventory.create({ data: { productId: prod.id, branchId: mainBranch.id, quantity: qty, size, location: 'Tienda' } });
        inventoryCount++;
      }
    }

    // No creamos ventas por defecto (el usuario no pidió ventas)

    // Resúmenes
    const counts = {
      users: await prisma.user.count(),
      branches: await prisma.branch.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      inventory: await prisma.inventory.count(),
      sales: await prisma.sale.count(),
      saleItems: await prisma.saleItem.count(),
      financialTransactions: await prisma.financialTransaction.count()
    };

    console.log('Seed completado. Resumen:');
    console.table(counts);

  } catch (err) {
    console.error('Error durante seed_force:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
