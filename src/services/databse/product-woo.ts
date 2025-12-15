import { prisma } from "../../lib/prisma";

export type ProductWooExportListItem = {
  product_id: number;
  product_name: string | null;
  product_url: string | null;
};

export class ServiceValidationError extends Error {
  readonly name = "ServiceValidationError";
}

export class NotFoundError extends Error {
  readonly name = "NotFoundError";
}

function parseProductId(input: unknown): number {
  if (typeof input === "number") {
    if (!Number.isInteger(input) || input <= 0) {
      throw new ServiceValidationError(
        "product_id deve ser um inteiro positivo.",
      );
    }
    return input;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new ServiceValidationError("product_id é obrigatório.");
    }

    const asNumber = Number(trimmed);
    if (!Number.isInteger(asNumber) || asNumber <= 0) {
      throw new ServiceValidationError(
        "product_id deve ser um inteiro positivo.",
      );
    }
    return asNumber;
  }

  throw new ServiceValidationError("product_id inválido.");
}

export class ProductWooService {
  /**
   * Retorna até 100 produtos ainda não exportados.
   * Campos: product_id, product_name, product_url
   */
  async listNotExported(limit = 100): Promise<ProductWooExportListItem[]> {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const take = Math.min(safeLimit, 100);

    return prisma.tbl_product_woo.findMany({
      take,
      where: {
        flag_export: 0,
      },
      orderBy: {
        product_id: "asc",
      },
      select: {
        product_id: true,
        product_name: true,
        product_url: true,
      },
    });
  }

  /**
   * Retorna os detalhes (todos os campos) de um produto pelo product_id.
   */
  async getDetailsByProductId(productId: unknown) {
    const product_id = parseProductId(productId);

    const product = await prisma.tbl_product_woo.findUnique({
      where: { product_id },
    });

    if (!product) {
      throw new NotFoundError(
        `Produto não encontrado (product_id=${product_id}).`,
      );
    }

    return product;
  }

  /**
   * Atualiza a flag_export de um produto pelo product_id.
   */
  async updateExportFlag(productId: unknown, flagExport: number) {
    const product_id = parseProductId(productId);

    if (!Number.isInteger(flagExport)) {
      throw new ServiceValidationError("flag_export deve ser um inteiro.");
    }

    const product = await prisma.tbl_product_woo.update({
      where: { product_id },
      data: { flag_export: flagExport },
    });

    return product;
  }
}

export const productWooService = new ProductWooService();
