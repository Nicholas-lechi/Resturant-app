import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ChefHat,
  Clock,
  CreditCard,
  Heart,
  Leaf,
  ShieldCheck,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { categories } from '@/data/categories';
import { testimonials } from '@/data/testimonials';
import { images } from '@/data/images';
import { siteConfig, whatsappLink } from '@/config/site';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/site/ProductCard';
import { SectionHeading } from '@/components/site/SectionHeading';
import { SmartImage } from '@/components/ui/SmartImage';
import { Stars } from '@/components/ui/Rating';
import { WhatsAppIcon } from '@/components/site/SocialIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export function HomePage() {
  const products = useRestaurantStore((s) => s.products);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestseller = products.find((p) => p.id === 'p01') ?? products[0];

  return (
    <>
      <Hero bestsellerName={bestseller?.name} bestsellerPrice={bestseller?.price} />
      <TrustStrip />
      <Categories />

      <section className="container-x py-20">
        <SectionHeading
          eyebrow="Fresh from the pot"
          title={
            <>
              Our most-loved <span className="text-brand-500 italic">dishes</span>
            </>
          }
          description="Hand-picked favourites our customers order again and again."
          action={
            <Link to="/menu" className="btn-outline self-start sm:self-auto">
              Full menu <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      <PartyBanner />
      <HowItWorks />
      <About />
      <Testimonials />
      <FinalCta />
    </>
  );
}

function Hero({ bestsellerName, bestsellerPrice }: { bestsellerName?: string; bestsellerPrice?: number }) {
  return (
    <section className="relative overflow-hidden bg-cream-50">
      <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-brand-100/70 to-transparent" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[480px] rounded-full bg-brand-200/30 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm"
          >
            <span className="flex -space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            Rated 4.9 by 2,000+ happy customers
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Home-cooked flavour, <span className="relative text-brand-500 italic">delivered hot.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600"
          >
            Smoky party jollof, rich native soups, fire-grilled suya and chilled zobo — cooked fresh every day in
            Monica's kitchen and brought straight to your door.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/menu" className="btn-primary px-8 py-4 text-base">
              Order Now <ArrowRight className="size-5" />
            </Link>
            <Link to="/menu" className="btn-outline px-8 py-4 text-base">
              <UtensilsCrossed className="size-5" /> View Menu
            </Link>
          </motion.div>

          <motion.dl
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-ink-900/10 pt-8"
          >
            {[
              { value: '30+', label: 'Signature dishes' },
              { value: '35 min', label: 'Avg. delivery' },
              { value: '12k+', label: 'Orders served' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl font-bold text-ink-900">{stat.value}</dt>
                <dd className="mt-1 text-xs text-ink-500 sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute inset-6 rotate-6 rounded-[3rem] bg-brand-500" />
          <SmartImage
            src={images.heroSpread}
            alt="A spread of Monica's freshly cooked dishes"
            wrapperClassName="relative aspect-[4/5] rounded-[3rem] shadow-2xl ring-8 ring-white"
          />

          <motion.div
            className="absolute top-10 -left-4 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl sm:-left-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid size-11 place-items-center rounded-xl bg-brand-50">
              <Bike className="size-6 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-ink-500">Fast delivery</p>
              <p className="font-bold text-ink-900">{siteConfig.estimatedDelivery}</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-2 bottom-12 w-56 rounded-2xl bg-white p-4 shadow-xl sm:-right-8"
            style={{ animationDelay: '1.5s' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center justify-between">
              <span className="chip bg-brand-50 text-brand-700">🔥 Bestseller</span>
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </div>
            <p className="mt-2 font-display font-bold text-ink-900">{bestsellerName}</p>
            <div className="mt-1 flex items-center justify-between">
              <Stars value={5} />
              {bestsellerPrice !== undefined && (
                <span className="font-bold text-brand-600">{formatPrice(bestsellerPrice)}</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Leaf, label: 'Fresh ingredients daily' },
    { icon: ChefHat, label: 'Home-style recipes' },
    { icon: ShieldCheck, label: 'Secure online payment' },
    { icon: Bike, label: 'Hot & on-time delivery' },
  ];
  return (
    <div className="bg-ink-900">
      <div className="container-x grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-sm font-semibold text-white/90">
            <Icon className="size-5 shrink-0 text-brand-400" /> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Categories() {
  return (
    <section className="container-x pt-20">
      <SectionHeading
        eyebrow="Explore"
        title="What are you craving today?"
        align="center"
        description="From smoky rice to sweet endings — tap a category to dive in."
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="w-36 shrink-0 snap-start lg:w-auto"
          >
            <Link to={`/menu?category=${category.id}`} className="group block text-center">
              <div className="relative mx-auto aspect-square overflow-hidden rounded-full ring-4 ring-white shadow-soft transition group-hover:ring-brand-300">
                <SmartImage
                  src={category.image}
                  alt={category.name}
                  wrapperClassName="h-full w-full"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute right-1 bottom-1 grid size-9 place-items-center rounded-full bg-white text-lg shadow">
                  {category.emoji}
                </span>
              </div>
              <p className="mt-3 font-display font-bold text-ink-900 group-hover:text-brand-600">{category.name}</p>
              <p className="text-xs text-ink-500">{category.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PartyBanner() {
  return (
    <section className="container-x">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-900">
        <div className="absolute inset-0 opacity-40">
          <SmartImage src={images.diningRoom} alt="Party catering" wrapperClassName="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/20" />
        <div className="relative grid gap-8 px-8 py-14 sm:px-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="chip bg-brand-500 text-white">🎉 Events & Catering</span>
            <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Throwing a party? <br />
              <span className="text-brand-400 italic">We'll feed the crowd.</span>
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              Party packs of jollof, fried rice, small chops and grills for birthdays, weddings, office events and
              owambes. Tell us your guest count and we'll handle the rest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink("Hi Monica! I'd like a quote for event catering.")} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                <WhatsAppIcon className="size-5" /> Get a quote
              </a>
              <Link to="/menu?category=rice" className="btn border border-white/20 text-white hover:bg-white/10">
                See party packs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: UtensilsCrossed, title: 'Pick your meal', text: 'Browse the menu and add your favourite dishes, sides and drinks to your pack.' },
    { icon: CreditCard, title: 'Pay securely online', text: 'Checkout in seconds with your card. You get an instant order confirmation.' },
    { icon: ChefHat, title: 'We cook it fresh', text: 'Monica’s team starts cooking the moment your order lands in our kitchen.' },
    { icon: Bike, title: 'Delivered hot', text: 'Your food is packaged neatly and delivered to your door, still steaming.' },
  ];
  return (
    <section className="container-x py-24">
      <SectionHeading eyebrow="How it works" title="From our pot to your plate" align="center" />
      <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="absolute top-10 right-[12%] left-[12%] hidden h-px border-t-2 border-dashed border-brand-200 lg:block" />
        {steps.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative text-center"
          >
            <div className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-white shadow-soft">
              <Icon className="size-9 text-brand-500" />
              <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-6 text-xl font-bold">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-600">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-cream-100 py-24">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <SmartImage src={images.kitchen} alt="Inside Monica's kitchen" wrapperClassName="aspect-[3/4] rounded-[2rem]" />
            <div className="space-y-4 pt-12">
              <SmartImage src={images.soupBowl} alt="Native soup" wrapperClassName="aspect-square rounded-[2rem]" />
              <SmartImage src={images.skewers} alt="Suya" wrapperClassName="aspect-square rounded-[2rem]" />
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink-900 px-6 py-4 text-white shadow-xl">
            <BadgeCheck className="size-8 text-brand-400" />
            <div>
              <p className="font-display text-2xl font-bold">8+ years</p>
              <p className="text-xs text-white/60">of cooking with love</p>
            </div>
          </div>
        </div>

        <div>
          <p className="section-eyebrow">Our story</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Cooked like mama makes it — <span className="text-brand-500 italic">because she does.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-600">
            Monica's Kitchen started in a small home kitchen with one big pot of jollof and a simple promise: every
            plate should taste like it came from home. Today we cook for families, offices and parties across the
            city — but the recipes, the care and the generous portions haven't changed one bit.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Fresh market ingredients every morning',
              'No artificial shortcuts — real stock, real spice',
              'Hygienic kitchen & sealed packaging',
              'Friendly support on WhatsApp',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-medium text-ink-800">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-herb-500 text-white">
                  <BadgeCheck className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/menu" className="btn-dark mt-10">
            Taste the difference <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-x py-24">
      <SectionHeading eyebrow="Reviews" title="Our customers say it best" align="center" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card flex flex-col p-7"
          >
            <Stars value={t.rating} />
            <blockquote className="mt-4 flex-1 text-ink-700">“{t.quote}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-900/5 pt-5">
              <img src={t.avatar} alt="" className="size-11 rounded-full bg-brand-100" />
              <div>
                <p className="font-semibold text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-500">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-x pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full bg-white/10" />
        <div className="relative">
          <Clock className="mx-auto size-10 text-white/80" />
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Hungry? Your meal is 3 clicks away.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Order now and get it hot at your door in {siteConfig.estimatedDelivery}. Free delivery on orders above{' '}
            {formatPrice(siteConfig.freeDeliveryThreshold)}.
          </p>
          <Link to="/menu" className="btn mt-8 bg-white px-8 py-4 text-base text-brand-700 hover:bg-cream-100">
            Start your order <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
