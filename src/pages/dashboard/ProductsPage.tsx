import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, LayoutGrid, List, Pencil, Plus, Search, Star, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useRestaurantStore } from '@/store/restaurantStore';
import { categories, getCategory } from '@/data/categories';
import { cn, formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ProductFormModal } from '@/components/dashboard/ProductFormModal';
import { SmartImage } from '@/components/ui/SmartImage';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductsPage() {
  const products = useRestaurantStore((s) => s.products);
  const toggleAvailability = useRestaurantStore((s) => s.toggleAvailability);
  const deleteProduct = useRestaurantStore((s) => s.deleteProduct);
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState<'all' | 'available' | 'soldout'>('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  // /dashboard/products?new=1 opens the "Add dish" form straight away
  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null);
      setFormOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (availability === 'all' || (availability === 'available' ? p.isAvailable : !p.isAvailable)) &&
        (!q || p.name.toLowerCase().includes(q)),
    );
  }, [products, query, category, availability]);

  const soldOut = products.filter((p) => !p.isAvailable).length;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };
  const onToggle = (p: Product) => {
    toggleAvailability(p.id);
    toast(p.isAvailable ? `${p.name} marked as sold out` : `${p.name} is available again`);
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} dishes on your menu · ${soldOut} sold out`}
        actions={
          <button onClick={openNew} className="btn-primary py-2.5">
            <Plus className="size-4" /> Add dish
          </button>
        }
      />

      <div className="rounded-2xl border border-ink-900/5 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-ink-900/5 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes" className="input py-2.5 pl-10" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input py-2.5 lg:w-52">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)} className="input py-2.5 lg:w-44">
            <option value="all">All status</option>
            <option value="available">Available</option>
            <option value="soldout">Sold out</option>
          </select>
          <div className="flex rounded-xl bg-cream-100 p-1 lg:ml-auto">
            {([['table', List], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} className={cn('rounded-lg p-2 transition', view === v ? 'bg-white shadow-sm' : 'text-ink-500')} aria-label={`${v} view`}>
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No dishes found" description="Try a different search or filter." />
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-cream-50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-semibold">Dish</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Price</th>
                  <th className="px-3 py-3 font-semibold">Sold</th>
                  <th className="px-3 py-3 font-semibold">Rating</th>
                  <th className="px-3 py-3 font-semibold">Available</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-cream-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <SmartImage src={p.image} alt={p.name} wrapperClassName={cn('size-12 shrink-0 rounded-xl', !p.isAvailable && 'opacity-50 grayscale')} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{p.name}</p>
                          <p className="max-w-xs truncate text-xs text-ink-500">{p.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-700">{getCategory(p.category)?.name}</td>
                    <td className="px-3 py-3 font-semibold">
                      {formatPrice(p.price)}
                      {p.sizes && <span className="block text-xs font-normal text-ink-500">{p.sizes.length} sizes</span>}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{p.soldCount.toLocaleString()}</td>
                    <td className="px-3 py-3"><span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" />{p.rating.toFixed(1)}</span></td>
                    <td className="px-3 py-3"><Toggle size="sm" checked={p.isAvailable} onChange={() => onToggle(p)} label="Available" /></td>
                    <td className="px-5 py-3">
                      <RowActions product={p} onEdit={openEdit} onDelete={setToDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-ink-900/5">
                <div className="relative">
                  <SmartImage src={p.image} alt={p.name} wrapperClassName={cn('aspect-[4/3]', !p.isAvailable && 'opacity-50 grayscale')} />
                  {!p.isAvailable && <span className="chip absolute top-2 left-2 bg-rose-600 text-white">Sold out</span>}
                </div>
                <div className="p-4">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-500">{getCategory(p.category)?.name} · {p.soldCount} sold</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold">{formatPrice(p.price)}</span>
                    <Toggle size="sm" checked={p.isAvailable} onChange={() => onToggle(p)} label="Available" />
                  </div>
                  <div className="mt-3 border-t border-ink-900/5 pt-3">
                    <RowActions product={p} onEdit={openEdit} onDelete={setToDelete} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} />

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        size="sm"
        title="Delete this dish?"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setToDelete(null)} className="btn-ghost">Cancel</button>
            <button
              onClick={() => {
                if (toDelete) {
                  deleteProduct(toDelete.id);
                  toast(`${toDelete.name} removed from the menu`);
                }
                setToDelete(null);
              }}
              className="btn bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete dish
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">
          <strong>{toDelete?.name}</strong> will be removed from your website immediately. Tip: use the “Available” switch instead if it's only sold out for today.
        </p>
      </Modal>
    </>
  );
}

function RowActions({ product, onEdit, onDelete }: { product: Product; onEdit: (p: Product) => void; onDelete: (p: Product) => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/menu/${product.slug}`} target="_blank" className="rounded-lg p-2 text-ink-500 hover:bg-cream-200 hover:text-ink-900" title="View on website">
        <ExternalLink className="size-4" />
      </Link>
      <button onClick={() => onEdit(product)} className="rounded-lg p-2 text-ink-500 hover:bg-cream-200 hover:text-ink-900" title="Edit">
        <Pencil className="size-4" />
      </button>
      <button onClick={() => onDelete(product)} className="rounded-lg p-2 text-ink-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
