// app/product/[id]/page.tsx
import ProductClient from './ProductClient';

// Generate all product pages at build time
export async function generateStaticParams() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
  if (!API_BASE_URL) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      next: { revalidate: 0 }, // ← Forces static render
    });

    if (!res.ok) return [];

    const products: { id: string }[] = await res.json();
    return products.map((p) => ({ id: p.id }));
  } catch (error) {
    console.error('generateStaticParams failed:', error);
    return [];
  }
}

// Fetch product data at build time (STATIC)
export default async function ProductPage({ params }: { params: { id: string } }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
  if (!API_BASE_URL) {
    return <div>Missing API URL</div>;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products/${params.id}/`, {
      next: { revalidate: 0 }, // ← CRITICAL: Makes this static
    });

    if (!res.ok) {
      return <div>Product not found</div>;
    }

    const product = await res.json();
    return <ProductClient initialProduct={product} />;
  } catch (error) {
    return <div>Failed to load product</div>;
  }
}