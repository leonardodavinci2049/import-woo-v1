"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWooExportListItem } from "@/services/databse/product-woo";
import { type ActionResult, listNotExportedAction } from "../actions";
import { ProductDetailsDialog } from "./ProductDetailsDialog";

export function ProductList() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<
    ProductWooExportListItem[]
  > | null>(null);

  const handleLoadProducts = () => {
    startTransition(async () => {
      const data = await listNotExportedAction(100);
      setResult(data);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={handleLoadProducts} disabled={isPending}>
          {isPending ? "Carregando..." : "Carregar 100 Produtos"}
        </Button>
        {result?.success && (
          <Badge variant="outline">
            {result.data.length} produtos carregados
          </Badge>
        )}
      </div>

      {result && !result.success && (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          {result.error}
        </div>
      )}

      {result?.success && result.data.length === 0 && (
        <div className="text-muted-foreground p-4 text-center">
          Nenhum produto não exportado encontrado.
        </div>
      )}

      {result?.success && result.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">URL</th>
                <th className="text-left p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 font-mono">{product.product_id}</td>
                  <td className="p-3 max-w-xs truncate">
                    {product.product_name || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 max-w-sm">
                    {product.product_url ? (
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate block max-w-sm"
                      >
                        {product.product_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <ProductDetailsDialog productId={product.product_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
