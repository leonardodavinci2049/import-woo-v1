"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { tbl_product_wooModel } from "../../../../generated/prisma/models";
import { getProductDetailsAction } from "../actions";

type ProductDetails = tbl_product_wooModel;

interface ProductDetailsDialogProps {
  productId: number;
}

export function ProductDetailsDialog({ productId }: ProductDetailsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleViewDetails = () => {
    setError(null);
    startTransition(async () => {
      const result = await getProductDetailsAction(productId);
      if (result.success) {
        setDetails(result.data);
        setIsOpen(true);
      } else {
        setError(result.error);
        setIsOpen(false);
      }
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setDetails(null);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        disabled={isPending}
      >
        {isPending ? "Carregando..." : "Ver Detalhes"}
      </Button>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {isOpen && details && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Detalhes do Produto #{productId}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DetailRow label="ID" value={details.product_id} />
                <DetailRow label="Post ID" value={details.post_id} />
                <DetailRow label="Nome" value={details.product_name} />
                <DetailRow label="URL" value={details.product_url} isLink />
                <DetailRow label="Slug" value={details.slug} />
                <DetailRow
                  label="Imagem Principal"
                  value={details.image_main}
                  isLink
                />
                <DetailRow label="Imagem 1" value={details.image1} isLink />
                <DetailRow label="Imagem 2" value={details.image2} isLink />
                <DetailRow label="Imagem 3" value={details.image3} isLink />
                <DetailRow label="Imagem 4" value={details.image4} isLink />
                <DetailRow label="Imagem 5" value={details.image5} isLink />
                <DetailRow
                  label="Carta de Venda"
                  value={details.carta_venda}
                  isLong
                />
                <DetailRow label="Descrição" value={details.descricao} isLong />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Flag Content:</span>
                  <Badge
                    variant={
                      details.flag_content === 1 ? "default" : "secondary"
                    }
                  >
                    {details.flag_content === 1
                      ? "Com Conteúdo"
                      : "Sem Conteúdo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Flag Export:</span>
                  <Badge
                    variant={
                      details.flag_export === 1 ? "default" : "secondary"
                    }
                  >
                    {details.flag_export === 1 ? "Exportado" : "Não Exportado"}
                  </Badge>
                </div>
                <DetailRow
                  label="Data Export"
                  value={details.exportdat?.toLocaleString("pt-BR")}
                />
                <DetailRow
                  label="Criado em"
                  value={details.createdat?.toLocaleString("pt-BR")}
                />
                <DetailRow
                  label="Atualizado em"
                  value={details.updatedat?.toLocaleString("pt-BR")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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
