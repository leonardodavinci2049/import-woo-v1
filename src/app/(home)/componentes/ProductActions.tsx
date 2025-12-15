"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  productId: number;
}

export function ProductActions({ productId }: ProductActionsProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/product/${productId}`}>Ver Detalhes</Link>
    </Button>
  );
}
