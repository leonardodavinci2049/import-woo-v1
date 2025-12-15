// Next.js automaticamente carrega variáveis do .env
// Não precisamos mais do dotenv/config

import { z } from "zod";

const envsSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PORT must be a positive number")),

  SYSTEM_CLIENT_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("SYSTEM_CLIENT_ID must be a positive number")),
  STORE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("STORE_ID must be a positive number")),
  APP_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("USER_ID must be a positive number")),
  TYPE_BUSINESS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("TYPE_BUSINESS must be a positive number")),

  // Organization, Member and User IDs
  // ⚠️ DEVELOPMENT ONLY: Em produção, estes valores devem vir da sessão do usuário
  // Não devem ser fixos no .env, pois cada usuário tem seus próprios IDs
  // Os valores na documentação da API são apenas exemplos de demonstração
  // TODO: Migrar para obtenção via getUserSession() em produção
  ORGANIZATION_ID: z.string().min(1, "ORGANIZATION_ID is required"),
  MEMBER_ID: z.string().min(1, "MEMBER_ID is required"),
  USER_ID: z.string().min(1, "USER_ID is required"),
  PERSON_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PERSON_ID must be a positive number")),

  // External Assets API (srv-assets-v1)
  EXTERNAL_API_ASSETS_URL: z
    .string()
    .url("EXTERNAL_API_ASSETS_URL must be a valid URL")
    .default("http://localhost:5573/api"),

  // Database MySQL
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_USER: z.string().min(1, "DATABASE_USER is required"),
  DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),
  DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
  DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("DATABASE_PORT must be a positive number")),
  // API Configuration
  API_KEY: z.string().min(1, "API_KEY is required"),
});

// Inferir o tipo automaticamente a partir do schema
type EnvVars = z.infer<typeof envsSchema>;

// ✅ Só executar validação no servidor, nunca no cliente
let envVars: EnvVars;

if (typeof window === "undefined") {
  // Estamos no servidor - fazer validação completa
  const validationResult = envsSchema.safeParse(process.env);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${errorMessages}`);
  }

  envVars = validationResult.data;
} else {
  // Estamos no cliente - usar valores vazios ou default para variáveis privadas
  envVars = {
    PORT: 0,

    SYSTEM_CLIENT_ID: 0,
    STORE_ID: 0,
    APP_ID: 0,
    TYPE_BUSINESS: 0,

    // Organization and Member IDs - não devem ser acessadas no cliente
    ORGANIZATION_ID: "",
    MEMBER_ID: "",
    USER_ID: "",
    PERSON_ID: 0,

    // External Assets API - não deve ser acessada no cliente (apenas server-side)
    EXTERNAL_API_ASSETS_URL: "https://assents01.comsuporte.com.br/api",

    // Database - não devem ser acessadas no cliente
    DATABASE_URL: "",
    DATABASE_USER: "",
    DATABASE_PASSWORD: "",
    DATABASE_NAME: "",
    DATABASE_HOST: "",
    DATABASE_PORT: 0,

    // API Configuration - não deve ser acessada no cliente
    API_KEY: "",
  };
}

export const envs = {
  PORT: envVars.PORT,

  SYSTEM_CLIENT_ID: envVars.SYSTEM_CLIENT_ID,
  STORE_ID: envVars.STORE_ID,
  APP_ID: envVars.APP_ID,
  TYPE_BUSINESS: envVars.TYPE_BUSINESS,

  // Organization, Member and User IDs
  ORGANIZATION_ID: envVars.ORGANIZATION_ID,
  MEMBER_ID: envVars.MEMBER_ID,
  USER_ID: envVars.USER_ID,
  PERSON_ID: envVars.PERSON_ID,

  // External Assets API
  EXTERNAL_API_ASSETS_URL: envVars.EXTERNAL_API_ASSETS_URL,

  // Database
  DATABASE_URL: envVars.DATABASE_URL,
  DATABASE_USER: envVars.DATABASE_USER,
  DATABASE_PASSWORD: envVars.DATABASE_PASSWORD,
  DATABASE_NAME: envVars.DATABASE_NAME,
  DATABASE_HOST: envVars.DATABASE_HOST,
  DATABASE_PORT: envVars.DATABASE_PORT,

  // API Configuration
  API_KEY: envVars.API_KEY,
  EXTERNAL_API_ASSETS_KEY: envVars.API_KEY, // Reutiliza a API_KEY existente
};
