"use client";

import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportAllProducts } from "@/hooks/useExportAllProducts";
import { ExportProgressBar } from "./ExportProgressBar";

interface Product {
  product_id: number;
  [key: string]: unknown;
}

interface ExportAllButtonProps {
  products: Product[];
}

export function ExportAllButton({ products }: ExportAllButtonProps) {
  const { progress, exportAll, isExporting } = useExportAllProducts(products);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <ExportProgressBar
        progress={progress}
        isVisible={isExporting || progress.processed > 0}
      />

      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={exportAll}
          disabled={isExporting || products.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Exportar Todos ({products.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
