import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { envs } from "@/core/config/envs";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: envs.DATABASE_HOST,
  user: envs.DATABASE_USER,
  password: envs.DATABASE_PASSWORD,
  database: envs.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
