import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL não configurada");
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 10000,
      }),
    });
  }
  return globalForPrisma.prisma;
}
