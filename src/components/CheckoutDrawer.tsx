import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  CartItem,
  DeliveryLocation,
  Order,
  PaymentChannel,
} from '../types/beauty';
import {
  CALABAR_DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  NATIONWIDE_DELIVERY_FEE,
  STUDIO_ADDRESS,
} from '../data/seedData';
import { formatNaira, formatShortDate } from '../utils/format';
import { ImageWithFallback } from './ImageWithFallback';

interface CheckoutDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onCompleteCheckout: (payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryLocation?: DeliveryLocation;
    deliveryFee: number;
    address: string;
    paymentChannel: PaymentChannel;
  }) => Order;
}

export function CheckoutDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCompleteCheckout,
}: CheckoutDrawerProps) {
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>('calabar');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('Card');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  if (!open) return null;

  const productItems = items.filter((i) => i.kind === 'product');
  const bookingItems = items.filter((i) => i.kind === 'booking');
  const hasProducts = productItems.length > 0;

  const productSubtotal = productItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const bookingDueNow = bookingItems.reduce((sum, b) => sum + b.amountDueNow, 0);
  const bookingBalanceLater = bookingItems.reduce(
    (sum, b) => sum + b.balanceAtAppointment,
    0
  );

  const baseDeliveryFee = !hasProducts
    ? 0
    : deliveryLocation === 'calabar'
    ? CALABAR_DELIVERY_FEE
    : NATIONWIDE_DELIVERY_FEE;
  const deliveryFee =
    hasProducts && productSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : baseDeliveryFee;
  const grandTotalDueNow = productSubtotal + bookingDueNow + deliveryFee;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setFormError('Please provide your full name, email, and WhatsApp phone number.');
      return;
    }
    if (hasProducts && !address.trim()) {
      setFormError('Please enter your delivery street address.');
      return;
    }

    const order = onCompleteCheckout({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      deliveryLocation: hasProducts ? deliveryLocation : undefined,
      deliveryFee,
      address: address.trim() || STUDIO_ADDRESS,
      paymentChannel,
    });
    setConfirmedOrder(order);
  };

  const handleCopyReceipt = () => {
    if (!confirmedOrder) return;
    const summary = [
      `Nene Atelier Receipt — ${confirmedOrder.id}`,
      `Name: ${confirmedOrder.customerName} (${confirmedOrder.customerPhone})`,
      `Paid Now: ${formatNaira(confirmedOrder.totalChargedNow)} via ${confirmedOrder.paymentChannel}`,
      confirmedOrder.balanceDueLater > 0
        ? `Balance at Appointment: ${formatNaira(confirmedOrder.balanceDueLater)}`
        : null,
      `Items: ${confirmedOrder.items
        .map((i) => (i.kind === 'product' ? `${i.quantity}x ${i.name}` : `${i.packageName} (${i.date} ${i.timeSlot})`))
        .join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard?.writeText(summary);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setFormError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Checkout"
    >
      <div className="bg-[#FAF8F5] w-full max-w-lg h-full flex flex-col border-l border-[#E7E1D9] shadow-2xl">
        <div className="px-6 py-4 bg-white border-b border-[#E7E1D9] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#181512]">
            {confirmedOrder ? 'Order & Booking Confirmed' : `Your Bag (${items.length})`}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bag"
            className="p-1.5 text-[#5A524A] hover:text-[#181512] hover:bg-[#EFEAE2] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedOrder ? (
            <div className="bg-white border border-[#E7E1D9] rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[#15803D]">
                    Payment Verified · {confirmedOrder.paymentChannel}
                  </p>
                  <h3 className="text-xl font-semibold text-[#181512] mt-0.5 tabular-nums">
                    Order #{confirmedOrder.id}
                  </h3>
                  <p className="text-xs text-[#5A524A] mt-1">
                    Receipt prepared for {confirmedOrder.customerEmail} and WhatsApp ({confirmedOrder.customerPhone}).
                  </p>
                </div>
              </div>

              <div className="border-t border-b border-[#EFEAE2] py-4 space-y-2.5 text-sm">
                {confirmedOrder.items.map((item) => (
                  <div key={item.cartId} className="flex justify-between gap-3">
                    <span className="text-[#181512]">
                      {item.kind === 'product'
                        ? `${item.quantity}x ${item.name}`
                        : `${item.packageName} (${formatShortDate(item.date)} · ${item.timeSlot})`}
                    </span>
                    <span className="font-semibold tabular-nums shrink-0">
                      {formatNaira(
                        item.kind === 'product'
                          ? item.unitPrice * item.quantity
                          : item.amountDueNow
                      )}
                    </span>
                  </div>
                ))}
                {confirmedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-[#5A524A]">
                    <span>Dispatch ({confirmedOrder.deliveryLocation === 'calabar' ? 'Calabar' : 'Nationwide'})</span>
                    <span className="tabular-nums">{formatNaira(confirmedOrder.deliveryFee)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between font-semibold text-[#181512]">
                  <span>Total Paid Now</span>
                  <span className="tabular-nums">{formatNaira(confirmedOrder.totalChargedNow)}</span>
                </div>
                {confirmedOrder.balanceDueLater > 0 && (
                  <div className="flex justify-between text-xs text-[#6E655D]">
                    <span>Makeup Balance Due at Session</span>
                    <span className="tabular-nums">{formatNaira(confirmedOrder.balanceDueLater)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold border border-[#DDD5CA] bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#181512] rounded-lg cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedReceipt ? 'WhatsApp Receipt Copied' : 'Copy WhatsApp Receipt'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-[#E7E1D9] rounded-2xl p-10 text-center">
              <ShoppingBag className="w-7 h-7 text-[#6E655D] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#181512]">Your bag is empty</p>
              <p className="mt-1 text-xs text-[#5A524A]">
                Add wigs, press-on nails, or a makeup appointment to check out in one flow.
              </p>
            </div>
          ) : (
            <>
              {/* Bag Items */}
              <div className="space-y-3">
                {items.map((item) =>
                  item.kind === 'product' ? (
                    <div
                      key={item.cartId}
                      className="bg-white border border-[#E7E1D9] rounded-xl p-4 flex gap-3.5"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F2EDE6] shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[#181512] truncate">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.cartId)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[#8B8278] hover:text-[#B91C1C] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#6E655D] mt-0.5">
                          {[
                            item.variant.length,
                            item.variant.laceType,
                            item.variant.density,
                            item.variant.nailShape,
                            item.variant.nailSize ? `Size ${item.variant.nailSize}` : null,
                            item.variant.accessoryOption,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="inline-flex items-center border border-[#DDD5CA] rounded-md">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartId, -1)}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-[#181512] hover:bg-[#FAF8F5] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartId, 1)}
                              aria-label="Increase quantity"
                              className="p-1.5 text-[#181512] hover:bg-[#FAF8F5] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-[#181512] tabular-nums">
                            {formatNaira(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.cartId}
                      className="bg-white border border-[#E7E1D9] rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-medium text-[#6B1D3A]">
                            Makeup Appointment · {item.locationMode === 'studio' ? 'Studio Visit' : 'Home Service'}
                          </span>
                          <h3 className="text-sm font-semibold text-[#181512]">
                            {item.packageName}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartId)}
                          aria-label={`Remove ${item.packageName}`}
                          className="text-[#8B8278] hover:text-[#B91C1C] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#5A524A]">
                        {formatShortDate(item.date)} · {item.timeSlot} · {item.durationMinutes} mins
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE6] text-xs">
                        <span className="text-[#6E655D]">
                          {item.paymentTiming === 'deposit' ? '50% Booking Deposit' : 'Full Service Payment'}
                        </span>
                        <span className="text-sm font-semibold text-[#181512] tabular-nums">
                          {formatNaira(item.amountDueNow)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Delivery Zone */}
              {hasProducts && (
                <div className="bg-white border border-[#E7E1D9] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#181512]">Delivery Location</span>
                    {productSubtotal >= FREE_DELIVERY_THRESHOLD && (
                      <span className="text-[11px] font-medium text-[#15803D]">
                        Free delivery unlocked
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('calabar')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                        deliveryLocation === 'calabar'
                          ? 'border-[#181512] bg-[#181512] text-white'
                          : 'border-[#DDD5CA] text-[#181512]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Ikot Ekpene / Akwa Ibom</span>
                      <span className="block text-[11px] opacity-80 tabular-nums">
                        {formatNaira(CALABAR_DELIVERY_FEE)} · Same Day
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('nationwide')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                        deliveryLocation === 'nationwide'
                          ? 'border-[#181512] bg-[#181512] text-white'
                          : 'border-[#DDD5CA] text-[#181512]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Nationwide</span>
                      <span className="block text-[11px] opacity-80 tabular-nums">
                        {formatNaira(NATIONWIDE_DELIVERY_FEE)} · 2–4 Days
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Guest Checkout Form */}
              <form id="guest-checkout-form" onSubmit={handlePaySubmit} className="bg-white border border-[#E7E1D9] rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-[#181512]">
                  Guest Checkout (No account needed)
                </p>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#6B1D3A]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp Phone (e.g. 0705...)"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#6B1D3A]"
                  />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email for receipt"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#6B1D3A]"
                  />
                </div>
                {hasProducts && (
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      deliveryLocation === 'calabar'
                        ? 'Ikot Ekpene / Akwa Ibom Street Address & Landmark'
                        : 'Full Delivery Address & State'
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#6B1D3A]"
                  />
                )}

                <div className="pt-1">
                  <span className="block text-xs font-semibold text-[#181512] mb-2">
                    Paystack Payment Channel
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Card', 'Bank Transfer', 'USSD'] as PaymentChannel[]).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setPaymentChannel(ch)}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border cursor-pointer ${
                          paymentChannel === ch
                            ? 'border-[#6B1D3A] bg-[#6B1D3A]/10 text-[#6B1D3A]'
                            : 'border-[#DDD5CA] text-[#5A524A]'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-[#B91C1C] font-medium">{formError}</p>
                )}
              </form>
            </>
          )}
        </div>

        {!confirmedOrder && items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E7E1D9] space-y-3">
            <div className="space-y-1 text-xs text-[#5A524A]">
              {hasProducts && (
                <div className="flex justify-between">
                  <span>Products Subtotal</span>
                  <span className="tabular-nums">{formatNaira(productSubtotal)}</span>
                </div>
              )}
              {bookingDueNow > 0 && (
                <div className="flex justify-between">
                  <span>Makeup Booking Due Now</span>
                  <span className="tabular-nums">{formatNaira(bookingDueNow)}</span>
                </div>
              )}
              {hasProducts && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="tabular-nums">
                    {deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-[#181512] pt-2 border-t border-[#EFEAE2]">
                <span>Total to Pay Now</span>
                <span className="tabular-nums text-base">{formatNaira(grandTotalDueNow)}</span>
              </div>
              {bookingBalanceLater > 0 && (
                <div className="flex justify-between text-[11px] text-[#6E655D]">
                  <span>Remaining Makeup Balance</span>
                  <span className="tabular-nums">{formatNaira(bookingBalanceLater)}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              form="guest-checkout-form"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg transition-colors cursor-pointer tabular-nums"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay {formatNaira(grandTotalDueNow)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
