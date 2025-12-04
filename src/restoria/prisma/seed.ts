import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const basePassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passHash = await bcrypt.hash(basePassword, 10);

  const admins = await Promise.all([
    prisma.admin.upsert({
      where: { username: 'adminZulfikar' },
      update: {},
      create: {
        username: 'adminZulfikar',
        passHash,
        role: 'mainadmin',
      },
    }),
    prisma.admin.upsert({
      where: { username: 'Hidayah' },
      update: {},
      create: {
        username: 'Hidayah',
        passHash,
        role: 'storemanager',
      },
    }),
    prisma.admin.upsert({
      where: { username: 'Khaleed Mobilejend' },
      update: {},
      create: {
        username: 'Khaleed Mobilejend',
        passHash,
        role: 'cashier',
      },
    }),
  ]);

  console.log('Seeded admins:', admins.map((a) => a.username).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
