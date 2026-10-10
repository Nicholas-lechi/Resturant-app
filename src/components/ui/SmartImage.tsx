import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Classes for the wrapper (size, rounding). The image fills the wrapper. */
  wrapperClassName?: string;
}

/**
 * Image with a shimmer while loading and a branded fallback if the URL fails,
 * so a broken link never shows the browser's broken-image icon.
 */
export function SmartImage({ src, alt, className, wrapperClassName, ...props }: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  return (
    <div className={cn('@container relative overflow-hidden bg-cream-200', wrapperClassName)}>
      {status === 'loading' && <div className="skeleton absolute inset-0" />}

      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-100 via-cream-100 to-brand-200 p-3 text-center">
          <UtensilsCrossed className="size-5 text-brand-500 @[120px]:size-7" />
          <span className="line-clamp-2 hidden font-display text-sm font-semibold text-ink-800 @[120px]:block">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...props}
        />
      )}
    </div>
  );
}
