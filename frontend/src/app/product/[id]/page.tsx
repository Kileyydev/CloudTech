// app/product/[id]/page.tsx
import ProductClient from './ProductClient';

// REQUIRED: generateStaticParams for static export
export async function generateStaticParams() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

  if (!API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_BASE not set. Skipping generateStaticParams.');
    return [];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products: { id: number }[] = await res.json();

    return products.map((p) => ({ id: p.id.toString() }));
  } catch (error) {
    console.error('generateStaticParams failed:', error);
    return [];
  }
}

// Server Component: Fetch product + pass to Client
export default async function ProductPage({ params }: { params: { id: string } }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
  if (!API_BASE_URL) throw new Error('API base URL missing');

  const res = await fetch(`${API_BASE_URL}/products/${params.id}/`, {
    cache: 'no-store',
  });

  if (!res.ok) return <div>Product not found</div>;

  const product = await res.json();

  return <ProductClient initialProduct={product} />;
}