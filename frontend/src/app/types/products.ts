// src/app/types/products.ts

export type ProductImage = {
  id: string;
  image: string;
  alt_text?: string;
  is_primary?: boolean;
};

export type Color = {
  id: number;
  name: string;
  hex_code: string;
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

  // === NEW FIELDS ===
  storage_gb?: number;           // e.g., 1024 = 1TB
  ram_gb?: number;               // e.g., 16
  color?: Color;                 // { id: 1, name: "Rose Gold", hex_code: "#B76E79" }
  condition?: "new" | "ex_dubai"; // string literal

  // === LEGACY (optional) ===
  colors?: string[];             // keep for backward compatibility
  created_at?: string;
};