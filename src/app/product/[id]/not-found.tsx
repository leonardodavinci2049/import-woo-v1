import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">← Voltar para lista</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produto não encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O produto que você está procurando não existe ou foi removido.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
