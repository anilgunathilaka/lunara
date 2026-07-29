import { PrismaClient } from '@prisma/client';

// Standard singleton pattern to avoid exhausting database connections
// from repeated hot-reload instantiation in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
