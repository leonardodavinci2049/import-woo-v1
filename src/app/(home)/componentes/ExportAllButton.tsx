"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportAllButton() {
  return (
    <Button
      variant="default"
      onClick={() => {
        // Implementação será adicionada posteriormente
        console.log("Exportar todos os produtos");
      }}
    >
      <Upload className="mr-2 h-4 w-4" />
      Exportar Tudo
    </Button>
  );
}
