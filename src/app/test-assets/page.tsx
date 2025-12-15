import { Suspense } from "react";
import { ApiStatusDisplay } from "@/components/test-assets/api-status-display";
import { FileActionsSection } from "@/components/test-assets/file-actions-section";
import { FileGallerySection } from "@/components/test-assets/file-gallery-section";
import { FileListSection } from "@/components/test-assets/file-list-section";
import { FileUploadSection } from "@/components/test-assets/file-upload-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assetsApiService } from "@/services/api-assets";
import { isApiError } from "@/types/api-assets";

// Loading component for suspense boundaries
function LoadingCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Carregando...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Server Component for API Status (runs on server)
async function ApiStatusSection() {
  const statusResponse = await assetsApiService.getStatus();

  if (isApiError(statusResponse)) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          Erro ao conectar com a API: {statusResponse.message}
        </AlertDescription>
      </Alert>
    );
  }

  return <ApiStatusDisplay status={statusResponse} />;
}

/**
 * Test Assets Page - Interface de teste para API de Assets
 *
 * Esta página demonstra todos os endpoints da API externa de assets (srv-assets-v1)
 * Implementada como Server Component com componentes Client isolados para interatividade
 */
export default function TestAssetsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Teste da API de Assets</h1>
        <p className="text-muted-foreground">
          Interface de teste para o serviço externo de upload e gerenciamento de
          arquivos (srv-assets-v1)
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Servidor Externo</Badge>
          <Badge variant="secondary">API REST</Badge>
          <Badge variant="outline">Multipart Upload</Badge>
        </div>
      </div>

      {/* API Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Status da API</CardTitle>
          <CardDescription>
            Conectividade e informações do servidor de assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingCard title="Status da API" />}>
            <ApiStatusSection />
          </Suspense>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="list">Listar Arquivos</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivos</CardTitle>
              <CardDescription>
                Teste do endpoint POST /file/v1/upload-file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listar Arquivos</CardTitle>
              <CardDescription>
                Teste do endpoint POST /file/v1/list-files com filtros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileListSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de Entidade</CardTitle>
              <CardDescription>
                Teste do endpoint POST /file/v1/entity-gallery (máximo 7
                imagens)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileGallerySection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações de Arquivo</CardTitle>
              <CardDescription>
                Teste dos endpoints de buscar e deletar arquivos específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileActionsSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Technical Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            <strong>API Base URL:</strong> Configurada via
            EXTERNAL_API_ASSETS_URL
          </p>
          <p>
            <strong>Autenticação:</strong> Header x-api-key (configurado via
            EXTERNAL_API_ASSETS_KEY)
          </p>
          <p>
            <strong>Tipos Suportados:</strong> Images (JPG, PNG, GIF, WebP),
            Documents (PDF, DOC, DOCX), Spreadsheets (XLS, XLSX, CSV)
          </p>
          <p>
            <strong>Arquitetura:</strong> Server Components + Client Components
            isolados para interatividade
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
