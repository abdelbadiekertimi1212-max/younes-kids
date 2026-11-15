import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isNewProduct, sortSizes, type Gender } from "@/lib/kids";
import type {
  Category,
  DeliveryFee,
  Product,
  ProductImage,
  ProductWithRelations,
} from "@/lib/types";

const CARD_FIELDS =
  "id, slug, name_ar, name_fr, name_en, price, compare_at_price, currency, total_stock, is_best_seller, is_featured, created_at, category_id, images:product_images(url, position)";

export type ProductCardData = Pick<
  Product,
  | "id"
  | "slug"
  | "name_ar"
  | "name_fr"
  | "name_en"
  | "price"
  | "compare_at_price"
  | "currency"
  | "total_stock"
  | "is_best_seller"
  | "is_featured"
  | "created_at"
  | "category_id"
> & { images: Pick<ProductImage, "url" | "position">[]; is_new?: boolean };

function sortImages<T extends { images?: { position: number }[] }>(p: T): T {
  if (p.images) p.images = [...p.images].sort((a, b) => a.position - b.position);
  return p;
}

/** Card shape for the storefront: images in order, "new" flag, no filter helpers. */
function toCard(row: ProductCardData & { filter_variants?: unknown }, now: number): ProductCardData {
  const { filter_variants: _drop, ...card } = row;
  void _drop;
  return { ...sortImages(card), is_new: isNewProduct(card.created_at, now) };
}

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });
    return (data as Category[] | null) ?? [];
  },
  ["categories-v2"],
  { revalidate: 300, tags: ["catalog"] },
);

type CardQuery = {
  categorySlug?: string;
  categoryId?: string;
  featured?: boolean;
  bestSeller?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "bestselling";
  limit?: number;
  excludeId?: string;
  /** Kids filters (shop page). Girls/boys also include unisex items. */
  gender?: Gender;
  /** Any of these sizes, in stock. */
  sizes?: string[];
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export const getProductCards = unstable_cache(
  async (opts: CardQuery = {}): Promise<ProductCardData[]> => {
    const supabase = createPublicClient();
    const variantFilter = !!(opts.sizes?.length || opts.color);
    let q = supabase
      .from("products")
      .select(variantFilter ? `${CARD_FIELDS}, filter_variants:product_variants!inner(size, color, stock)` : CARD_FIELDS)
      .eq("is_active", true);

    if (opts.sizes?.length) q = q.in("filter_variants.size", opts.sizes).gt("filter_variants.stock", 0);
    if (opts.color) q = q.eq("filter_variants.color", opts.color);
    if (opts.gender) q = opts.gender === "unisex" ? q.eq("gender", "unisex") : q.in("gender", [opts.gender, "unisex"]);
    if (opts.minPrice != null) q = q.gte("price", opts.minPrice);
    if (opts.maxPrice != null) q = q.lte("price", opts.maxPrice);
    if (opts.inStock) q = q.gt("total_stock", 0);

    if (opts.featured) q = q.eq("is_featured", true);
    if (opts.bestSeller) q = q.eq("is_best_seller", true);
    if (opts.excludeId) q = q.neq("id", opts.excludeId);
    if (opts.categoryId) q = q.eq("category_id", opts.categoryId);

    if (opts.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", opts.categorySlug)
        .maybeSingle();
      if (!cat?.id) return [];
      q = q.eq("category_id", cat.id);
    }

    switch (opts.sort) {
      case "price_asc":
        q = q.order("price", { ascending: true });
        break;
      case "price_desc":
        q = q.order("price", { ascending: false });
        break;
      case "bestselling":
        q = q.order("sold_count", { ascending: false });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }
    if (opts.limit) q = q.limit(opts.limit);

    const { data } = await q;
    const now = Date.now();
    return ((data as ProductCardData[] | null) ?? []).map((p) => toCard(p, now));
  },
  ["product-cards-v3"],
  { revalidate: 120, tags: ["catalog"] },
);

export const getFeatured = (limit = 8) =>
  getProductCards({ featured: true, limit });
export const getBestSellers = (limit = 8) =>
  getProductCards({ bestSeller: true, sort: "bestselling", limit });
export const getNewArrivals = (limit = 8) =>
  getProductCards({ sort: "newest", limit });

/** "You may also like": same category first, then best sellers, never itself. */
export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 8) {
  const same = categoryId ? await getProductCards({ categoryId, excludeId: productId, sort: "bestselling", limit }) : [];
  if (same.length >= limit) return same;
  const more = await getProductCards({ excludeId: productId, sort: "bestselling", limit: limit * 2 });
  const seen = new Set(same.map((p) => p.id));
  return [...same, ...more.filter((p) => !seen.has(p.id))].slice(0, limit);
}

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductWithRelations | null> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select(
        "*, images:product_images(*), variants:product_variants(*), category:categories(*)",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    const p = data as ProductWithRelations;
    p.images = [...(p.images ?? [])].sort((a, b) => a.position - b.position);
    p.variants = [...(p.variants ?? [])].sort((a, b) => a.position - b.position);
    return p;
  },
  ["product-by-slug-v2"],
  { revalidate: 120, tags: ["catalog"] },
);

export const searchProducts = unstable_cache(
  async (query: string): Promise<ProductCardData[]> => {
    const clean = query.replace(/[,()*%]/g, " ").trim();
    if (!clean) return [];
    const supabase = createPublicClient();
    const term = `%${clean}%`;
    const { data } = await supabase
      .from("products")
      .select(CARD_FIELDS)
      .eq("is_active", true)
      .or(`name_ar.ilike.${term},name_fr.ilike.${term},name_en.ilike.${term}`)
      .limit(40);
    return ((data as ProductCardData[] | null) ?? []).map(sortImages);
  },
  ["search-products-v2"],
  { revalidate: 60, tags: ["catalog"] },
);

export type DeliverySettings = { freeThreshold: number; daysMin: number; daysMax: number };

/** Public delivery settings (free-shipping threshold, usual delay). */
export const getDeliverySettings = unstable_cache(
  async (): Promise<DeliverySettings> => {
    const supabase = createPublicClient();
    const { data } = await supabase.from("settings").select("value").eq("key", "delivery").maybeSingle();
    const v = (data?.value ?? {}) as Record<string, unknown>;
    const n = (x: unknown, d: number) => (Number.isFinite(Number(x)) ? Number(x) : d);
    return {
      freeThreshold: Math.max(0, n(v.free_threshold, 0)),
      daysMin: n(v.default_days_min, 2),
      daysMax: n(v.default_days_max, 5),
    };
  },
  ["delivery-settings-v1"],
  { revalidate: 600, tags: ["settings"] },
);

export const getDeliveryFees = unstable_cache(
  async (): Promise<DeliveryFee[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("delivery_fees")
      .select("*")
      .eq("is_active", true)
      .order("wilaya_code", { ascending: true });
    return (data as DeliveryFee[] | null) ?? [];
  },
  ["delivery-fees-v2"],
  { revalidate: 600, tags: ["settings"] },
);

export type CatalogFacets = {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  priceMin: number;
  priceMax: number;
};

/** Sizes and colours in stock across the active catalog, plus the price range (shop filters). */
export const getCatalogFacets = unstable_cache(
  async (): Promise<CatalogFacets> => {
    const supabase = createPublicClient();
    const [{ data: variants }, { data: prices }] = await Promise.all([
      supabase
        .from("product_variants")
        .select("size, color, color_hex, product:products!inner(is_active)")
        .eq("product.is_active", true)
        .eq("is_active", true)
        .gt("stock", 0)
        .limit(5000),
      supabase.from("products").select("price").eq("is_active", true).limit(5000),
    ]);
    const rows = (variants as { size: string | null; color: string | null; color_hex: string | null }[] | null) ?? [];
    const colors = new Map<string, string | null>();
    for (const v of rows) if (v.color && !colors.has(v.color)) colors.set(v.color, v.color_hex);
    const list = ((prices as { price: number }[] | null) ?? []).map((p) => Number(p.price));
    return {
      sizes: sortSizes(rows.map((v) => v.size).filter((x): x is string => !!x)),
      colors: [...colors].map(([name, hex]) => ({ name, hex })),
      priceMin: list.length ? Math.min(...list) : 0,
      priceMax: list.length ? Math.max(...list) : 0,
    };
  },
  ["catalog-facets-v1"],
  { revalidate: 300, tags: ["catalog"] },
);
