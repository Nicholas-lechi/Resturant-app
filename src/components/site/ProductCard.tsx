import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { cn, formatPrice } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { Rating } from "@/components/ui/Rating";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to your pack`, {
      description: product.sizes
        ? `Size: ${product.sizes[0].label}`
        : undefined,
      action: { label: "View pack", onClick: openCart },
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink-900/5 bg-white shadow-soft transition-shadow hover:shadow-xl">
      <Link to={`/menu/${product.slug}`} className="relative block">
        <SmartImage
          src={product.image}
          alt={product.name}
          wrapperClassName="aspect-[4/3]"
          className="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="chip bg-white/95 text-ink-900 shadow-sm backdrop-blur">
              {tag}
            </span>
          ))}
        </div>
        {!product.isAvailable && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/55">
            <span className="chip bg-white px-4 py-1.5 text-sm text-ink-900">
              Sold out today
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <Rating
            value={product.rating}
            reviews={product.reviews}
            className="text-xs"
          />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {product.prepTime}
          </span>
        </div>
        <Link to={`/menu/${product.slug}`}>
          <h3 className="mt-2 text-lg leading-snug font-bold transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-600">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {product.sizes && (
              <span className="block text-[11px] text-ink-500">From</span>
            )}
            <span className="font-display text-2xl font-bold text-ink-900">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.isAvailable}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full py-2.5 pr-4 pl-3 text-sm font-semibold transition-all active:scale-95",
              product.isAvailable
                ? "bg-ink-900 text-white hover:bg-brand-500 hover:shadow-glow"
                : "cursor-not-allowed bg-ink-900/10 text-ink-500",
            )}>
            <Plus className="size-4" /> Add to pack
          </button>
        </div>
      </div>
    </motion.article>
  );
}
