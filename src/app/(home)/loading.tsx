import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header da tabela */}
            <Skeleton className="h-10 w-full" />

            {/* Linhas da tabela */}
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton list is static
              <Skeleton key={`skeleton-row-${i}`} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
