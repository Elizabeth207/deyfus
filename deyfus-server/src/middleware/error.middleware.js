export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002': 
        return res.status(409).json({
          message: 'El registro ya existe',
          field: err.meta?.target?.[0],
          code: 'UNIQUE_CONSTRAINT_FAILED'
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Registro no encontrado',
          code: 'NOT_FOUND'
        });
      default:
        return res.status(500).json({
          message: 'Error de base de datos',
          code: err.code
        });
    }
  }

  // Si es un error de validación
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.errors || err.issues,
      code: 'VALIDATION_ERROR'
    });
  }

  // Si es un error de autenticación
  if (err.name === 'UnauthorizedError' || err.message === 'No autorizado') {
    return res.status(401).json({
      message: 'No autorizado',
      code: 'UNAUTHORIZED'
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      detail: err
    })
  });
};