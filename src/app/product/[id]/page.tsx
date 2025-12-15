import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductDetails, type ProductDetails } from "@/lib/data/products";
import { NotFoundError } from "@/services/databse/product-woo";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Indica que esta página usa dados dinâmicos (banco de dados)
  await connection();

  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId) || productId <= 0) {
    notFound();
  }

  let product: ProductDetails;
  try {
    product = await getProductDetails(productId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">← Voltar para lista</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes do Produto #{product.product_id}</CardTitle>
          <div className="flex gap-2">
            <Badge
              variant={product.flag_content === 1 ? "default" : "secondary"}
            >
              {product.flag_content === 1 ? "Com Conteúdo" : "Sem Conteúdo"}
            </Badge>
            <Badge
              variant={product.flag_export === 1 ? "default" : "secondary"}
            >
              {product.flag_export === 1 ? "Exportado" : "Não Exportado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <DetailRow label="ID" value={product.product_id} />
            <DetailRow label="Post ID" value={product.post_id} />
            <DetailRow label="Nome" value={product.product_name} />
            <DetailRow label="URL" value={product.product_url} isLink />
            <DetailRow label="Slug" value={product.slug} />
            <DetailRow
              label="Imagem Principal"
              value={product.image_main}
              isLink
            />
            <DetailRow label="Imagem 1" value={product.image1} isLink />
            <DetailRow label="Imagem 2" value={product.image2} isLink />
            <DetailRow label="Imagem 3" value={product.image3} isLink />
            <DetailRow label="Imagem 4" value={product.image4} isLink />
            <DetailRow label="Imagem 5" value={product.image5} isLink />
            <DetailRow
              label="Carta de Venda"
              value={product.carta_venda}
              isLong
            />
            <DetailRow label="Descrição" value={product.descricao} isLong />
            <DetailRow
              label="Data Export"
              value={product.exportdat?.toLocaleString("pt-BR")}
            />
            <DetailRow
              label="Criado em"
              value={product.createdat?.toLocaleString("pt-BR")}
            />
            <DetailRow
              label="Atualizado em"
              value={product.updatedat?.toLocaleString("pt-BR")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isLink = false,
  isLong = false,
}: {
  label: string;
  value: string | number | null | undefined;
  isLink?: boolean;
  isLong?: boolean;
}) {
  if (value === null || value === undefined) {
    return (
      <div className="flex gap-2">
        <span className="font-medium text-sm min-w-[120px]">{label}:</span>
        <span className="text-muted-foreground text-sm">—</span>
      </div>
    );
  }

  if (isLink && typeof value === "string") {
    return (
      <div className="flex gap-2">
        <span className="font-medium text-sm min-w-[120px]">{label}:</span>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm truncate max-w-md"
        >
          {value}
        </a>
      </div>
    );
  }

  if (isLong) {
    return (
      <div className="space-y-1">
        <span className="font-medium text-sm">{label}:</span>
        <p className="text-sm text-muted-foreground bg-muted p-2 rounded max-h-32 overflow-auto">
          {value || "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <span className="font-medium text-sm min-w-[120px]">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
