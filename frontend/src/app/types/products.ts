// types/product.ts
export type ProductImage = {
  id: string;
  image: string;
  alt_text?: string;
  is_primary?: boolean;
};

export type Product = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  discount?: number;
  final_price?: number;
  brand?: { id: number; name: string };
  categories?: { id: number; name: string }[];
  cover_image?: string;
  images?: ProductImage[];
  is_active?: boolean;
  is_featured?: boolean;
  colors?: string[];
  created_at?: string;
};