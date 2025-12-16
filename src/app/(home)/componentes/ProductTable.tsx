import type { ProductWooExportListItem } from "@/lib/data/products";
import { ProductActions } from "./ProductActions";
import { ProductExport } from "./ProductExport";

interface ProductTableProps {
  products: ProductWooExportListItem[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">ID</th>
            <th className="text-left p-3 font-medium">Nome</th>
            <th className="text-left p-3 font-medium">URL</th>
            <th className="text-left p-3 font-medium">Ações</th>
            <th className="text-left p-3 font-medium">Exportar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.product_id}
              className="border-b hover:bg-muted/30 transition-colors"
            >
              <td className="p-3 font-mono">{product.product_id}</td>
              <td className="p-3 max-w-xs truncate">
                {product.product_name || (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-3 max-w-sm">
                {product.product_url ? (
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate block max-w-sm"
                  >
                    {product.product_url}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-3">
                <ProductActions productId={product.product_id} />
              </td>
              <td className="p-3">
                <ProductExport productId={product.product_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
