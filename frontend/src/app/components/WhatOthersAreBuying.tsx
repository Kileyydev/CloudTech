'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import FeaturedSection from './ProductSection';

interface Props {
  excludeProductId?: number;
}

const CACHE_KEY = 'others_buying_cache_v1';
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

const WhatOthersAreBuying = ({ excludeProductId }: Props) => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            const filtered = excludeProductId
              ? data.filter((p: any) => p.id !== excludeProductId)
              : data;
            setProducts(filtered.sort(() => 0.5 - Math.random()).slice(0, 10));
            setLoading(false);
            return;
          }
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
        if (!API_BASE_URL) throw new Error('API base URL not defined');

        const res = await fetch(`${API_BASE_URL}/products/?categories__slug=popularsection`, {
          next: { revalidate: 600 },
        });
        const data = await res.json();
        let list = Array.isArray(data) ? data : data.results || data.data || [];
        if (excludeProductId) {
          list = list.filter((p: any) => p.id !== excludeProductId);
        }

        // Shuffle and pick 10
        const randomProducts = list.sort(() => 0.5 - Math.random()).slice(0, 10);
        setProducts(randomProducts);

        // Cache the full list
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, [excludeProductId]);

  // Skeleton loading cards
  if (loading)
    return (
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={200} height={300} />
        ))}
      </Box>
    );

  if (!products.length) return null;

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto', py: 3 }}>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          py: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        <FeaturedSection productsProp={products} />
      </Box>
    </Box>
  );
};

export default WhatOthersAreBuying;
