# API Constants - Usage Guide

## Status Code Mapping Functions

### `mapApiStatusToHttp(apiStatus: number): number`

Converte códigos de status customizados da API (100XXX) para códigos HTTP padrão.

**Exemplo:**
```typescript
import { mapApiStatusToHttp, API_STATUS_CODES } from './api-constants';

const response = await fetch('/api/taxonomy');
const data = await response.json();

// Converte o status customizado da API para HTTP padrão
const httpStatus = mapApiStatusToHttp(data.statusCode);

// Retorna resposta com status HTTP correto
return new Response(JSON.stringify(data), {
  status: httpStatus,
  headers: { 'Content-Type': 'application/json' }
});
```

**Mapeamento:**
- `100200` (SUCCESS) → `200` (OK)
- `100204` (EMPTY_RESULT) → `204` (No Content)
- `100404` (NOT_FOUND) → `404` (Not Found)
- `100422` (UNPROCESSABLE) → `404` (Not Found)
- `100400` (ERROR) → `400` (Bad Request)
- Outros → `500` (Internal Server Error)

### `isApiSuccess(apiStatus: number): boolean`

Verifica se o código de status representa sucesso.

**Exemplo:**
```typescript
import { isApiSuccess } from './api-constants';

const response = await apiClient.get('/taxonomy/find');

if (isApiSuccess(response.statusCode)) {
  console.log('Sucesso!', response.data);
} else {
  console.error('Erro na API:', response.message);
}
```

### `isApiError(apiStatus: number): boolean`

Verifica se o código de status representa erro.

**Exemplo:**
```typescript
import { isApiError, API_STATUS_CODES } from './api-constants';

const response = await apiClient.post('/taxonomy/create', payload);

if (isApiError(response.statusCode)) {
  // Trata diferentes tipos de erro
  switch (response.statusCode) {
    case API_STATUS_CODES.NOT_FOUND:
      throw new Error('Recurso não encontrado');
    case API_STATUS_CODES.ERROR:
      throw new Error(`Erro de validação: ${response.message}`);
    default:
      throw new Error('Erro desconhecido');
  }
}
```

## API Base URL Validation

As constantes de URL agora possuem nomenclatura melhorada e validação rigorosa:

### EXTERNAL_API_BASE_URL (API Externa - NestJS)
- **Em produção**: Lança erro se `EXTERNAL_API_BASE_URL` não estiver definida
- **Em desenvolvimento**: Mostra warning e usa `http://localhost:5558/api` como fallback
- **Uso**: Para requisições ao servidor NestJS (backend REST API)

### NEXT_APP_BASE_URL (Aplicação Next.js)
- **Em produção**: Lança erro se `NEXT_APP_BASE_URL` não estiver definida  
- **Em desenvolvimento**: Mostra warning e usa `http://localhost:5558` como fallback
- **Uso**: Para BetterAuth, API Route Handlers (/api/*) e referências internas

**Exemplo de uso correto:**
```typescript
import { EXTERNAL_API_BASE_URL, NEXT_APP_BASE_URL } from './api-constants';

// Requisição para API externa (NestJS)
const externalApiUrl = `${EXTERNAL_API_BASE_URL}${TAXONOMY_ENDPOINTS.FIND}`;
const response = await fetch(externalApiUrl);

// URL da aplicação Next.js para callbacks
const authCallback = `${NEXT_APP_BASE_URL}/api/auth/callback`;
```

## Environment Variables

### Variáveis de API Externa

Adicionadas ao `.env.example`:

```bash
# ===== API EXTERNA (Servidor NestJS) =====
EXTERNAL_API_BASE_URL=http://localhost:5558/api

# ===== APLICAÇÃO NEXT.JS =====  
NEXT_APP_BASE_URL=http://localhost:5558

# API Authentication Key
API_KEY=your_api_key_here_minimum_32_characters_long_secret

# API Timeouts (milliseconds)
API_TIMEOUT_CLIENT_DEFAULT=15000
API_TIMEOUT_CLIENT_UPLOAD=60000
API_TIMEOUT_SERVER_DEFAULT=30000
API_TIMEOUT_SERVER_LONG_RUNNING=120000
API_TIMEOUT_SERVER_UPLOAD=180000
```

### Variáveis de Contexto (Organization, Member, User)

⚠️ **Importante**: Estas variáveis devem ser usadas APENAS em desenvolvimento.

Em produção, estes valores devem vir da sessão do usuário:

```typescript
// ❌ Não fazer em produção
import { envs } from '@/core/config/envs';
const orgId = envs.ORGANIZATION_ID;

// ✅ Fazer em produção
import { getUserSession } from '@/lib/auth';
const { organizationId, memberId, userId } = await getUserSession();
```

## Telefone e WhatsApp - Validação Flexível

As validações de formato de telefone foram flexibilizadas:

**Antes:**
```typescript
// Aceitava apenas: (11) 1234-5678
NEXT_PUBLIC_COMPANY_PHONE: z.string().regex(/^\(\d{2}\) \d{4}-\d{4}$/)
```

**Agora:**
```typescript
// Aceita qualquer formato entre 10-20 caracteres
NEXT_PUBLIC_COMPANY_PHONE: z.string().min(10).max(20)
```

A formatação deve ser feita na camada de apresentação (UI), não na validação de configuração.
