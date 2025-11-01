// utils/image.ts
export const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000";

export const getProductImageSrc = (p: {
  cover_image?: string;
  images?: { image: string }[];
}): string => {
  const all = [
    p.cover_image,
    ...(p.images?.map(i => i.image) || [])
  ].filter(Boolean) as string[];

  if (!all.length) return "/images/fallback.jpg";
  const first = all[0];
  return first.startsWith("http") ? first : `${MEDIA_BASE}${first}`;
};
