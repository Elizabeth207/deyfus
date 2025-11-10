import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req, res) => {
  try {
    const { name, email, password, branchId, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email y password son requeridos' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email ya registrado' });

    // Si se envía branchId, validar que exista
    let finalBranchId = branchId;
    if (finalBranchId) {
      const exists = await prisma.branch.findUnique({ where: { id: Number(finalBranchId) } });
      if (!exists) return res.status(400).json({ message: 'La sucursal indicada no existe' });
    } else {
      // Si no se envía branchId, asignar la primera sucursal disponible
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) {
        return res.status(400).json({ message: 'No hay sucursales. Crea una sucursal primero.' });
      }
      finalBranchId = firstBranch.id;
    }

    // Seguridad: no permitir que un cliente público cree un ADMIN.
    // Si el body pide role='ADMIN', verificamos que la petición venga de un ADMIN autenticado.
    let finalRole = role || 'SELLER';
    if (finalRole === 'ADMIN') {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          finalRole = 'SELLER';
        } else {
          const token = authHeader.split(' ')[1];
          const payload = jwt.verify(token, JWT_SECRET);
          const requester = await prisma.user.findUnique({ where: { id: payload.id } });
          if (!requester || requester.role !== 'ADMIN') {
            finalRole = 'SELLER';
          }
        }
      } catch (e) {
        // cualquier error en verificación -> no permitir ADMIN
        finalRole = 'SELLER';
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: finalRole,
        branchId: finalBranchId
      }
    });

    const token = jwt.sign({ id: user.id, role: user.role, branchId: user.branchId }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email y password requeridos' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role, branchId: user.branchId }, JWT_SECRET, { expiresIn: '8h' });
    // Actualizar lastLogin
    try {
      await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    } catch (e) {
      console.warn('No se pudo actualizar lastLogin', e?.message || e);
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en login', error: error.message });
  }
};