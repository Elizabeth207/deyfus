// Función para paginar resultados
export const paginate = (query, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  return {
    ...query,
    skip,
    take: parseInt(limit)
  };
};

// Función para construir filtros dinámicos de Prisma
export const buildFilters = (filters) => {
  const where = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Manejo especial para búsqueda de texto
      if (key === 'q') {
        where.OR = [
          { name: { contains: value, mode: 'insensitive' } },
          { description: { contains: value, mode: 'insensitive' } }
        ];
      } else {
        where[key] = value;
      }
    }
  });

  return where;
};

// Función para ordenar resultados
export const buildOrderBy = (sort) => {
  if (!sort) return undefined;
  
  const [field, order] = sort.split(':');
  return {
    [field]: order?.toLowerCase() === 'desc' ? 'desc' : 'asc'
  };
};

// Función para seleccionar campos específicos
export const buildSelect = (fields) => {
  if (!fields) return undefined;
  
  const select = {};
  fields.split(',').forEach(field => {
    select[field.trim()] = true;
  });
  
  return select;
};