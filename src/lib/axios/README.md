# Axios Configuration Guide

Este guia explica como usar corretamente os clientes Axios configurados neste projeto.

## 🔐 Segurança Implementada

### ✅ Melhorias de Segurança (Críticas)

1. **API_KEY Removida do Cliente**
   - `axios-client.ts` NÃO tem mais acesso à API_KEY
   - Previne exposição de credenciais no código JavaScript do navegador
   - Cliente deve fazer requisições via API Routes ou Server Actions

2. **Authorization Header no Servidor**
   - `server-axios-client.ts` usa `Authorization: Bearer ${API_KEY}`
   - Mais seguro que enviar API_KEY em body/params
   - Padrão da indústria para autenticação

## 📁 Estrutura dos Clientes

### Client-Side: `axios-client.ts`

```typescript
import axiosClient from "@/lib/axios/axios-client";

// ❌ NÃO usar para APIs externas que requerem API_KEY
// ✅ Usar apenas para APIs internas (API Routes do Next.js)

const response = await axiosClient.get("/api/internal-endpoint");
```

**Características:**
- Timeout: 15s (configurável via `API_TIMEOUTS.CLIENT_DEFAULT`)
- Sem API_KEY (segurança)
- Logging com timestamps e duração
- Ideal para Client Components

### Server-Side: `server-axios-client.ts`

```typescript
import serverAxiosClient from "@/lib/axios/server-axios-client";

// ✅ Usar em Server Components, Server Actions e API Routes
const response = await serverAxiosClient.get("/external-api/endpoint");
```

**Características:**
- Timeout: 30s (configurável via `API_TIMEOUTS.SERVER_DEFAULT`)
- API_KEY via Authorization header
- Retry automático (até 3 tentativas)
- Logging estruturado com duração
- Ideal para Server Components/Actions

## ⏱️ Configurações de Timeout

Em `src/lib/constants/api-constants.ts`:

```typescript
export const API_TIMEOUTS = {
  CLIENT_DEFAULT: 15000,      // 15s - requisições normais do cliente
  CLIENT_UPLOAD: 60000,       // 60s - uploads de arquivos
  SERVER_DEFAULT: 30000,      // 30s - requisições normais do servidor
  SERVER_LONG_RUNNING: 120000,// 120s - operações longas (relatórios)
  SERVER_UPLOAD: 180000,      // 180s - uploads grandes no servidor
} as const;
```

### Como usar timeouts customizados:

```typescript
// Cliente
await axiosClient.get("/endpoint", {
  timeout: API_TIMEOUTS.CLIENT_UPLOAD
});

// Servidor
await serverAxiosClient.post("/upload", data, {
  timeout: API_TIMEOUTS.SERVER_UPLOAD
});
```

## 🔄 Retry Logic (Servidor)

O `server-axios-client` implementa retry automático:

- **Máximo de tentativas**: 3
- **Delay exponencial**: 1s, 2s, 4s
- **Códigos que fazem retry**: 408, 429, 500, 502, 503, 504
- **Métodos idempotentes**: GET, HEAD, OPTIONS, PUT, DELETE

```typescript
// Configuração em api-constants.ts
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_CODES: [408, 429, 500, 502, 503, 504],
} as const;
```

### Exemplo de log com retry:

```
[2025-10-18T10:30:00.000Z] 🚀 [SERVER GET] /api/endpoint
[2025-10-18T10:30:05.000Z] ❌ 503 /api/endpoint { duration: "5000ms", retryCount: 0 }
[2025-10-18T10:30:05.000Z] 🔄 Retry 1/3 em 1000ms para /api/endpoint
[2025-10-18T10:30:06.000Z] ✅ [SERVER 200] /api/endpoint { duration: "1000ms", retryCount: 1 }
```

## 📊 Logging Estruturado

### Desenvolvimento

Logs detalhados com:
- Timestamp ISO 8601
- Método HTTP
- URL
- Duração da requisição
- Tamanho da resposta
- Contagem de retry (servidor)

### Produção

Logs apenas de erros críticos

## 🎯 Padrões de Uso

### ❌ NÃO FAZER

```typescript
// ❌ Usar axios-client para APIs externas com API_KEY
import axiosClient from "@/lib/axios/axios-client";
await axiosClient.get("https://external-api.com/data");
```

### ✅ FAZER

```typescript
// ✅ Client Component -> API Route -> External API
// client-component.tsx
const response = await fetch("/api/external-data");

// app/api/external-data/route.ts
import serverAxiosClient from "@/lib/axios/server-axios-client";
export async function GET() {
  const data = await serverAxiosClient.get("/external-endpoint");
  return Response.json(data);
}
```

## 🛠️ BaseApiService

Para criar serviços de API, estenda `BaseApiService`:

```typescript
import { BaseApiService } from "@/lib/axios/base-api-service";

class ProductService extends BaseApiService {
  async findProducts(query: string) {
    return this.get(`/products/search?q=${query}`);
  }
  
  async createProduct(data: ProductData) {
    return this.post("/products", data);
  }
}

export const productService = new ProductService();
```

## 🔧 Variáveis de Ambiente

```env
# .env (servidor apenas)
API_KEY=your-secret-api-key

# ===== API EXTERNA (Servidor NestJS) =====
EXTERNAL_API_BASE_URL=http://localhost:5558/api

# ===== APLICAÇÃO NEXT.JS =====
NEXT_APP_BASE_URL=http://localhost:5558

# ❌ NÃO usar NEXT_PUBLIC_API_KEY
# NEXT_PUBLIC_* é exposto no cliente
```

## 📝 Checklist de Segurança

- [ ] API_KEY nunca em `NEXT_PUBLIC_*`
- [ ] Client Components usam apenas API Routes internas
- [ ] Server Components/Actions usam `server-axios-client`
- [ ] API_KEY enviada via Authorization header
- [ ] Timeouts apropriados para cada operação
- [ ] Retry logic apenas em servidor
- [ ] Logs estruturados em desenvolvimento

## 🚨 Troubleshooting

### Erro 401 no Cliente

**Causa**: Cliente tentando acessar API externa sem autenticação

**Solução**: Criar API Route que usa `server-axios-client`

### Timeout em Upload

**Causa**: Timeout padrão muito baixo

**Solução**: Usar `API_TIMEOUTS.CLIENT_UPLOAD` ou `API_TIMEOUTS.SERVER_UPLOAD`

### Muitos Retries

**Causa**: Endpoint instável ou problema de rede

**Solução**: Verificar logs, ajustar `RETRY_CONFIG.MAX_RETRIES` se necessário

---

**Última atualização**: 18/10/2025
