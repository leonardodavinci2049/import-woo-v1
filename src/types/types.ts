export interface ProductCategory {
  ID_TAXONOMY?: number;
  PARENT_ID?: number;
  TAXONOMIA?: string;
  SLUG?: string | null;
  ORDEM?: number;
  LEVEL?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string; // SKU should be string (alphanumeric codes)
  image: string;
  normalPrice: number;
  promotionalPrice?: number;
  wholesalePrice: number; // NEW: VL_ATACADO
  corporatePrice: number; // NEW: VL_CORPORATIVO
  stock: number;
  category: string;
  brand: string; // Changed from optional to required (MARCA_NOME always available)
  type?: string; // NEW: TIPO field from API
  warrantyDays: number; // NEW: TEMPODEGARANTIA_DIA
  isPromotion: boolean; // NEW: PROMOCAO flag
  isImported: boolean; // NEW: IMPORTADO flag
  isNew: boolean; // NEW: LANCAMENTO flag
  categories?: ProductCategory[]; // NEW: Array of categories from CATEGORIAS field
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  subgroups?: Subgroup[];
}

export interface Subgroup {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

export type ViewMode = "grid" | "list";

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface FilterOptions {
  searchTerm: string;
  selectedCategory: string;
  selectedSubcategory?: string;
  selectedSubgroup?: string;
  selectedBrand?: string;
  selectedPtype?: string;
  onlyInStock: boolean;
  sortBy: SortOption;
}
