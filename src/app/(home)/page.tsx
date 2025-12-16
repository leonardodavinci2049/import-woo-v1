import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotExportedProducts } from "@/lib/data/products";
import { ExportAllButton } from "./componentes/ExportAllButton";
import { ProductTable } from "./componentes/ProductTable";
import { RefreshProductsButton } from "./componentes/RefreshProductsButton";

export default async function HomePage() {
  // Indica que esta página usa dados dinâmicos (banco de dados)
  await connection();

  const products = await getNotExportedProducts(100);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Painel de ações */}
      <div className="mb-8 flex items-center justify-between rounded-lg bg-muted p-4">
        <RefreshProductsButton />
        <ExportAllButton />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos Não Exportados</CardTitle>
          <Badge variant="outline">{products.length} produtos</Badge>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center">
              Nenhum produto não exportado encontrado.
            </div>
          ) : (
            <ProductTable products={products} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
