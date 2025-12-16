"use client";

import { Button } from "@/components/ui/button";

interface ProductExportProps {
  productId: number;
}

export function ProductExport({ productId }: ProductExportProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        // Implementação do export será adicionada aqui
        console.log(`Exportando produto: ${productId}`);
      }}
    >
      Exportar
    </Button>
  );
}
