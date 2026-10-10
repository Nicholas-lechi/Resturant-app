import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useCartStore } from "@/store/cartStore";
import { getCategory } from "@/data/categories";
import { siteConfig } from "@/config/site";
import { cn, formatPrice } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { Rating } from "@/components/ui/Rating";
import { SpiceLevel } from "@/components/ui/SpiceLevel";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductCard } from "@/components/site/ProductCard";
import { NotFoundPage } from "./NotFoundPage";

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const products = useRestaurantStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const product = products.find((p) => p.slug === slug);
  const [size, setSize] = useState<string | undefined>(
    product?.sizes?.[0]?.label,
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSize(product?.sizes?.[0]?.label);
    setQuantity(1);
  }, [product?.id, product?.sizes]);

  if (!product) return <NotFoundPage />;

  const category = getCategory(product.category);
  const sizeOption = product.sizes?.find((s) => s.label === size);
  const unitPrice = product.price + (sizeOption?.priceDelta ?? 0);
  const related = products
    .filter(
      (p) =>
        p.category === product.category && p.id !== product.id && p.isAvailable,
    )
    .slice(0, 4);

  const handleAdd = (checkout = false) => {
    addItem(product, quantity, size);
    if (checkout) {
      navigate("/checkout");
      return;
    }
    toast.success(`${quantity} × ${product.name} added to your pack`, {
      description: size,
      action: { label: "View pack", onClick: openCart },
    });
  };

  return (
    <>
      <div className="container-x pt-6">
        <nav className="flex items-center gap-1 text-sm text-ink-500">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link to="/menu" className="hover:text-ink-900">
            Menu
          </Link>
          <ChevronRight className="size-4" />
          <Link
            to={`/menu?category=${product.category}`}
            className="hover:text-ink-900">
            {category?.name}
          </Link>
          <ChevronRight className="size-4" />
          <span className="truncate font-medium text-ink-900">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 shadow backdrop-blur hover:bg-white"
            aria-label="Go back">
            <ChevronLeft className="size-5" />
          </button>
          <SmartImage
            src={product.image.replace("w=900", "w=1400")}
            alt={product.name}
            wrapperClassName="aspect-square rounded-[2.5rem] shadow-2xl lg:sticky lg:top-28"
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 grid place-items-center rounded-[2.5rem] bg-ink-950/50">
              <span className="chip bg-white px-5 py-2 text-base text-ink-900">
                Sold out today
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-50 text-brand-700">
              {category?.emoji} {category?.name}
            </span>
            {product.tags.map((tag) => (
              <span key={tag} className="chip bg-cream-200 text-ink-800">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Rating value={product.rating} reviews={product.reviews} />
            <span className="text-sm text-ink-500">
              {product.soldCount.toLocaleString()}+ ordered
            </span>
          </div>

          <p className="mt-6 font-display text-4xl font-bold text-brand-600">
            {formatPrice(unitPrice)}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            {product.description}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <Clock className="size-5 text-brand-500" />
              <p className="mt-2 text-xs text-ink-500">Prep time</p>
              <p className="font-semibold">{product.prepTime}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <Flame className="size-5 text-brand-500" />
              <p className="mt-2 text-xs text-ink-500">Spice level</p>
              <SpiceLevel level={product.spiceLevel} />
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <Leaf className="size-5 text-brand-500" />
              <p className="mt-2 text-xs text-ink-500">Calories</p>
              <p className="font-semibold">{product.calories} kcal</p>
            </div>
          </div>

          {product.sizes && (
            <div className="mt-8">
              <p className="label">Choose a size</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {product.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s.label)}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-3 text-left transition",
                      size === s.label
                        ? "border-brand-500 bg-brand-50"
                        : "border-ink-900/10 bg-white hover:border-ink-900/30",
                    )}>
                    <span className="block text-sm font-semibold text-ink-900">
                      {s.label}
                    </span>
                    <span className="text-sm text-ink-500">
                      {formatPrice(product.price + s.priceDelta)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="label">What's inside</p>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-ink-700 ring-1 ring-ink-900/10">
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-soft sm:flex-row sm:items-center">
            <QuantityStepper
              value={quantity}
              onChange={(q) => setQuantity(Math.max(1, q))}
            />
            <button
              onClick={() => handleAdd()}
              disabled={!product.isAvailable}
              className="btn-dark flex-1 py-3.5">
              <ShoppingBag className="size-5" /> Add to pack ·{" "}
              {formatPrice(unitPrice * quantity)}
            </button>
            <button
              onClick={() => handleAdd(true)}
              disabled={!product.isAvailable}
              className="btn-primary flex-1 py-3.5">
              Order now
            </button>
          </div>

          <ul className="mt-6 grid gap-3 text-sm text-ink-600 sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-herb-600" /> Delivered in{" "}
              {siteConfig.estimatedDelivery}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-herb-600" /> Secure card
              payment
            </li>
          </ul>
        </motion.div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-20">
          <h2 className="mb-8 text-3xl font-bold">You may also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
