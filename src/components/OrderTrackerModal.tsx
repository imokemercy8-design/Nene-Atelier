import { useState } from 'react';
import { PackageCheck, Search, X } from 'lucide-react';
import { Order } from '../types/beauty';
import { formatNaira, formatShortDate } from '../utils/format';

interface OrderTrackerModalProps {
  open: boolean;
  orders: Order[];
  onClose: () => void;
}

export function OrderTrackerModal({ open, orders, onClose }: OrderTrackerModalProps) {
  const [query, setQuery] = useState('NA-2041');

  if (!open) return null;

  const trimmed = query.trim().toLowerCase();
  const matchedOrder = orders.find(
    (o) =>
      o.id.toLowerCase() === trimmed ||
      o.customerPhone.replace(/\s+/g, '').includes(trimmed.replace(/\s+/g, '')) ||
      o.customerEmail.toLowerCase() === trimmed
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Track Order"
    >
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl border border-[#E7E1D9] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-[#E7E1D9] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#181512]">Track Order &amp; Booking</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order tracker"
            className="p-1.5 text-[#5A524A] hover:text-[#181512] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
              Enter Order ID (e.g. NA-2041, NA-2042) or Phone Number
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#6E655D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NA-2041 or 0803..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#6B1D3A]"
              />
            </div>
          </div>

          {matchedOrder ? (
            <div className="bg-white border border-[#E7E1D9] rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#6E655D] tabular-nums">
                    Order #{matchedOrder.id} · {matchedOrder.createdAt}
                  </p>
                  <h3 className="text-base font-semibold text-[#181512] mt-0.5">
                    {matchedOrder.customerName}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1D3A]">
                  <PackageCheck className="w-4 h-4" />
                  {matchedOrder.status}
                </span>
              </div>

              <div className="space-y-2 border-t border-[#EFEAE2] pt-3 text-xs text-[#453F3A]">
                {matchedOrder.items.map((item) => (
                  <div key={item.cartId} className="flex justify-between gap-2">
                    <span>
                      {item.kind === 'product'
                        ? `${item.quantity}x ${item.name}`
                        : `${item.packageName} (${formatShortDate(item.date)} · ${item.timeSlot})`}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatNaira(
                        item.kind === 'product'
                          ? item.unitPrice * item.quantity
                          : item.amountDueNow
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EFEAE2] text-xs flex justify-between text-[#5A524A]">
                <span>Destination: {matchedOrder.address}</span>
                <span className="font-semibold text-[#181512] tabular-nums">
                  Paid: {formatNaira(matchedOrder.totalChargedNow)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6E655D] bg-white border border-[#E7E1D9] rounded-xl p-4">
              No matching order found. Try <span className="font-mono text-[#181512]">NA-2041</span> or <span className="font-mono text-[#181512]">NA-2042</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
