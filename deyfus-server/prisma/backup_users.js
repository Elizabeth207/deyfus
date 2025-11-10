import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const outPath = path.resolve(process.cwd(), 'prisma', 'users_backup.json');
  fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
  console.log('Backup de usuarios guardado en', outPath, ' (usuarios:', users.length, ')');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
