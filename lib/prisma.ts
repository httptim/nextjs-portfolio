// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Log database connection information
console.log('Database URLs available:', {
  DATABASE_URL: !!process.env.DATABASE_URL,
  POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
  DIRECT_URL: !!process.env.DIRECT_URL
});

// Create Prisma Client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

// Add middleware to log query performance in development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(
      `Prisma Query: ${params.model}.${params.action} took ${after - before}ms`
    );
    return result;
  });
}

// Save reference to client in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;