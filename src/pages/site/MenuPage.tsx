import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { categories } from '@/data/categories';
import { ProductCard } from '@/components/site/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

type SortKey = 'popular' | 'rating' | 'price-asc' | 'price-desc' | 'name';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A – Z' },
];

export function MenuPage() {
  const products = useRestaurantStore((s) => s.products);
  const [params, setParams] = useSearchParams();

  const category = params.get('category') ?? 'all';
  const query = params.get('q') ?? '';
  const sort = (params.get('sort') as SortKey) ?? 'popular';

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'sort' && value === 'popular')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    products.forEach((p) => (map[p.category] = (map[p.category] ?? 0) + 1));
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const inCategory = category === 'all' || p.category === category;
      const matches =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return inCategory && matches;
    });

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.soldCount - a.soldCount;
      }
    });
    // Sold-out dishes always sink to the bottom
    return sorted.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
  }, [products, category, query, sort]);

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-900 py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 size-72 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="container-x relative text-center">
          <p className="section-eyebrow text-brand-300">Our menu</p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-6xl">
            {activeCategory ? activeCategory.name : 'Everything we cook'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            {activeCategory
              ? activeCategory.description
              : 'Freshly prepared every day. Add your favourites to your pack and checkout in seconds.'}
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search jollof, suya, egusi, zobo…"
              className="h-14 w-full rounded-full border-0 bg-white pr-12 pl-14 text-ink-900 shadow-xl outline-none focus:ring-4 focus:ring-brand-400/40"
            />
            {query && (
              <button
                onClick={() => setParam('q', null)}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1.5 text-ink-500 hover:bg-cream-200"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-30 border-b border-ink-900/5 bg-cream-50/90 backdrop-blur-xl">
        <div className="container-x flex items-center gap-3 py-3">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {[{ id: 'all', name: 'All', emoji: '✨' }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => setParam('category', c.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                  category === c.id
                    ? 'bg-ink-900 text-white shadow'
                    : 'bg-white text-ink-700 ring-1 ring-ink-900/10 hover:ring-ink-900/30',
                )}
              >
                <span>{c.emoji}</span>
                {c.name}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px]',
                    category === c.id ? 'bg-white/20' : 'bg-cream-200 text-ink-600',
                  )}
                >
                  {counts[c.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <label className="relative hidden shrink-0 sm:block">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500" />
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="h-10 appearance-none rounded-full bg-white pr-4 pl-9 text-sm font-semibold ring-1 ring-ink-900/10 outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="container-x py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-600">
            Showing <strong className="text-ink-900">{filtered.length}</strong> dish{filtered.length === 1 ? '' : 'es'}
            {query && (
              <>
                {' '}
                for “<strong className="text-ink-900">{query}</strong>”
              </>
            )}
          </p>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="h-10 rounded-full bg-white px-3 text-sm font-semibold ring-1 ring-ink-900/10 outline-none sm:hidden"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No dishes found"
            description="We couldn't find anything matching your search. Try another word or browse all categories."
            action={
              <button onClick={() => setParams({}, { replace: true })} className="btn-primary">
                Clear filters
              </button>
            }
          />
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  );
}
