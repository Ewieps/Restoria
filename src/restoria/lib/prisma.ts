import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter: adapter,
    log: ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// --------------------------------------------

// const prismaAdapter = new PrismaBetterSqlite3({
//   //connectionString: process.env.DATABASE_URL,  <--- POSTGRE PROD 
//   dbpath: process.env.DB_PATH || 'file:./prisma/dev.db',
// });

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   globalThis.prisma ??
//   new PrismaClient({
//     adapter: prismaAdapter,
//     log: ['query', 'warn', 'error'],
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }
