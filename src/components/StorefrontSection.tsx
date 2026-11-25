import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Product, ProductCartItem, ProductCategory } from '../types/beauty';
import { formatNaira } from '../utils/format';
import { ImageWithFallback } from './ImageWithFallback';
import {
  BRAND_NAME,
  CLIENT_TESTIMONIALS,
  FOUNDER_NAME,
  STUDIO_ADDRESS,
  STUDIO_EMAIL,
  STUDIO_HOURS,
  WHATSAPP_DISPLAY,
  WHATSAPP_RAW,
} from '../data/seedData';

interface StorefrontSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAddProduct: (item: ProductCartItem) => void;
  onGoToBooking: () => void;
  selectedCategory: 'All' | ProductCategory;
  onChangeCategory: (cat: 'All' | ProductCategory) => void;
  activeSubFilter: string;
  onChangeSubFilter: (sub: string) => void;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'stock';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Wigs',
  'Press-On Nails',
  'Accessories',
];

const WIG_SUBFILTERS = [
  'All',
  'Glueless',
  'Bone Straight',
  'Bob Wigs',
  'Raw Wavy',
  'Original Curly',
  'Braided',
  'Fringe & Headband',
  'Bundles',
  'Colored',
  'Short Cut',
];

const NAIL_SUBFILTERS = [
  'All',
  'Almond',
  'Coffin',
  'Stiletto',
  'Square & Short',
  'Bridal Edit',
  'Chrome & Cat-Eye',
  'French & Neutrals',
];

const COLLECTION_SHORTCUTS: {
  label: string;
  subtitle: string;
  category: 'All' | ProductCategory;
  subFilter: string;
}[] = [
  { label: 'All Wigs', subtitle: '29 Units & Bundles', category: 'Wigs', subFilter: 'All' },
  { label: 'Glueless & Bob', subtitle: 'Fringe & Headband', category: 'Wigs', subFilter: 'Glueless' },
  { label: 'Braided Wigs', subtitle: 'Knotless & Cornrow', category: 'Wigs', subFilter: 'Braided' },
  { label: 'Press-On Nails', subtitle: '11 Luxury Gel Sets', category: 'Press-On Nails', subFilter: 'All' },
  { label: 'Bridal Nails', subtitle: 'Pearl, Ombre & 3D Gold', category: 'Press-On Nails', subFilter: 'Bridal Edit' },
  { label: 'Hair & Nail Care', subtitle: 'Hot Comb, Silk & Glue', category: 'Accessories', subFilter: 'All' },
];

const STUDIO_FAQS = [
  {
    q: 'How do I pick the right press-on nail size (XS, S, M, L)?',
    a: 'Every product modal lists millimeter width equivalents next to XS, S, M, and L. Size M fits roughly 75% of hands; each box also includes a nail file so you can gently taper side edges for a seamless cuticle fit.',
  },
  {
    q: 'How does the 50% makeup booking deposit work?',
    a: 'Selecting 50% Deposit locks your exact date and time immediately in our live studio calendar and prevents anyone else from booking that slot. You settle the remaining 50% on appointment day in Ikot Ekpene or during home service.',
  },
  {
    q: 'How fast is delivery from Ikot Ekpene, Akwa Ibom State?',
    a: 'Orders within Ikot Ekpene and Uyo dispatch the same day (₦2,500). Tracked courier delivery to Calabar, Port Harcourt, Lagos, Abuja, and other states takes 2–4 working days (₦6,500, or free above ₦250,000).',
  },
];

interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  caption: string;
  actionLabel: string;
  category?: 'All' | ProductCategory;
  subFilter?: string;
  isBooking?: boolean;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-bridal',
    image: '/src/assets/images/service_bridal_glam_1795599129264.jpg',
    alt: 'Nigerian bride wearing radiant soft-glam makeup and luxury straight lace frontal',
    eyebrow: 'Ikot Ekpene Bridal & Owambe Studio',
    caption: 'Bridal Glam, Custom Units & Gele Styling',
    actionLabel: 'Book Makeup Session',
    isBooking: true,
  },
  {
    id: 'slide-ponytail',
    image: '/src/assets/images/ng_wig_high_ponytail_1795601033452.jpg',
    alt: 'Nigerian model wearing a sleek 360 lace jet-black high ponytail wig',
    eyebrow: '100% Raw Vietnamese Hair',
    caption: '360° Lace & Bone-Straight Frontals',
    actionLabel: 'Shop Bone Straight',
    category: 'Wigs',
    subFilter: 'Bone Straight',
  },
  {
    id: 'slide-deepwave',
    image: '/src/assets/images/ng_wig_deepwave_waterfall_1795601035325.jpg',
    alt: 'Nigerian model wearing lush 13x6 Burmese deep-wave curls',
    eyebrow: 'Wet-Look Curl Collection',
    caption: 'Burmese Deep-Wave & Water-Wave Units',
    actionLabel: 'Shop Curly Wigs',
    category: 'Wigs',
    subFilter: 'Original Curly',
  },
  {
    id: 'slide-braids',
    image: '/src/assets/images/wig_model_braided_cornrow_1795600731893.jpg',
    alt: 'Nigerian woman wearing waist-length knotless box-braid HD lace wig',
    eyebrow: 'Zero Chair Hours',
    caption: 'Hand-Braided Knotless Lace Frontals',
    actionLabel: 'Shop Braided Wigs',
    category: 'Wigs',
    subFilter: 'Braided',
  },
  {
    id: 'slide-nails',
    image: '/src/assets/images/product_nails_goldswirl_1795600379629.jpg',
    alt: 'Handcrafted 3D molten gold chrome swirl almond press-on nails',
    eyebrow: '11 Custom Gel Sets',
    caption: 'Reusable Builder-Gel Press-On Nails',
    actionLabel: 'Shop Press-On Nails',
    category: 'Press-On Nails',
    subFilter: 'All',
  },
];

export function StorefrontSection({
  products,
  onSelectProduct,
  onQuickAddProduct,
  onGoToBooking,
  selectedCategory,
  onChangeCategory,
  activeSubFilter,
  onChangeSubFilter,
}: StorefrontSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState(18);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [prevSlideIdx, setPrevSlideIdx] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [heroPaused, setHeroPaused] = useState(false);

  const goToHeroSlide = (nextIdx: number, direction: 'next' | 'prev') => {
    setHeroSlideIdx((current) => {
      if (current === nextIdx) return current;
      setPrevSlideIdx(current);
      setSlideDir(direction);
      return nextIdx;
    });
  };

  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => {
      setHeroSlideIdx((current) => {
        setPrevSlideIdx(current);
        setSlideDir('next');
        return (current + 1) % HERO_SLIDES.length;
      });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const categoryCounts = useMemo(() => {
    const counts: Record<'All' | ProductCategory, number> = {
      All: products.length,
      Wigs: 0,
      'Press-On Nails': 0,
      Accessories: 0,
    };
    for (const p of products) {
      counts[p.category] += 1;
    }
    return counts;
  }, [products]);

  const activeSubFilterList =
    selectedCategory === 'Wigs'
      ? WIG_SUBFILTERS
      : selectedCategory === 'Press-On Nails'
      ? NAIL_SUBFILTERS
      : [];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSub =
        activeSubFilter === 'All' ||
        (item.collectionTags && item.collectionTags.includes(activeSubFilter)) ||
        (item.nailShapes && item.nailShapes.some((s) => s === activeSubFilter));
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.textureNote.toLowerCase().includes(q) ||
        (item.wigCapType && item.wigCapType.toLowerCase().includes(q)) ||
        (item.collectionTags && item.collectionTags.some((t) => t.toLowerCase().includes(q))) ||
        (item.specs && item.specs.some((s) => s.toLowerCase().includes(q))) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesSub && matchesQuery;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.basePrice - b.basePrice);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.basePrice - a.basePrice);
    }
    if (sortBy === 'stock') {
      return [...list].sort((a, b) => b.stock - a.stock);
    }
    return list;
  }, [products, selectedCategory, activeSubFilter, searchQuery, sortBy]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const handleShortcutClick = (category: 'All' | ProductCategory, subFilter: string) => {
    onChangeCategory(category);
    onChangeSubFilter(subFilter);
    setVisibleCount(18);
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onQuickAddProduct({
      kind: 'product',
      cartId: `${product.id}-quick-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      unitPrice: product.basePrice,
      quantity: 1,
      variant: {
        length: product.lengths?.[0],
        laceType: product.laceTypes?.[0],
        density: product.densities?.[0],
        nailShape: product.nailShapes?.[0],
        nailSize: product.nailSizes?.[2] || product.nailSizes?.[0],
        accessoryOption: product.accessoryOptions?.[0],
      },
    });
  };

  return (
    <main>
      {/* Slim Non-Sticky Announcement Bar */}
      <div className="bg-[#181512] text-[#E7E1D9] text-xs py-2 px-4 text-center">
        <span>
          Ikot Ekpene, Akwa Ibom State · Free Nationwide Dispatch Over ₦250,000 · WhatsApp: {WHATSAPP_DISPLAY}
        </span>
      </div>

      {/* Full-Width Sliding Hero Header */}
      <section
        className="relative w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] overflow-hidden bg-[#181512]"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        aria-roledescription="carousel"
        aria-label="Featured collections"
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isCurrent = idx === heroSlideIdx;
          const isPrevious = idx === prevSlideIdx;
          const positionClass = isCurrent
            ? 'translate-x-0 opacity-100 z-10 transition-all duration-700 ease-out'
            : isPrevious
            ? `${
                slideDir === 'next' ? '-translate-x-full' : 'translate-x-full'
              } opacity-100 z-0 transition-all duration-700 ease-out`
            : `${
                slideDir === 'next' ? 'translate-x-full' : '-translate-x-full'
              } opacity-0 z-0 transition-none pointer-events-none`;

          return (
            <div key={slide.id} className={`absolute inset-0 ${positionClass}`}>
              <ImageWithFallback
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-top"
                title={slide.caption}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#181512]/90 via-[#181512]/60 to-[#181512]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/85 via-transparent to-black/25" />
            </div>
          );
        })}

        {/* Foreground Header Content & Controls */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] py-7 sm:py-10 flex flex-col justify-between">
          {/* Top Slide Progress & Arrow Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() =>
                      goToHeroSlide(idx, idx >= heroSlideIdx ? 'next' : 'prev')
                    }
                    aria-label={`Show slide ${idx + 1}: ${slide.caption}`}
                    aria-current={idx === heroSlideIdx ? 'true' : undefined}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === heroSlideIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-white/80">
                {HERO_SLIDES[heroSlideIdx].eyebrow}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goToHeroSlide(
                    (heroSlideIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
                    'prev'
                  )
                }
                aria-label="Previous header photo"
                className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  goToHeroSlide((heroSlideIdx + 1) % HERO_SLIDES.length, 'next')
                }
                aria-label="Next header photo"
                className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Hero Headline + Slide Spotlight */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-wide text-[#E7DFD5]">
                Ikot Ekpene Flagship Studio · Nationwide Express Dispatch · {STUDIO_HOURS}
              </p>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.06] tracking-tight text-white">
                Luxury hair, press-on nails, and glam booked in one bag.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 max-w-xl">
                Shop 29 distinct wigs &amp; bundles featuring Nigerian model portraits alongside 11 handcrafted gel press-on nail collections, or reserve your studio or home makeup session in one bag.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Shop All Products ({products.length})</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={onGoToBooking}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#181512] bg-white hover:bg-[#F2EDE6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-[#6B1D3A]" aria-hidden="true" />
                  <span>Book Makeup Session</span>
                </button>
              </div>

              <div className="mt-7 pt-5 border-t border-white/15 grid grid-cols-3 gap-6 max-w-md text-xs">
                <div>
                  <p className="font-semibold text-white tabular-nums">{products.length} Ready SKUs</p>
                  <p className="text-white/70 mt-0.5">Wigs, Bundles &amp; Nails</p>
                </div>
                <div>
                  <p className="font-semibold text-white tabular-nums">4.9 / 5.0</p>
                  <p className="text-white/70 mt-0.5">Verified client rating</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Paystack</p>
                  <p className="text-white/70 mt-0.5">Card, Transfer &amp; USSD</p>
                </div>
              </div>
            </div>

            {/* Active Slide Quick Jump */}
            <div className="lg:text-right flex flex-col lg:items-end gap-2 shrink-0 bg-black/35 backdrop-blur-xs border border-white/15 rounded-xl p-4 sm:p-5">
              <p className="text-xs font-medium text-white/75">
                {STUDIO_ADDRESS}
              </p>
              <p className="text-lg sm:text-xl font-serif text-white">
                {HERO_SLIDES[heroSlideIdx].caption}
              </p>
              <button
                type="button"
                onClick={() => {
                  const slide = HERO_SLIDES[heroSlideIdx];
                  if (slide.isBooking) {
                    onGoToBooking();
                  } else if (slide.category) {
                    handleShortcutClick(slide.category, slide.subFilter || 'All');
                  }
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{HERO_SLIDES[heroSlideIdx].actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Collection Shortcut Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COLLECTION_SHORTCUTS.map((col) => {
            const isActive =
              selectedCategory === col.category && activeSubFilter === col.subFilter;
            return (
              <button
                key={col.label}
                type="button"
                onClick={() => handleShortcutClick(col.category, col.subFilter)}
                className={`text-left rounded-xl border p-4 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#181512] text-white border-[#181512]'
                    : 'bg-white text-[#181512] border-[#E7E1D9] hover:border-[#6B1D3A]'
                }`}
              >
                <p className="text-sm font-semibold whitespace-nowrap truncate">{col.label}</p>
                <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-white/75' : 'text-[#6E655D]'}`}>
                  {col.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#E7E1D9]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[#6E655D]">Easy Order Storefront</p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-semibold text-[#181512]">
              {selectedCategory === 'All'
                ? 'All Wigs, Bundles, Nails & Care Kits'
                : selectedCategory === 'Press-On Nails'
                ? 'Handcrafted Gel Press-On Nails'
                : selectedCategory === 'Wigs'
                ? 'Luxury Human Hair Wigs & Bundles'
                : 'Hair Tools, Silk Bonnets & Nail Kits'}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6E655D] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(18);
                }}
                placeholder="Search braids, bussdown, 99J, nails..."
                aria-label="Search beauty catalog"
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white border border-[#DDD5CA] rounded-lg text-[#181512] placeholder:text-[#8B8278] focus:outline-none focus:border-[#6B1D3A]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setVisibleCount(18);
              }}
              aria-label="Sort products"
              className="px-3 py-2 text-xs font-medium bg-white border border-[#DDD5CA] rounded-lg text-[#181512] focus:outline-none focus:border-[#6B1D3A] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Availability: Highest Stock</option>
            </select>

            <div className="inline-flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg overflow-x-auto" role="tablist" aria-label="Filter by category">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category}
                  onClick={() => {
                    onChangeCategory(category);
                    onChangeSubFilter('All');
                    setVisibleCount(18);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    selectedCategory === category
                      ? 'bg-white text-[#181512] shadow-xs'
                      : 'text-[#5A524A] hover:text-[#181512]'
                  }`}
                >
                  {category} ({categoryCounts[category]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-Filter Bar for Wigs / Nails */}
        {activeSubFilterList.length > 0 && (
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
            {activeSubFilterList.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  onChangeSubFilter(sub);
                  setVisibleCount(18);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubFilter === sub
                    ? 'bg-[#6B1D3A] text-white border-[#6B1D3A]'
                    : 'bg-white text-[#5A524A] border-[#DDD5CA] hover:border-[#181512] hover:text-[#181512]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="mt-10 bg-white border border-[#E7E1D9] rounded-2xl p-12 text-center">
            <Sparkles className="w-6 h-6 text-[#6B1D3A] mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-semibold text-[#181512]">No items match your filter</p>
            <p className="mt-1 text-sm text-[#5A524A]">Try clearing your search or switching back to All categories.</p>
            <button
              type="button"
              onClick={() => {
                onChangeCategory('All');
                onChangeSubFilter('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#6B1D3A] rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayedProducts.map((product) => {
                const outOfStock = product.stock <= 0;
                return (
                  <article
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="group bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-[4/3] bg-[#F2EDE6] overflow-hidden relative">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        title={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#6E655D] flex-wrap">
                          <span>{product.wigCapType || product.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className={outOfStock ? 'text-[#B91C1C] font-medium' : 'text-[#453F3A]'}>
                            {outOfStock ? 'Sold Out' : `${product.stock} in stock`}
                          </span>
                          {product.badgeText && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#6B1D3A] font-medium">{product.badgeText}</span>
                            </>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-base font-semibold text-[#181512] group-hover:text-[#6B1D3A] transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#5A524A] line-clamp-2">
                          {product.textureNote}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#F2EDE6] flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-semibold text-[#181512] tabular-nums">
                            {product.category === 'Wigs' ? `From ${formatNaira(product.basePrice)}` : formatNaira(product.basePrice)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-[#8B8278] line-through tabular-nums">
                              {formatNaira(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!outOfStock && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, product)}
                              aria-label={`Quick add ${product.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#181512] bg-[#FAF8F5] hover:bg-[#6B1D3A] hover:text-white border border-[#DDD5CA] rounded-md transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          )}
                          <span className="text-xs font-semibold text-[#6B1D3A] group-hover:underline">
                            Options
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length > displayedProducts.length && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <p className="text-xs text-[#6E655D] tabular-nums">
                  Showing {displayedProducts.length} of {filteredProducts.length} items
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 18)}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#181512] hover:bg-[#312C27] rounded-lg transition-colors cursor-pointer"
                  >
                    Load 18 More
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredProducts.length)}
                    className="px-4 py-2.5 text-xs font-semibold text-[#181512] bg-white hover:bg-[#EFEAE2] border border-[#DDD5CA] rounded-lg transition-colors cursor-pointer tabular-nums"
                  >
                    View All ({filteredProducts.length})
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Verified Client Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E7E1D9]">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#6E655D]">Client Reviews &amp; Fit Confidence</p>
          <h2 className="mt-1 text-3xl sm:text-4xl font-semibold text-[#181512]">
            Trusted for weddings, shoots &amp; everyday luxury.
          </h2>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLIENT_TESTIMONIALS.map((review) => (
            <blockquote
              key={review.id}
              className="bg-white border border-[#E7E1D9] rounded-2xl p-6 flex flex-col justify-between"
            >
              <p className="text-sm leading-relaxed text-[#453F3A]">
                &ldquo;{review.quote}&rdquo;
              </p>
              <footer className="mt-5 pt-4 border-t border-[#F2EDE6]">
                <p className="text-sm font-semibold text-[#181512]">
                  {review.name} <span className="font-normal text-[#6E655D]">· {review.city}</span>
                </p>
                <p className="text-xs text-[#6B1D3A] mt-0.5">{review.purchasedItem}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* About & Studio Details Section + Visual Studio Showcase + FAQ */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E7E1D9]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden">
              <div className="aspect-[16/9] bg-[#F2EDE6]">
                <ImageWithFallback
                  src="/src/assets/images/about_studio_interior_1795600398768.jpg"
                  alt="Nene Atelier beauty studio interior in Ikot Ekpene with glam vanity mirrors and wig display"
                  title="Nene Atelier Ikot Ekpene Studio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-7 sm:p-9 space-y-5">
                <div>
                  <p className="text-xs font-medium text-[#6E655D]">About {BRAND_NAME}</p>
                  <h2 className="mt-1.5 text-3xl sm:text-4xl font-semibold text-[#181512]">
                    Crafted in Ikot Ekpene for effortless beauty across Nigeria.
                  </h2>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#5A524A]">
                    Founded by <span className="font-semibold text-[#181512]">{FOUNDER_NAME}</span> in {STUDIO_ADDRESS}, {BRAND_NAME} brings together 100% raw &amp; virgin human hair wigs, hand-painted reusable gel press-on nails, and luxury studio or home-service makeup artistry under one seamless booking and checkout experience.
                  </p>
                </div>

                <div className="pt-5 border-t border-[#EFEAE2] grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <p className="font-semibold text-[#181512]">Dispatch &amp; Delivery Policy</p>
                    <p className="mt-1 text-[#5A524A] leading-relaxed">
                      Same-day dispatch within Ikot Ekpene &amp; Akwa Ibom State (₦2,500). Tracked nationwide delivery to Uyo, Calabar, Port Harcourt, Lagos, and Abuja in 2–4 working days (₦6,500; free above ₦250,000).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#181512]">Bookings, Deposits &amp; Exchanges</p>
                    <p className="mt-1 text-[#5A524A] leading-relaxed">
                      A 50% non-refundable deposit locks in your makeup slot immediately. Unworn wigs with uncut lace qualify for inspection exchange within 48 hours; custom press-on nails are final sale for hygiene.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Craftsmanship Visual Strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E7E1D9] bg-[#F2EDE6]">
                <ImageWithFallback
                  src="/src/assets/images/product_hair_bundles_1795600377767.jpg"
                  alt="Raw Vietnamese straight bundles and HD frontal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E7E1D9] bg-[#F2EDE6]">
                <ImageWithFallback
                  src="/src/assets/images/product_nails_goldswirl_1795600379629.jpg"
                  alt="3D gold chrome swirl luxury press-on nails"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E7E1D9] bg-[#F2EDE6]">
                <ImageWithFallback
                  src="/src/assets/images/product_bonnet_edge_1795600380719.jpg"
                  alt="Silk bonnet and edge control styling essentials"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E7E1D9] rounded-2xl p-7 sm:p-8 space-y-5">
              <div>
                <p className="text-xs font-medium text-[#6E655D]">Direct Studio Contact</p>
                <h3 className="mt-1 text-2xl font-semibold text-[#181512]">Visit or Reach Us</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#6B1D3A] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#181512]">Studio Address</p>
                    <p className="text-[#5A524A] mt-0.5">{STUDIO_ADDRESS}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#6B1D3A] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#181512]">Phone &amp; WhatsApp Orders</p>
                    <a
                      href={`tel:+${WHATSAPP_RAW}`}
                      className="text-[#181512] hover:text-[#6B1D3A] font-medium tabular-nums mt-0.5 inline-block"
                    >
                      {WHATSAPP_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#6B1D3A] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#181512]">Email Inquiries &amp; Bridal Bookings</p>
                    <a
                      href={`mailto:${STUDIO_EMAIL}`}
                      className="text-[#181512] hover:text-[#6B1D3A] font-medium mt-0.5 inline-block break-all"
                    >
                      {STUDIO_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#6B1D3A] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#181512]">Opening Hours</p>
                    <p className="text-[#5A524A] mt-0.5">{STUDIO_HOURS}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#6B1D3A] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#181512]">Accepted Payments</p>
                    <p className="text-[#5A524A] mt-0.5">Paystack Naira Card, Bank Transfer &amp; USSD</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFEAE2] flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/${WHATSAPP_RAW}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`mailto:${STUDIO_EMAIL}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#181512] bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#DDD5CA] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Interactive Ordering & Care FAQ */}
            <div className="bg-white border border-[#E7E1D9] rounded-2xl p-6 space-y-3">
              <p className="text-xs font-semibold text-[#181512]">Ordering, Sizing &amp; Booking FAQ</p>
              <div className="divide-y divide-[#F2EDE6]">
                {STUDIO_FAQS.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className="py-3 first:pt-1 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-3 text-left text-xs font-semibold text-[#181512] cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#6E655D] shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-xs leading-relaxed text-[#5A524A]">{item.a}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Glam Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        <div className="bg-[#181512] text-white rounded-2xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium text-[#D6CEC5]">
              Glam Studio &amp; Home Service · Ikot Ekpene, Akwa Ibom State
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Need your makeup done with your new unit &amp; nails?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D6CEC5] max-w-xl leading-relaxed">
              Pick Soft Glam, Owambe, Photoshoot, or Full Bridal, choose Studio Visit or Home Service, and pay a 50% deposit in the exact same checkout as your wig or press-ons.
            </p>
            <button
              type="button"
              onClick={onGoToBooking}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#181512] bg-white hover:bg-[#F2EDE6] rounded-lg transition-colors cursor-pointer"
            >
              <span>Check Makeup Availability</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
            <ImageWithFallback
              src="/src/assets/images/service_bridal_glam_1795599129264.jpg"
              alt="Nigerian bridal glam makeup session"
              className="w-full h-full object-cover"
              title="Bridal & Owambe Glam"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
