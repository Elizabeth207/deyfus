import prisma from '../prisma.js';

export const getProducts = async (req, res) => {
  try {
    const { search, categoryId, branchId, stockFilter } = req.query;
    
    let whereClause = {};
    
    // Construir las condiciones de búsqueda

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    if (branchId) {
      whereClause.branchId = parseInt(branchId);
    }

    console.log('Buscando productos con criterios:', whereClause);
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        branch: true,
        inventory: {
          include: {
            branch: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Se encontraron ${products.length} productos`);

    // Filtrar por stock si es necesario
    let filteredProducts = products;
    if (stockFilter) {
      filteredProducts = products.filter(product => {
        const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        switch (stockFilter) {
          case 'out':
            return totalStock === 0;
          case 'low':
            return totalStock > 0 && totalStock <= 5;
          case 'normal':
            return totalStock > 5;
          default:
            return true;
        }
      });
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        branch: true,
        inventory: {
          include: {
            branch: true
          }
        },
        inventoryMovements: {
          include: {
            user: true,
            branch: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Últimos 10 movimientos
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      sku, 
      price, 
      cost, 
      categoryId, 
      branchId, 
      description, 
      brand, 
      imageUrl, 
      qrCode,
      initialStock 
    } = req.body;

    if (!name || !sku || !price) {
      return res.status(400).json({ message: 'Nombre, SKU y precio son requeridos' });
    }

    // Verificar si el SKU ya existe
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'El SKU ya está en uso' });
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        branchId: branchId ? parseInt(branchId) : null,
        description: description || null,
        brand: brand || null,
        imageUrl: imageUrl || null,
        qrCode: qrCode || undefined
      },
      include: {
        category: true,
        branch: true
      }
    });

    // Si se proporciona stock inicial, crear el registro de inventario
    if (initialStock && branchId) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          branchId: parseInt(branchId),
          quantity: parseInt(initialStock)
        }
      });

      // Registrar el movimiento inicial
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          branchId: parseInt(branchId),
          userId: req.user.id, // Asumiendo que el middleware de auth agrega el usuario
          type: 'ENTRY',
          quantity: parseInt(initialStock),
          previousStock: 0,
          newStock: parseInt(initialStock),
          reason: 'Stock inicial'
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Eliminar campos que no deberían actualizarse directamente
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

  // Convertir campos numéricos (verificar !== undefined para soportar 0)
  if (updateData.price !== undefined && updateData.price !== null) updateData.price = parseFloat(updateData.price);
  if (updateData.cost !== undefined && updateData.cost !== null) updateData.cost = parseFloat(updateData.cost);
  if (updateData.categoryId !== undefined && updateData.categoryId !== null) updateData.categoryId = parseInt(updateData.categoryId);
  if (updateData.branchId !== undefined && updateData.branchId !== null) updateData.branchId = parseInt(updateData.branchId);

  // Logear los datos que se intentan actualizar para facilitar debugging
  console.log(`Actualizando producto ${id} con:`, updateData);

    // Whitelist fields allowed to be updated to avoid sending relation objects
    const allowedFields = [
      'name', 'description', 'sku', 'barcode', 'price', 'cost', 'brand', 'imageUrl', 'qrCode', 'categoryId', 'branchId', 'isActive'
    ];

    const dataToUpdate = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        dataToUpdate[key] = updateData[key];
      }
    }

    console.log('Campos que se aplicarán en update:', dataToUpdate);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        category: true,
        branch: true,
        inventory: {
          include: {
            branch: true
          }
        }
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    // Incluir mensaje de error en la respuesta para facilitar diagnóstico desde el cliente
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // En lugar de eliminar, marcamos como inactivo
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchId, quantity, type, reason } = req.body;

    if (!['ENTRY', 'EXIT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de movimiento inválido' });
    }

    // Obtener el inventario actual
    const currentInventory = await prisma.inventory.findFirst({
      where: {
        productId: parseInt(id),
        branchId: parseInt(branchId)
      }
    });

    const previousStock = currentInventory ? currentInventory.quantity : 0;
    let newStock = previousStock;

    // Calcular nuevo stock según el tipo de movimiento
    switch (type) {
      case 'ENTRY':
        newStock += parseInt(quantity);
        break;
      case 'EXIT':
        newStock -= parseInt(quantity);
        if (newStock < 0) {
          return res.status(400).json({ message: 'Stock insuficiente' });
        }
        break;
      case 'ADJUSTMENT':
        newStock = parseInt(quantity);
        break;
    }

    // Actualizar o crear inventario
    await prisma.inventory.upsert({
      where: {
        id: currentInventory?.id || 0
      },
      update: {
        quantity: newStock
      },
      create: {
        productId: parseInt(id),
        branchId: parseInt(branchId),
        quantity: newStock
      }
    });

    // Registrar el movimiento
    await prisma.inventoryMovement.create({
      data: {
        productId: parseInt(id),
        branchId: parseInt(branchId),
        userId: req.user?.id || null,
        type,
        quantity: parseInt(quantity),
        previousStock,
        newStock,
        reason
      }
    });

    // Verificar si se debe crear una alerta de stock
    if (newStock <= 5) {
      await prisma.stockAlert.create({
        data: {
          productId: parseInt(id),
          branchId: parseInt(branchId),
          userId: req.user?.id || null,
          type: 'LOW_STOCK',
          message: `Stock bajo para el producto (${newStock} unidades)`,
          status: 'PENDING'
        }
      });
    }

    res.json({ message: 'Inventario actualizado exitosamente', newStock });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({ message: 'Error al actualizar inventario' });
  }
};