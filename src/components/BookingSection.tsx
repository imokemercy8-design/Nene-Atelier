import { useMemo, useState } from 'react';
import { Calendar, Check, Clock, Home, MapPin, ShieldCheck } from 'lucide-react';
import {
  AppointmentRecord,
  BlockedSlot,
  BookingCartItem,
  CartItem,
  PaymentTiming,
  ServiceLocationMode,
} from '../types/beauty';
import {
  HOME_SERVICE_FEE,
  MAKEUP_PACKAGES,
  STUDIO_ADDRESS,
  TIME_SLOTS,
} from '../data/seedData';
import { formatNaira, formatShortDate, getUpcomingDates } from '../utils/format';
import { ImageWithFallback } from './ImageWithFallback';

interface BookingSectionProps {
  appointments: AppointmentRecord[];
  blockedSlots: BlockedSlot[];
  cartItems: CartItem[];
  onAddBookingToBag: (booking: BookingCartItem) => void;
}

export function BookingSection({
  appointments,
  blockedSlots,
  cartItems,
  onAddBookingToBag,
}: BookingSectionProps) {
  const dates = useMemo(() => getUpcomingDates(14), []);
  const [selectedPackageId, setSelectedPackageId] = useState(MAKEUP_PACKAGES[0].id);
  const [locationMode, setLocationMode] = useState<ServiceLocationMode>('studio');
  const [homeAddress, setHomeAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState(dates[1].iso);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>('deposit');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [addedBanner, setAddedBanner] = useState(false);

  const selectedPackage = MAKEUP_PACKAGES.find((p) => p.id === selectedPackageId) || MAKEUP_PACKAGES[0];
  const transportFee = locationMode === 'home' ? HOME_SERVICE_FEE : 0;
  const totalServiceCost = selectedPackage.price + transportFee;
  const amountDueNow =
    paymentTiming === 'deposit' ? Math.round(totalServiceCost * 0.5) : totalServiceCost;
  const balanceAtAppointment = totalServiceCost - amountDueNow;

  const getSlotStatus = (dateIso: string, slot: string): 'available' | 'booked' | 'blocked' | 'in_bag' => {
    const isDayBlocked = blockedSlots.some(
      (b) => b.date === dateIso && b.timeSlot === 'ALL_DAY'
    );
    if (isDayBlocked) return 'blocked';

    const isSlotBlocked = blockedSlots.some(
      (b) => b.date === dateIso && b.timeSlot === slot
    );
    if (isSlotBlocked) return 'blocked';

    const isAlreadyBooked = appointments.some(
      (a) => a.status !== 'Cancelled' && a.date === dateIso && a.timeSlot === slot
    );
    if (isAlreadyBooked) return 'booked';

    const isInCart = cartItems.some(
      (c) => c.kind === 'booking' && c.date === dateIso && c.timeSlot === slot
    );
    if (isInCart) return 'in_bag';

    return 'available';
  };

  const handleReserve = () => {
    setBookingError(null);
    if (!selectedTimeSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }
    const status = getSlotStatus(selectedDate, selectedTimeSlot);
    if (status !== 'available') {
      setBookingError('That slot is no longer available. Please choose another time.');
      return;
    }
    if (locationMode === 'home' && !homeAddress.trim()) {
      setBookingError('Please enter your Calabar address for Home Service.');
      return;
    }

    onAddBookingToBag({
      kind: 'booking',
      cartId: `booking-${selectedDate}-${selectedTimeSlot}-${Date.now()}`,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      durationMinutes: selectedPackage.durationMinutes,
      basePrice: selectedPackage.price,
      locationMode,
      transportFee,
      homeAddress: locationMode === 'home' ? homeAddress.trim() : undefined,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      paymentTiming,
      amountDueNow,
      balanceAtAppointment,
    });

    setSelectedTimeSlot('');
    setAddedBanner(true);
    setTimeout(() => setAddedBanner(false), 3500);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-[#6E655D]">
          Makeup Appointments · Live Availability Calendar
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-[#181512]">
          Book your glam session with zero double-bookings.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5A524A]">
          Choose a package, select Studio Visit or Home Service, pick an open slot, and add it directly to your bag alongside wigs or press-on nails.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Packages + Location + Date/Time */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Service Menu */}
          <section className="bg-white border border-[#E7E1D9] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#181512]">01. Choose Makeup Package</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MAKEUP_PACKAGES.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`text-left rounded-xl border p-4 transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#6B1D3A] bg-[#6B1D3A]/[0.03]'
                        : 'border-[#E7E1D9] bg-white hover:border-[#BDB4A9]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#6E655D] tabular-nums">
                          {pkg.durationMinutes} mins
                        </span>
                        <span className="text-sm font-semibold text-[#181512] tabular-nums">
                          {formatNaira(pkg.price)}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold text-[#181512]">
                        {pkg.name}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#5A524A]">
                        {pkg.summary}
                      </p>
                    </div>
                    <ul className="mt-3 pt-3 border-t border-[#F2EDE6] space-y-1 text-xs text-[#453F3A]">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#6B1D3A] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Location Toggle */}
          <section className="bg-white border border-[#E7E1D9] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#181512]">02. Studio Visit or Home Service</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLocationMode('studio')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                  locationMode === 'studio'
                    ? 'border-[#6B1D3A] bg-[#6B1D3A]/[0.03]'
                    : 'border-[#E7E1D9] hover:border-[#BDB4A9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#181512]">
                    <MapPin className="w-4 h-4 text-[#6B1D3A]" /> Studio Visit
                  </span>
                  <span className="text-xs font-semibold text-[#15803D]">₦0 fee</span>
                </div>
                <p className="mt-1.5 text-xs text-[#5A524A]">{STUDIO_ADDRESS}</p>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode('home')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                  locationMode === 'home'
                    ? 'border-[#6B1D3A] bg-[#6B1D3A]/[0.03]'
                    : 'border-[#E7E1D9] hover:border-[#BDB4A9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#181512]">
                    <Home className="w-4 h-4 text-[#6B1D3A]" /> Home Service (Akwa Ibom)
                  </span>
                  <span className="text-xs font-semibold text-[#181512] tabular-nums">
                    +{formatNaira(HOME_SERVICE_FEE)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#5A524A]">
                  Artist arrives with studio lighting &amp; full kit in Ikot Ekpene &amp; nearby areas.
                </p>
              </button>
            </div>

            {locationMode === 'home' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#181512]">
                  Home Service Address / Hotel (Ikot Ekpene / Akwa Ibom)
                </label>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="e.g., Aba Road / GRA, Ikot Ekpene, Akwa Ibom State"
                  className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg text-[#181512] focus:outline-none focus:border-[#6B1D3A]"
                />
              </div>
            )}
          </section>

          {/* Step 3: Live Date & Time Picker */}
          <section className="bg-white border border-[#E7E1D9] rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-[#181512]">03. Select Date &amp; Time</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#6E655D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                Conflict-protected calendar
              </span>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => {
                const isDayBlocked = blockedSlots.some(
                  (b) => b.date === d.iso && b.timeSlot === 'ALL_DAY'
                );
                const active = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedTimeSlot('');
                    }}
                    className={`min-w-[68px] py-2.5 px-2 rounded-xl border text-center shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#181512] text-white border-[#181512]'
                        : isDayBlocked
                        ? 'bg-[#F5F2EE] text-[#A2988E] border-[#E7E1D9]'
                        : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512]'
                    }`}
                  >
                    <span className="block text-[11px] opacity-80">{d.weekday}</span>
                    <span className="block text-base font-semibold tabular-nums mt-0.5">{d.dayNum}</span>
                    <span className="block text-[11px] opacity-75">{d.month}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-[#6E655D] mb-2.5">
                Available slots for {formatShortDate(selectedDate)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const status = getSlotStatus(selectedDate, slot);
                  const isDisabled = status !== 'available';
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        setSelectedTimeSlot(slot);
                        setBookingError(null);
                      }}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors tabular-nums ${
                        isSelected
                          ? 'bg-[#6B1D3A] text-white border-[#6B1D3A] cursor-pointer'
                          : isDisabled
                          ? 'bg-[#F5F2EE] text-[#9C9288] border-[#E7E1D9] cursor-not-allowed'
                          : 'bg-white text-[#181512] border-[#DDD5CA] hover:border-[#181512] cursor-pointer'
                      }`}
                    >
                      <span className="block">{slot}</span>
                      {status !== 'available' && (
                        <span className="block text-[10px] mt-0.5 font-normal">
                          {status === 'booked'
                            ? 'Booked'
                            : status === 'in_bag'
                            ? 'In Your Bag'
                            : 'Unavailable'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Right Sticky Booking Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden">
          <div className="aspect-[16/10] bg-[#F2EDE6]">
            <ImageWithFallback
              src={selectedPackage.image}
              alt={selectedPackage.name}
              title={selectedPackage.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs text-[#6E655D]">Booking Summary</p>
              <h3 className="mt-1 text-lg font-semibold text-[#181512]">{selectedPackage.name}</h3>
              <div className="mt-2 space-y-1.5 text-xs text-[#5A524A]">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#6B1D3A]" />
                  <span>{formatShortDate(selectedDate)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6B1D3A]" />
                  <span>
                    {selectedTimeSlot || 'Select a time slot'} · {selectedPackage.durationMinutes} mins
                  </span>
                </p>
              </div>
            </div>

            {/* Deposit vs Full Payment */}
            <div className="space-y-2 pt-4 border-t border-[#EFEAE2]">
              <span className="block text-xs font-semibold text-[#181512]">Payment Option</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentTiming('deposit')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    paymentTiming === 'deposit'
                      ? 'border-[#181512] bg-[#181512] text-white'
                      : 'border-[#DDD5CA] bg-white text-[#181512]'
                  }`}
                >
                  <span className="block text-xs font-semibold">50% Deposit</span>
                  <span className="block text-[11px] opacity-80 mt-0.5">Non-refundable</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTiming('full')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    paymentTiming === 'full'
                      ? 'border-[#181512] bg-[#181512] text-white'
                      : 'border-[#DDD5CA] bg-white text-[#181512]'
                  }`}
                >
                  <span className="block text-xs font-semibold">100% Full Pay</span>
                  <span className="block text-[11px] opacity-80 mt-0.5">Zero balance later</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#EFEAE2] text-sm">
              <div className="flex justify-between text-[#5A524A]">
                <span>Package Fee</span>
                <span className="tabular-nums">{formatNaira(selectedPackage.price)}</span>
              </div>
              {transportFee > 0 && (
                <div className="flex justify-between text-[#5A524A]">
                  <span>Home Service Transport</span>
                  <span className="tabular-nums">{formatNaira(transportFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-[#181512] pt-2 border-t border-[#EFEAE2]">
                <span>Due at Checkout</span>
                <span className="tabular-nums text-base">{formatNaira(amountDueNow)}</span>
              </div>
              {balanceAtAppointment > 0 && (
                <div className="flex justify-between text-xs text-[#6E655D]">
                  <span>Balance on Appointment Day</span>
                  <span className="tabular-nums">{formatNaira(balanceAtAppointment)}</span>
                </div>
              )}
            </div>

            {bookingError && (
              <p className="text-xs font-medium text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {bookingError}
              </p>
            )}

            {addedBanner && (
              <p className="text-xs font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                Appointment slot added to your bag. Complete checkout to lock it in.
              </p>
            )}

            <button
              type="button"
              onClick={handleReserve}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg transition-colors cursor-pointer"
            >
              Add Appointment to Bag
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
