import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
    req.user = { id: user.id, role: user.role, branchId: user.branchId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};