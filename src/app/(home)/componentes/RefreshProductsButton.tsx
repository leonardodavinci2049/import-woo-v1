"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RefreshProductsButtonProps {
  onRefresh?: () => void | Promise<void>;
}

export function RefreshProductsButton({
  onRefresh,
}: RefreshProductsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // Recarregar a página para atualizar a lista de produtos
      window.location.reload();
    } catch (error) {
      console.error("Erro ao recarregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
      <RefreshCw
        className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
      />
      {isLoading ? "Recarregando..." : "Recarregar"}
    </Button>
  );
}
