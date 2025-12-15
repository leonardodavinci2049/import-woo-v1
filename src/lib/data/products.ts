import { cache } from "react";
import "server-only";
import {
  type ProductWooExportListItem,
  productWooService,
} from "@/services/databse/product-woo";
import type { tbl_product_wooModel } from "../../../generated/prisma/models";

export type { ProductWooExportListItem };
export type ProductDetails = tbl_product_wooModel;

/**
 * Busca produtos não exportados com cache automático do React.
 * O cache é válido durante uma única request, garantindo deduplicação.
 */
export const getNotExportedProducts = cache(
  async (limit = 100): Promise<ProductWooExportListItem[]> => {
    return productWooService.listNotExported(limit);
  },
);

/**
 * Busca detalhes de um produto pelo ID com cache automático do React.
 * O cache é válido durante uma única request, garantindo deduplicação.
 */
export const getProductDetails = cache(
  async (productId: number): Promise<ProductDetails> => {
    return productWooService.getDetailsByProductId(productId);
  },
);
