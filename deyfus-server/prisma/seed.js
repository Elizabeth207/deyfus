import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear o reutilizar sucursal principal
    let mainBranch = await prisma.branch.findFirst({ where: { name: 'Sucursal Principal' } });
    if (!mainBranch) {
      mainBranch = await prisma.branch.create({
        data: {
          name: 'Sucursal Principal',
          address: 'Av. Principal 123',
          phone: '123-456-789',
        }
      });
      console.log('Sucursal Principal creada.');
    } else {
      console.log('Sucursal Principal ya existe (id:', mainBranch.id + ').');
    }

    // Crear o actualizar usuario administrador (si existe, no crear duplicado)
    const adminEmail = 'admin@deyfus.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          branchId: mainBranch.id
        }
      });
      console.log('Usuario admin creado:', adminUser.email);
    } else {
      console.log('Usuario con email', adminEmail, 'ya existe — id:', existingAdmin.id);
    }

    // Crear categorías (upsert por nombre porque name es unique)
    const categoryNames = ['Calzado Deportivo', 'Zapatillas Casuales', 'Sandalias'];
    for (const name of categoryNames) {
      await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    console.log('Categorías aseguradas.');

    // Crear algunos productos con upsert (sku es unique). Intentamos encontrar categorías por nombre.
    const cat1 = await prisma.category.findUnique({ where: { name: 'Calzado Deportivo' } });
    const cat2 = await prisma.category.findUnique({ where: { name: 'Zapatillas Casuales' } });

    const productsToUpsert = [
      {
        sku: 'NK-001',
        data: {
          name: 'Nike Air Max',
          description: 'Zapatillas deportivas Nike',
          sku: 'NK-001',
          barcode: '123456789',
          price: 199.99,
          cost: 150.00,
          brand: 'Nike',
          qrCode: 'QR-NK001',
          categoryId: cat1 ? cat1.id : undefined,
          branchId: mainBranch.id
        }
      },
      {
        sku: 'AD-001',
        data: {
          name: 'Adidas Superstar',
          description: 'Zapatillas casual Adidas',
          sku: 'AD-001',
          barcode: '987654321',
          price: 179.99,
          cost: 130.00,
          brand: 'Adidas',
          qrCode: 'QR-AD001',
          categoryId: cat2 ? cat2.id : undefined,
          branchId: mainBranch.id
        }
      }
    ];

    for (const p of productsToUpsert) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: p.data,
        create: p.data
      });
    }
    console.log('Productos asegurados.');

    // Crear inventario inicial solo si no hay inventario para esta sucursal
    const existingInventoryCount = await prisma.inventory.count({ where: { branchId: mainBranch.id } });
    if (existingInventoryCount === 0) {
      // Buscar ids de productos que acabamos de asegurar
      const product1 = await prisma.product.findUnique({ where: { sku: 'NK-001' } });
      const product2 = await prisma.product.findUnique({ where: { sku: 'AD-001' } });
      const inventoryData = [];
      if (product1) {
        inventoryData.push({
          productId: product1.id,
          branchId: mainBranch.id,
          quantity: 10,
          size: '42',
          location: 'A-1'
        });
      }
      if (product2) {
        inventoryData.push({
          productId: product2.id,
          branchId: mainBranch.id,
          quantity: 15,
          size: '41',
          location: 'A-2'
        });
      }
      if (inventoryData.length > 0) {
        await prisma.inventory.createMany({ data: inventoryData });
        console.log('Inventario inicial creado.');
      }
    } else {
      console.log('Inventario para la sucursal ya existe — se omite creación inicial.');
    }

    console.log('Datos de prueba creados exitosamente');
  } catch (error) {
    console.error('Error al crear datos de prueba:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();