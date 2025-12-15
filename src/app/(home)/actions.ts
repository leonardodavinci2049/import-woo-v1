"use server";

import {
  NotFoundError,
  type ProductWooExportListItem,
  productWooService,
  ServiceValidationError,
} from "@/services/databse/product-woo";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listNotExportedAction(
  limit = 100,
): Promise<ActionResult<ProductWooExportListItem[]>> {
  try {
    const products = await productWooService.listNotExported(limit);
    return { success: true, data: products };
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return { success: false, error: "Erro ao listar produtos não exportados." };
  }
}

export async function getProductDetailsAction(
  productId: unknown,
): Promise<
  ActionResult<
    Awaited<ReturnType<typeof productWooService.getDetailsByProductId>>
  >
> {
  try {
    const product = await productWooService.getDetailsByProductId(productId);
    return { success: true, data: product };
  } catch (error) {
    if (error instanceof ServiceValidationError) {
      return { success: false, error: error.message };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: error.message };
    }
    console.error("Erro ao buscar detalhes do produto:", error);
    return { success: false, error: "Erro ao buscar detalhes do produto." };
  }
}
