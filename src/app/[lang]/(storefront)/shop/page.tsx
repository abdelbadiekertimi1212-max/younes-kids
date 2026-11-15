import Link from "next/link";
import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { kidsText } from "@/i18n/kids";
import { getCatalogFacets, getCategories, getProductCards } from "@/lib/data/catalog";
import { AGE_GROUPS, GENDERS, isAgeGroup, isGender, sizeInAgeGroup, sizeLabel, type AgeGroup, type Gender } from "@/lib/kids";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/shop/SortSelect";
import { cn, pickLocale } from "@/lib/utils";

const SORTS = ["newest", "price_asc", "price_desc", "bestselling"] as const;
type Sort = (typeof SORTS)[number];
type Search = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const price = (v: string | undefined) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 && n <= 10_000_000 ? Math.floor(n) : undefined;
};

/** Parsed, validated shop filters (anything unknown is ignored). */
function readFilters(sp: Search) {
  const category = first(sp.category)?.slice(0, 80) || undefined;
  const sort: Sort = SORTS.includes(first(sp.sort) as Sort) ? (first(sp.sort) as Sort) : "newest";
  const gender = isGender(first(sp.gender)) ? (first(sp.gender) as Gender) : undefined;
  const age = isAgeGroup(first(sp.age)) ? (first(sp.age) as AgeGroup) : undefined;
  const sizes = all(sp.size).map((s) => s.slice(0, 20)).slice(0, 30);
  const color = first(sp.color)?.slice(0, 40) || undefined;
  const minPrice = price(first(sp.min));
  const maxPrice = price(first(sp.max));
  const inStock = first(sp.stock) === "1";
  return { category, sort, gender, age, sizes, color, minPrice, maxPrice, inStock };
}
type Filters = ReturnType<typeof readFilters>;

function toQuery(f: Filters, overrides: Partial<Filters> = {}) {
  const v = { ...f, ...overrides };
  const p = new URLSearchParams();
  if (v.category) p.set("category", v.category);
  if (v.gender) p.set("gender", v.gender);
  if (v.age) p.set("age", v.age);
  for (const s of v.sizes) p.append("size", s);
  if (v.color) p.set("color", v.color);
  if (v.minPrice != null) p.set("min", String(v.minPrice));
  if (v.maxPrice != null) p.set("max", String(v.maxPrice));
  if (v.inStock) p.set("stock", "1");
  if (v.sort !== "newest") p.set("sort", v.sort);
  return p.toString();
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const f = readFilters(await searchParams);
  const dict = await getDictionary(lang);
  const k = kidsText[lang];
  const base = `/${lang}/shop`;
  const href = (o: Partial<Filters>) => {
    const qs = toQuery(f, o);
    return qs ? `${base}?${qs}` : base;
  };

  const [categories, facets] = await Promise.all([getCategories(), getCatalogFacets()]);

  // An age group narrows the sizes; with sizes picked too, both must match.
  let sizes = f.sizes;
  let impossible = false;
  if (f.age) {
    const ageSizes = facets.sizes.filter((s) => sizeInAgeGroup(s, f.age!));
    sizes = sizes.length ? sizes.filter((s) => ageSizes.includes(s)) : ageSizes;
    impossible = sizes.length === 0;
  }
  const products = impossible
    ? []
    : await getProductCards({
        categorySlug: f.category,
        sort: f.sort,
        limit: 60,
        gender: f.gender,
        sizes,
        color: f.color,
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        inStock: f.inStock,
      });

  const activeCount =
    (f.gender ? 1 : 0) + (f.age ? 1 : 0) + f.sizes.length + (f.color ? 1 : 0) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) + (f.inStock ? 1 : 0);
  const visibleSizes = f.age ? facets.sizes.filter((s) => sizeInAgeGroup(s, f.age!)) : facets.sizes;

  const chip = (active: boolean, tone = "brand") =>
    cn(
      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors",
      active
        ? tone === "sky"
          ? "border-sky bg-sky text-white"
          : tone === "candy"
            ? "border-candy bg-candy text-white"
            : "border-brand-dark bg-brand-dark text-white"
        : "border-line bg-white text-ink hover:bg-brand-light",
    );

  const filterForm = (
    <form action={base} method="get" className="space-y-5">
      {f.category && <input type="hidden" name="category" value={f.category} />}
      {f.gender && <input type="hidden" name="gender" value={f.gender} />}
      {f.age && <input type="hidden" name="age" value={f.age} />}
      {f.sort !== "newest" && <input type="hidden" name="sort" value={f.sort} />}

      {visibleSizes.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">{k.size}</legend>
          <div className="flex flex-wrap gap-2">
            {visibleSizes.map((s) => (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" name="size" value={s} defaultChecked={f.sizes.includes(s)} className="peer sr-only" />
                <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                  {sizeLabel(s, lang)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {facets.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">{k.color}</legend>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <input type="radio" name="color" value="" defaultChecked={!f.color} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-ink/20">
                {k.genders.all}
              </span>
            </label>
            {facets.colors.map((c) => (
              <label key={c.name} className="cursor-pointer">
                <input type="radio" name="color" value={c.name} defaultChecked={f.color === c.name} className="peer sr-only" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pe-3 ps-1.5 text-xs font-semibold text-ink peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-ink/20">
                  <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex ?? "#e5e7eb" }} aria-hidden />
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">{k.price}</legend>
        <div className="flex items-center gap-2">
          <input type="number" name="min" min={0} inputMode="numeric" placeholder={facets.priceMin ? String(facets.priceMin) : k.min} defaultValue={f.minPrice} aria-label={k.min} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink" />
          <span className="text-muted">–</span>
          <input type="number" name="max" min={0} inputMode="numeric" placeholder={facets.priceMax ? String(facets.priceMax) : k.max} defaultValue={f.maxPrice} aria-label={k.max} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink" />
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="stock" value="1" defaultChecked={f.inStock} className="size-4 accent-[var(--color-ink)]" />
        {k.inStock}
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className="flex-1 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01]">
          {k.showResults}
        </button>
        {activeCount > 0 && (
          <Link href={href({ gender: undefined, age: undefined, sizes: [], color: undefined, minPrice: undefined, maxPrice: undefined, inStock: false })} className="text-sm font-semibold text-muted underline-offset-4 hover:underline">
            {k.reset}
          </Link>
        )}
      </div>
    </form>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-bold text-ink">{dict.nav.shop}</h1>

      {/* Category chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <Link href={href({ category: undefined })} className={chip(!f.category)}>
          {dict.shop.all}
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug })} className={chip(f.category === c.slug)}>
            {pickLocale(c, "name", lang)}
          </Link>
        ))}
      </div>

      {/* Gender + age chips */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <Link href={href({ gender: undefined })} className={chip(!f.gender, "candy")}>
          {k.genders.all}
        </Link>
        {GENDERS.filter((g) => g !== "unisex").map((g) => (
          <Link key={g} href={href({ gender: g })} className={chip(f.gender === g, "candy")}>
            {k.genders[g]}
          </Link>
        ))}
        <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
        <Link href={href({ age: undefined, sizes: [] })} className={chip(!f.age, "sky")}>
          {k.ageGroups.all}
        </Link>
        {(Object.keys(AGE_GROUPS) as AgeGroup[]).map((a) => (
          <Link key={a} href={href({ age: a, sizes: [] })} className={chip(f.age === a, "sky")}>
            {k.ageGroups[a]} <span className="text-xs font-semibold opacity-75">· {k.ageHints[a]}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Filters: collapsible on phones, sidebar on desktop */}
        <aside>
          <details className="group rounded-2xl border border-line bg-white p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ink">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden />
                {k.filters}
                {activeCount > 0 && <span className="rounded-full bg-brand px-2 text-xs text-ink">{activeCount}</span>}
              </span>
              <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>▾</span>
            </summary>
            <div className="mt-4">{filterForm}</div>
          </details>
          <div className="sticky top-24 hidden rounded-2xl border border-line bg-white p-4 lg:block">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <SlidersHorizontal className="size-4" aria-hidden />
              {k.filters}
            </p>
            {filterForm}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">
              {products.length} {dict.shop.results}
            </span>
            <SortSelect lang={lang} dict={dict} current={f.sort} query={toQuery(f, { sort: "newest" })} />
          </div>

          <div className="mt-5">
            {products.length ? (
              <ProductGrid products={products} lang={lang} dict={dict} />
            ) : (
              <p className="rounded-2xl bg-cream py-20 text-center text-muted">
                {activeCount > 0 || f.category ? k.noResults : dict.shop.empty}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
