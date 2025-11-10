import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true }, take: 50 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

export default router;