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
        image_main: "desc",
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

  /**
   * Atualiza os campos de imagem do servidor (srv_image_main, srv_image1 a srv_image5).
   * Apenas atualiza os campos que possuem valores (não-null e não-undefined).
   */
  async updateServerImages(
    productId: unknown,
    images: {
      srv_image_main?: string | null;
      srv_image1?: string | null;
      srv_image2?: string | null;
      srv_image3?: string | null;
      srv_image4?: string | null;
      srv_image5?: string | null;
    },
  ) {
    const product_id = parseProductId(productId);

    // Construir objeto de dados apenas com campos que têm valores
    const data: Record<string, unknown> = {};

    if (images.srv_image_main !== null && images.srv_image_main !== undefined) {
      data.srv_image_main = images.srv_image_main;
    }
    if (images.srv_image1 !== null && images.srv_image1 !== undefined) {
      data.srv_image1 = images.srv_image1;
    }
    if (images.srv_image2 !== null && images.srv_image2 !== undefined) {
      data.srv_image2 = images.srv_image2;
    }
    if (images.srv_image3 !== null && images.srv_image3 !== undefined) {
      data.srv_image3 = images.srv_image3;
    }
    if (images.srv_image4 !== null && images.srv_image4 !== undefined) {
      data.srv_image4 = images.srv_image4;
    }
    if (images.srv_image5 !== null && images.srv_image5 !== undefined) {
      data.srv_image5 = images.srv_image5;
    }

    // Se nenhum campo foi fornecido, lançar erro
    if (Object.keys(data).length === 0) {
      throw new ServiceValidationError(
        "Nenhuma imagem foi fornecida para atualização.",
      );
    }

    // Adicionar data/hora do update
    data.updatedat = new Date();

    const product = await prisma.tbl_product_woo.update({
      where: { product_id },
      data,
    });

    return product;
  }

  /**
   * Atualiza as imagens do servidor e marca o produto como exportado.
   * Define flag_export = 1 e exportdat = data atual.
   */
  async updateServerImagesAndMarkExported(
    productId: unknown,
    images: {
      srv_image_main?: string | null;
      srv_image1?: string | null;
      srv_image2?: string | null;
      srv_image3?: string | null;
      srv_image4?: string | null;
      srv_image5?: string | null;
    },
  ) {
    const product_id = parseProductId(productId);

    // Construir objeto de dados com campos de imagem e flags de exportação
    const data: Record<string, unknown> = {
      flag_export: 1,
      exportdat: new Date(),
      updatedat: new Date(),
    };

    // Adicionar campos de imagem que foram fornecidos
    if (images.srv_image_main !== null && images.srv_image_main !== undefined) {
      data.srv_image_main = images.srv_image_main;
    }
    if (images.srv_image1 !== null && images.srv_image1 !== undefined) {
      data.srv_image1 = images.srv_image1;
    }
    if (images.srv_image2 !== null && images.srv_image2 !== undefined) {
      data.srv_image2 = images.srv_image2;
    }
    if (images.srv_image3 !== null && images.srv_image3 !== undefined) {
      data.srv_image3 = images.srv_image3;
    }
    if (images.srv_image4 !== null && images.srv_image4 !== undefined) {
      data.srv_image4 = images.srv_image4;
    }
    if (images.srv_image5 !== null && images.srv_image5 !== undefined) {
      data.srv_image5 = images.srv_image5;
    }

    const product = await prisma.tbl_product_woo.update({
      where: { product_id },
      data,
    });

    return product;
  }
}

export const productWooService = new ProductWooService();
