import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ImagePlus, Link2, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CategoryId, Product, SizeOption } from '@/types';
import { categories } from '@/data/categories';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn, slugify } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { SmartImage } from '@/components/ui/SmartImage';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface FormState {
  name: string;
  category: CategoryId;
  price: string;
  shortDescription: string;
  description: string;
  image: string;
  prepTime: string;
  spiceLevel: 0 | 1 | 2 | 3;
  calories: string;
  ingredients: string;
  tags: string;
  sizes: { label: string; priceDelta: string }[];
  isFeatured: boolean;
  isPopular: boolean;
  isAvailable: boolean;
}

const blank: FormState = {
  name: '',
  category: 'rice',
  price: '',
  shortDescription: '',
  description: '',
  image: '',
  prepTime: '20 min',
  spiceLevel: 1,
  calories: '',
  ingredients: '',
  tags: '',
  sizes: [],
  isFeatured: false,
  isPopular: false,
  isAvailable: true,
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    category: p.category,
    price: String(p.price),
    shortDescription: p.shortDescription,
    description: p.description,
    image: p.image,
    prepTime: p.prepTime,
    spiceLevel: p.spiceLevel,
    calories: String(p.calories),
    ingredients: p.ingredients.join(', '),
    tags: p.tags.join(', '),
    sizes: (p.sizes ?? []).map((s) => ({ label: s.label, priceDelta: String(s.priceDelta) })),
    isFeatured: p.isFeatured,
    isPopular: p.isPopular,
    isAvailable: p.isAvailable,
  };
}

/** Resize an uploaded photo so it fits comfortably in browser storage. */
function compressImage(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({ open, onClose, product }: Props) {
  const addProduct = useRestaurantStore((s) => s.addProduct);
  const updateProduct = useRestaurantStore((s) => s.updateProduct);
  const [form, setForm] = useState<FormState>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      setForm(product ? toForm(product) : blank);
      setErrors({});
      setShowUrl(false);
    }
  }, [open, product]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');
    setUploading(true);
    try {
      set('image', await compressImage(file));
    } catch {
      toast.error('Could not read that image');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = 'Name is required';
    if (!(Number(form.price) > 0)) errs.price = 'Enter a valid price';
    if (form.shortDescription.trim().length < 5) errs.shortDescription = 'Add a short description';
    if (!form.image) errs.image = 'Add a photo of the dish';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const sizes: SizeOption[] = form.sizes
      .filter((s) => s.label.trim())
      .map((s) => ({ label: s.label.trim(), priceDelta: Number(s.priceDelta) || 0 }));

    const data = {
      name: form.name.trim(),
      slug: product?.slug ?? `${slugify(form.name)}-${Date.now().toString(36).slice(-4)}`,
      category: form.category,
      price: Math.round(Number(form.price) * 100) / 100,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim() || form.shortDescription.trim(),
      image: form.image,
      prepTime: form.prepTime.trim() || '20 min',
      spiceLevel: form.spiceLevel,
      calories: Number(form.calories) || 0,
      ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: sizes.length ? sizes : undefined,
      isFeatured: form.isFeatured,
      isPopular: form.isPopular,
      isAvailable: form.isAvailable,
    };

    try {
      if (isEdit && product) {
        updateProduct(product.id, data);
        toast.success(`${data.name} updated`, { description: 'Changes are live on the website.' });
      } else {
        addProduct(data);
        toast.success(`${data.name} added to the menu`, { description: 'It now appears on the website.' });
      }
      onClose();
    } catch {
      toast.error('Browser storage is full — try a smaller image.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={isEdit ? 'Edit dish' : 'Add a new dish'}
      description={isEdit ? 'Update the details customers see on the menu.' : 'Fill in the details — it goes live on the website instantly.'}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" form="product-form" className="btn-primary">{isEdit ? 'Save changes' : 'Add to menu'}</button>
        </div>
      }
    >
      <form id="product-form" onSubmit={submit} className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Image */}
        <div>
          <span className="label">Photo</span>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition',
              errors.image ? 'border-rose-300 bg-rose-50' : 'border-ink-900/15 bg-cream-50 hover:border-brand-400',
            )}
          >
            {form.image ? (
              <>
                <SmartImage src={form.image} alt={form.name || 'Dish photo'} wrapperClassName="absolute inset-0" />
                <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">Change</span>
              </>
            ) : uploading ? (
              <Loader2 className="size-8 animate-spin text-brand-500" />
            ) : (
              <div className="p-4 text-center">
                <ImagePlus className="mx-auto size-8 text-brand-500" />
                <p className="mt-2 text-sm font-semibold">Click or drop a photo</p>
                <p className="text-xs text-ink-500">JPG or PNG</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          {errors.image && <p className="mt-1 text-xs text-rose-600">{errors.image}</p>}
          <button type="button" onClick={() => setShowUrl((s) => !s)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-ink-900">
            <Link2 className="size-3.5" /> or paste an image URL
          </button>
          {showUrl && (
            <input className="input mt-2 py-2 text-xs" placeholder="https://…" value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => set('image', e.target.value)} />
          )}

          <div className="mt-6 space-y-3 rounded-2xl bg-cream-50 p-4">
            {([
              ['isAvailable', 'Available today'],
              ['isFeatured', 'Feature on homepage'],
              ['isPopular', 'Mark as popular'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between text-sm font-medium">
                {label}
                <Toggle size="sm" checked={form[key]} onChange={(v) => set(key, v)} label={label} />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <Field label="Dish name" error={errors.name} className="sm:col-span-2">
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Smoky Party Jollof" />
          </Field>
          <Field label="Category">
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Base price (USD)" error={errors.price}>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-500">$</span>
              <input className="input pl-8" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" />
            </div>
          </Field>
          <Field label="Short description" error={errors.shortDescription} className="sm:col-span-2">
            <input className="input" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="One line shown on the menu card" />
          </Field>
          <Field label="Full description" className="sm:col-span-2">
            <textarea rows={3} className="input resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Shown on the dish page" />
          </Field>
          <Field label="Prep time">
            <input className="input" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} placeholder="20 min" />
          </Field>
          <Field label="Calories (kcal)">
            <input className="input" inputMode="numeric" value={form.calories} onChange={(e) => set('calories', e.target.value.replace(/\D/g, ''))} placeholder="650" />
          </Field>
          <Field label="Spice level" className="sm:col-span-2">
            <div className="grid grid-cols-4 gap-2">
              {(['None', 'Mild', 'Medium', 'Hot'] as const).map((label, i) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => set('spiceLevel', i as 0 | 1 | 2 | 3)}
                  className={cn('rounded-xl border-2 py-2 text-sm font-semibold transition', form.spiceLevel === i ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-900/10')}
                >
                  {'🌶'.repeat(i) || '—'} <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Ingredients (comma separated)" className="sm:col-span-2">
            <input className="input" value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} placeholder="Rice, Tomato, Pepper, Chicken" />
          </Field>
          <Field label="Tags (comma separated)" className="sm:col-span-2">
            <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Bestseller, Spicy, New" />
          </Field>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="label mb-0">Size options (optional)</span>
              <button type="button" onClick={() => set('sizes', [...form.sizes, { label: '', priceDelta: '0' }])} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                <Plus className="size-4" /> Add size
              </button>
            </div>
            {form.sizes.length === 0 && <p className="mt-2 text-xs text-ink-500">No sizes — the dish is sold at the base price.</p>}
            <div className="mt-2 space-y-2">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input py-2" placeholder="e.g. Large" value={s.label} onChange={(e) => set('sizes', form.sizes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <div className="relative w-36 shrink-0">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-ink-500">+$</span>
                    <input className="input py-2 pl-8" inputMode="decimal" value={s.priceDelta} onChange={(e) => set('sizes', form.sizes.map((x, j) => (j === i ? { ...x, priceDelta: e.target.value.replace(/[^\d.]/g, '') } : x)))} />
                  </div>
                  <button type="button" onClick={() => set('sizes', form.sizes.filter((_, j) => j !== i))} className="rounded-xl px-3 text-ink-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove size">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
