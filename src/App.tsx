import { useEffect, useState } from 'react';
import {
  AppointmentRecord,
  BlockedSlot,
  BookingCartItem,
  CartItem,
  DeliveryLocation,
  Order,
  OrderStatus,
  PaymentChannel,
  Product,
  ProductCartItem,
  ProductCategory,
} from './types/beauty';
import {
  BRAND_NAME,
  INITIAL_APPOINTMENTS,
  INITIAL_BLOCKED_SLOTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  STUDIO_ADDRESS,
  STUDIO_EMAIL,
  STUDIO_HOURS,
  WHATSAPP_DISPLAY,
  WHATSAPP_RAW,
} from './data/seedData';
import { ActiveView, Header } from './components/Header';
import { StorefrontSection } from './components/StorefrontSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BookingSection } from './components/BookingSection';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminDashboard } from './components/AdminDashboard';

const STORAGE_KEY = 'nene_atelier_mvp_v6';

function loadPersistedState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('storefront');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>(() =>
    loadPersistedState('products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadPersistedState('orders', INITIAL_ORDERS)
  );
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() =>
    loadPersistedState('appointments', INITIAL_APPOINTMENTS)
  );
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() =>
    loadPersistedState('blockedSlots', INITIAL_BLOCKED_SLOTS)
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadPersistedState('cart', [])
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
      localStorage.setItem(`${STORAGE_KEY}_blockedSlots`, JSON.stringify(blockedSlots));
      localStorage.setItem(`${STORAGE_KEY}_cart`, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [products, orders, appointments, blockedSlots, cartItems]);

  const totalBagCount = cartItems.reduce(
    (sum, item) => sum + (item.kind === 'product' ? item.quantity : 1),
    0
  );

  const handleAddProductToBag = (newItem: ProductCartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.kind === 'product' &&
          i.productId === newItem.productId &&
          JSON.stringify(i.variant) === JSON.stringify(newItem.variant)
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx] as ProductCartItem;
        updated[existingIdx] = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    setSelectedProduct(null);
    setBagOpen(true);
  };

  const handleAddBookingToBag = (booking: BookingCartItem) => {
    setCartItems((prev) => [...prev, booking]);
    setBagOpen(true);
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId || item.kind !== 'product') return item;
          const nextQty = item.quantity + delta;
          return nextQty <= 0 ? null : { ...item, quantity: nextQty };
        })
        .filter((x): x is CartItem => x !== null)
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleCompleteCheckout = (payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryLocation?: DeliveryLocation;
    deliveryFee: number;
    address: string;
    paymentChannel: PaymentChannel;
  }): Order => {
    const orderId = `NA-${Math.floor(2043 + Math.random() * 8900)}`;
    const todayIso = new Date().toISOString().slice(0, 10);

    const productTotal = cartItems
      .filter((i): i is ProductCartItem => i.kind === 'product')
      .reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const bookingDueNow = cartItems
      .filter((i): i is BookingCartItem => i.kind === 'booking')
      .reduce((s, b) => s + b.amountDueNow, 0);
    const balanceDueLater = cartItems
      .filter((i): i is BookingCartItem => i.kind === 'booking')
      .reduce((s, b) => s + b.balanceAtAppointment, 0);

    const newOrder: Order = {
      id: orderId,
      createdAt: todayIso,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      deliveryLocation: payload.deliveryLocation,
      deliveryFee: payload.deliveryFee,
      address: payload.address,
      paymentChannel: payload.paymentChannel,
      items: cartItems,
      totalChargedNow: productTotal + bookingDueNow + payload.deliveryFee,
      balanceDueLater,
      status: 'Processing',
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const boughtQty = cartItems
          .filter((i): i is ProductCartItem => i.kind === 'product' && i.productId === prod.id)
          .reduce((s, i) => s + i.quantity, 0);
        return boughtQty > 0
          ? { ...prod, stock: Math.max(0, prod.stock - boughtQty) }
          : prod;
      })
    );

    const newAppointments: AppointmentRecord[] = cartItems
      .filter((i): i is BookingCartItem => i.kind === 'booking')
      .map((b, idx) => ({
        id: `APT-${Date.now()}-${idx}`,
        orderId,
        packageName: b.packageName,
        date: b.date,
        timeSlot: b.timeSlot,
        locationMode: b.locationMode,
        clientName: payload.customerName,
        clientPhone: payload.customerPhone,
        homeAddress: b.homeAddress,
        totalPrice: b.basePrice + b.transportFee,
        amountPaid: b.amountDueNow,
        balanceDue: b.balanceAtAppointment,
        status: 'Confirmed',
      }));

    if (newAppointments.length > 0) {
      setAppointments((prev) => [...newAppointments, ...prev]);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    return newOrder;
  };

  const jumpToCollection = (cat: 'All' | ProductCategory, sub = 'All') => {
    setActiveView('storefront');
    setSelectedCategory(cat);
    setActiveSubFilter(sub);
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const jumpToAbout = () => {
    setActiveView('storefront');
    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181512]">
      <Header
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoToAbout={jumpToAbout}
        onOpenTracker={() => setTrackerOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        bagCount={totalBagCount}
      />

      <div className="flex-1">
        {activeView === 'storefront' && (
          <StorefrontSection
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAddProduct={handleAddProductToBag}
            onGoToBooking={() => {
              setActiveView('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
            activeSubFilter={activeSubFilter}
            onChangeSubFilter={setActiveSubFilter}
          />
        )}

        {activeView === 'booking' && (
          <BookingSection
            appointments={appointments}
            blockedSlots={blockedSlots}
            cartItems={cartItems}
            onAddBookingToBag={handleAddBookingToBag}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            appointments={appointments}
            blockedSlots={blockedSlots}
            onUpdateStock={(productId, newStock) =>
              setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
              )
            }
            onAddProduct={(prod) => setProducts((prev) => [prod, ...prev])}
            onDeleteProduct={(productId) =>
              setProducts((prev) => prev.filter((p) => p.id !== productId))
            }
            onUpdateOrderStatus={(orderId: string, status: OrderStatus) =>
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status } : o))
              )
            }
            onAddBlockedSlot={(slot) => setBlockedSlots((prev) => [slot, ...prev])}
            onRemoveBlockedSlot={(slotId) =>
              setBlockedSlots((prev) => prev.filter((b) => b.id !== slotId))
            }
          />
        )}
      </div>

      {/* 4-Column Storefront Footer */}
      <footer className="border-t border-[#E7E1D9] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-[#5A524A]">
          <div>
            <span className="font-serif text-xl font-semibold text-[#181512]">
              {BRAND_NAME}
            </span>
            <p className="mt-2.5 leading-relaxed">
              Luxury raw wigs, handcrafted gel press-on nails, and glam appointments across Akwa Ibom State and nationwide Nigeria.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-[#181512]">Store &amp; Contact</p>
            <p>{STUDIO_ADDRESS}</p>
            <p>{STUDIO_HOURS}</p>
            <p>
              Phone / WhatsApp:{' '}
              <a href={`tel:+${WHATSAPP_RAW}`} className="text-[#181512] hover:text-[#6B1D3A] font-medium">
                {WHATSAPP_DISPLAY}
              </a>
            </p>
            <p>
              Email:{' '}
              <a href={`mailto:${STUDIO_EMAIL}`} className="text-[#181512] hover:text-[#6B1D3A] font-medium break-all">
                {STUDIO_EMAIL}
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-[#181512]">Shop Collections</p>
            <div className="flex flex-col items-start gap-1.5">
              <button type="button" onClick={() => jumpToCollection('Wigs', 'All')} className="hover:text-[#181512] cursor-pointer">
                All Wigs
              </button>
              <button type="button" onClick={() => jumpToCollection('Wigs', 'Glueless')} className="hover:text-[#181512] cursor-pointer">
                Glueless &amp; Bob Wigs
              </button>
              <button type="button" onClick={() => jumpToCollection('Press-On Nails', 'All')} className="hover:text-[#181512] cursor-pointer">
                Press-On Nails (11 Styles)
              </button>
              <button type="button" onClick={() => jumpToCollection('Accessories', 'All')} className="hover:text-[#181512] cursor-pointer">
                Hair &amp; Melt Tools
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-[#181512]">Customer Service</p>
            <div className="flex flex-col items-start gap-1.5">
              <button type="button" onClick={jumpToAbout} className="hover:text-[#181512] cursor-pointer">
                About &amp; Policies
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#181512] cursor-pointer"
              >
                Book Makeup Session
              </button>
              <button
                type="button"
                onClick={() => setTrackerOpen(true)}
                className="hover:text-[#181512] cursor-pointer"
              >
                Track Order &amp; Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#181512] cursor-pointer"
              >
                Studio Admin Console
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToBag={handleAddProductToBag}
      />

      <CheckoutDrawer
        open={bagOpen}
        items={cartItems}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCompleteCheckout={handleCompleteCheckout}
      />

      <OrderTrackerModal
        open={trackerOpen}
        orders={orders}
        onClose={() => setTrackerOpen(false)}
      />
    </div>
  );
}
