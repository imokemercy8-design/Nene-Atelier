import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { BRAND_NAME } from '../data/seedData';

export type ActiveView = 'storefront' | 'booking' | 'admin';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onGoToAbout: () => void;
  onOpenTracker: () => void;
  onOpenBag: () => void;
  bagCount: number;
}

export function Header({
  activeView,
  onNavigate,
  onGoToAbout,
  onOpenTracker,
  onOpenBag,
  bagCount,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E7E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => handleNav('storefront')}
          className="font-serif text-2xl font-semibold tracking-tight text-[#181512] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1D3A]"
        >
          {BRAND_NAME}
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5A524A]" aria-label="Primary navigation">
          <button
            type="button"
            onClick={() => handleNav('storefront')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6B1D3A] ${
              activeView === 'storefront'
                ? 'text-[#181512] border-b border-[#6B1D3A]'
                : 'hover:text-[#181512]'
            }`}
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => handleNav('booking')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6B1D3A] ${
              activeView === 'booking'
                ? 'text-[#181512] border-b border-[#6B1D3A]'
                : 'hover:text-[#181512]'
            }`}
          >
            Book Glam
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onGoToAbout();
            }}
            className="whitespace-nowrap shrink-0 pb-0.5 hover:text-[#181512] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6B1D3A]"
          >
            About
          </button>
          <button
            type="button"
            onClick={onOpenTracker}
            className="whitespace-nowrap shrink-0 pb-0.5 hover:text-[#181512] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6B1D3A]"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => handleNav('admin')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6B1D3A] ${
              activeView === 'admin'
                ? 'text-[#181512] border-b border-[#6B1D3A]'
                : 'hover:text-[#181512]'
            }`}
          >
            Studio Admin
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1D3A]"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">Bag ({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-[#181512] hover:bg-[#EFEAE2] rounded-lg transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E1D9] bg-[#FAF8F5] px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleNav('storefront')}
            className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
              activeView === 'storefront' ? 'bg-[#EFEAE2] text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            Shop Wigs &amp; Nails
          </button>
          <button
            type="button"
            onClick={() => handleNav('booking')}
            className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
              activeView === 'booking' ? 'bg-[#EFEAE2] text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            Book Makeup Session
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onGoToAbout();
            }}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#5A524A] rounded-lg"
          >
            About &amp; Contact
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTracker();
            }}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#5A524A] rounded-lg"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => handleNav('admin')}
            className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
              activeView === 'admin' ? 'bg-[#EFEAE2] text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            Studio Admin
          </button>
        </div>
      )}
    </header>
  );
}
