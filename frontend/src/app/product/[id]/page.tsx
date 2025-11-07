// app/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

type ProductT = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  discount?: number;
  final_price?: number;
  cover_image?: string;
  images?: { id: string; image: string }[];
  colors?: string[];
  brand?: { id: number; name: string };
  is_active?: boolean;
};

// REQUIRED for static export
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/products/`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = await res.json();
    const products = Array.isArray(data) ? data : data.results || [];

    return products
      .filter((p: ProductT) => p.is_active)
      .map((p: ProductT) => ({
        id: p.id,
      }));
  } catch (err) {
    console.error('Failed to generate static params:', err);
    return [];
  }
}

// Server Component: MUST await params
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // AWAIT HERE

  try {
    const [productRes, relatedRes] = await Promise.all([
      fetch(`${API_BASE}/products/${id}/`, { cache: 'no-store' }),
      fetch(`${API_BASE}/products/`, { cache: 'no-store' }),
    ]);

    if (!productRes.ok) throw new Error('Product not found');
    const product: ProductT = await productRes.json();

    if (!product.is_active) throw new Error('Product not active');

    const relatedData = await relatedRes.json();
    const allProducts = Array.isArray(relatedData) ? relatedData : relatedData.results || [];
    const relatedProducts = allProducts
      .filter((p: ProductT) => p.id !== id && p.is_active)
      .slice(0, 6);

    return (
      <ProductClient
        product={product}
        relatedProducts={relatedProducts}
        initialWishlist={[]}
      />
    );
  } catch (err) {
    notFound();
  }
}