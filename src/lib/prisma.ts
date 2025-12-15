import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { envs } from "@/core/config/envs";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Remove porta do host se estiver incluída (ex: "10.0.0.210:3306" -> "10.0.0.210")
  const host = envs.DATABASE_HOST.split(":")[0];

  const adapter = new PrismaMariaDb({
    host,
    port: envs.DATABASE_PORT,
    user: envs.DATABASE_USER,
    password: envs.DATABASE_PASSWORD,
    database: envs.DATABASE_NAME,
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
