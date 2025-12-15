import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductList } from "./componentes/ProductList";

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Produtos - Não Exportados</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList />
        </CardContent>
      </Card>
    </div>
  );
}
