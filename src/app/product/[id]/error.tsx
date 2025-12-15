"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página de detalhes:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">← Voltar para lista</Link>
        </Button>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Erro ao carregar detalhes do produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar os detalhes do produto. Por favor, tente
            novamente.
          </p>
          {error.message && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error.message}
            </p>
          )}
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
