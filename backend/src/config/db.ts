import { PrismaClient } from '@prisma/client';
import { config } from './index';

declare global {
  // Prevent multiple instances of PrismaClient in development during tsx reloads
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__prismaClient ||
  new PrismaClient({
    log: config.isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });

if (!config.isProduction) {
  global.__prismaClient = prisma;
}

export default prisma;
