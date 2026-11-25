import { useEffect, useState } from 'react';
import { Check, Minus, Play, Pause, Plus, X } from 'lucide-react';
import {
  LaceType,
  NailShape,
  NailSize,
  Product,
  ProductCartItem,
  WigDensity,
} from '../types/beauty';
import { calculateProductUnitPrice } from '../data/seedData';
import { formatNaira } from '../utils/format';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToBag: (item: ProductCartItem) => void;
}

const NAIL_SIZE_GUIDE: Record<NailSize, string> = {
  XS: '3 · 6 · 5 · 7 · 9 (petite nail beds)',
  S: '2 · 5 · 4 · 6 · 9 (slim average)',
  M: '1 · 5 · 4 · 6 · 8 (most common fit)',
  L: '0 · 4 · 3 · 5 · 7 (wide nail beds)',
};

export function ProductDetailModal({
  product,
  onClose,
  onAddToBag,
}: ProductDetailModalProps) {
  const [length, setLength] = useState<string | undefined>(undefined);
  const [laceType, setLaceType] = useState<LaceType | undefined>(undefined);
  const [density, setDensity] = useState<WigDensity | undefined>(undefined);
  const [nailShape, setNailShape] = useState<NailShape | undefined>(undefined);
  const [nailSize, setNailSize] = useState<NailSize | undefined>(undefined);
  const [accessoryOption, setAccessoryOption] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [mediaMode, setMediaMode] = useState<'photo' | 'motion'>('photo');
  const [motionPlaying, setMotionPlaying] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setLength(product.lengths?.[0]);
    setLaceType(product.laceTypes?.[0]);
    setDensity(product.densities?.[0]);
    setNailShape(product.nailShapes?.[0]);
    setNailSize(product.nailSizes?.[2] || product.nailSizes?.[0]);
    setAccessoryOption(product.accessoryOptions?.[0]);
    setQuantity(1);
    setMediaMode('photo');
    setMotionPlaying(true);
    setActiveImage(product.image);
    setJustAdded(false);
  }, [product]);

  if (!product) return null;

  const unitPrice = calculateProductUnitPrice(product, length, laceType, density);
  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToBag({
      kind: 'product',
      cartId: `${product.id}-${length || ''}-${laceType || ''}-${density || ''}-${nailShape || ''}-${nailSize || ''}-${accessoryOption || ''}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      unitPrice,
      quantity,
      variant: {
        length,
        laceType,
        density,
        nailShape,
        nailSize,
        accessoryOption,
      },
    });
    setJustAdded(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="bg-[#FAF8F5] w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[#E7E1D9] shadow-2xl">
        <div className="sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E7E1D9] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#6E655D]">
            <span>{product.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#181512] font-medium truncate max-w-[240px]">{product.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-1.5 text-[#5A524A] hover:text-[#181512] hover:bg-[#EFEAE2] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Media Gallery & Texture Clip */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F2EDE6] border border-[#E7E1D9]">
              <ImageWithFallback
                src={activeImage || product.image}
                alt={product.name}
                title={product.name}
                className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                  mediaMode === 'motion' && motionPlaying ? 'animate-texture-clip' : ''
                }`}
              />
              {mediaMode === 'motion' && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">
                    {product.category === 'Wigs'
                      ? 'Lace & Strands Texture Motion Preview'
                      : 'Finish & Shine Macro Preview'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMotionPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/90 text-[#181512] rounded-md cursor-pointer"
                  >
                    {motionPlaying ? (
                      <>
                        <Pause className="w-3 h-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Play
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg">
                <button
                  type="button"
                  onClick={() => setMediaMode('photo')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                    mediaMode === 'photo' ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
                  }`}
                >
                  Studio Photo
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('motion')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                    mediaMode === 'motion' ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
                  }`}
                >
                  Texture Clip
                </button>
              </div>

              {product.secondaryImage && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveImage(product.image)}
                    className={`w-12 h-10 rounded-md overflow-hidden border cursor-pointer ${
                      activeImage === product.image ? 'border-[#6B1D3A]' : 'border-[#DDD5CA]'
                    }`}
                    aria-label="Primary studio view"
                  >
                    <ImageWithFallback src={product.image} alt="View 1" className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage(product.secondaryImage!)}
                    className={`w-12 h-10 rounded-md overflow-hidden border cursor-pointer ${
                      activeImage === product.secondaryImage ? 'border-[#6B1D3A]' : 'border-[#DDD5CA]'
                    }`}
                    aria-label="Secondary worn view"
                  >
                    <ImageWithFallback src={product.secondaryImage} alt="View 2" className="w-full h-full object-cover" />
                  </button>
                </div>
              )}
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="bg-white border border-[#E7E1D9] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#181512]">Craft &amp; Quality Specifications</p>
                <ul className="space-y-1.5 text-xs text-[#5A524A]">
                  {product.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#6B1D3A] shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#6E655D]">
                <span>{product.wigCapType || product.category}</span>
                <span aria-hidden="true">·</span>
                <span className={outOfStock ? 'text-[#B91C1C] font-semibold' : 'text-[#15803D] font-medium'}>
                  {outOfStock
                    ? 'Currently Out of Stock'
                    : product.stock <= 3
                    ? `Low Stock · Only ${product.stock} left`
                    : `In Stock · ${product.stock} ready to ship`}
                </span>
              </div>
              <h2 className="mt-1.5 text-3xl font-semibold text-[#181512]">{product.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-[#181512] tabular-nums">
                {formatNaira(unitPrice)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#5A524A]">{product.description}</p>
            </div>

            {/* Wig Variant Selectors */}
            {product.lengths && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#181512]">Length</span>
                <div className="flex flex-wrap gap-2">
                  {product.lengths.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        length === len
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.laceTypes && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#181512]">Lace Type</span>
                <div className="grid grid-cols-2 gap-2">
                  {product.laceTypes.map((lace) => (
                    <button
                      key={lace}
                      type="button"
                      onClick={() => setLaceType(lace)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-left ${
                        laceType === lace
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {lace} {lace === 'HD Lace' ? '(+₦15,000)' : '(Included)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.densities && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#181512]">Density</span>
                <div className="flex flex-wrap gap-2">
                  {product.densities.map((den) => (
                    <button
                      key={den}
                      type="button"
                      onClick={() => setDensity(den)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        density === den
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {den}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nail Variant Selectors */}
            {product.nailShapes && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#181512]">Nail Shape</span>
                <div className="flex flex-wrap gap-2">
                  {product.nailShapes.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setNailShape(shape)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        nailShape === shape
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.nailSizes && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#181512]">Size</span>
                  {nailSize && (
                    <span className="text-xs text-[#6E655D]">
                      {NAIL_SIZE_GUIDE[nailSize]}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.nailSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setNailSize(sz)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        nailSize === sz
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.accessoryOptions && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#181512]">Edition</span>
                <div className="flex flex-wrap gap-2">
                  {product.accessoryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAccessoryOption(opt)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        accessoryOption === opt
                          ? 'bg-[#181512] text-white border-[#181512]'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Bag */}
            <div className="pt-4 border-t border-[#E7E1D9] flex items-center gap-3">
              <div className="inline-flex items-center border border-[#DDD5CA] bg-white rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-[#181512] hover:bg-[#FAF8F5] rounded-l-lg cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  aria-label="Increase quantity"
                  className="p-3 text-[#181512] hover:bg-[#FAF8F5] rounded-r-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] disabled:bg-[#C6BEB5] rounded-lg transition-colors cursor-pointer tabular-nums"
              >
                {outOfStock ? (
                  'Sold Out'
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  `Add to Bag · ${formatNaira(unitPrice * quantity)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
