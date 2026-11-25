export type ProductCategory = 'Wigs' | 'Press-On Nails' | 'Accessories';

export type LaceType = 'HD Lace' | 'Transparent Lace';
export type WigDensity = '180%' | '200%' | '250%';
export type NailShape = 'Almond' | 'Coffin' | 'Stiletto' | 'Oval' | 'Square' | 'Squoval';
export type NailSize = 'XS' | 'S' | 'M' | 'L';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  secondaryImage?: string;
  badgeText?: string;
  wigCapType?: string;
  collectionTags?: string[];
  textureNote: string;
  description: string;
  specs?: string[];
  lengths?: string[];
  laceTypes?: LaceType[];
  densities?: WigDensity[];
  nailShapes?: NailShape[];
  nailSizes?: NailSize[];
  accessoryOptions?: string[];
}

export interface SelectedVariant {
  length?: string;
  laceType?: LaceType;
  density?: WigDensity;
  nailShape?: NailShape;
  nailSize?: NailSize;
  accessoryOption?: string;
}

export interface ProductCartItem {
  kind: 'product';
  cartId: string;
  productId: string;
  name: string;
  category: ProductCategory;
  image: string;
  unitPrice: number;
  quantity: number;
  variant: SelectedVariant;
}

export interface MakeupPackage {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  summary: string;
  includes: string[];
  image: string;
}

export type ServiceLocationMode = 'studio' | 'home';
export type PaymentTiming = 'deposit' | 'full';

export interface BookingCartItem {
  kind: 'booking';
  cartId: string;
  packageId: string;
  packageName: string;
  durationMinutes: number;
  basePrice: number;
  locationMode: ServiceLocationMode;
  transportFee: number;
  homeAddress?: string;
  date: string;
  timeSlot: string;
  paymentTiming: PaymentTiming;
  amountDueNow: number;
  balanceAtAppointment: number;
}

export type CartItem = ProductCartItem | BookingCartItem;

export type DeliveryLocation = 'calabar' | 'nationwide';
export type PaymentChannel = 'Card' | 'Bank Transfer' | 'USSD';
export type OrderStatus = 'Processing' | 'Dispatched' | 'Delivered';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryLocation?: DeliveryLocation;
  deliveryFee: number;
  address: string;
  paymentChannel: PaymentChannel;
  items: CartItem[];
  totalChargedNow: number;
  balanceDueLater: number;
  status: OrderStatus;
}

export interface AppointmentRecord {
  id: string;
  orderId: string;
  packageName: string;
  date: string;
  timeSlot: string;
  locationMode: ServiceLocationMode;
  clientName: string;
  clientPhone: string;
  homeAddress?: string;
  totalPrice: number;
  amountPaid: number;
  balanceDue: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface BlockedSlot {
  id: string;
  date: string;
  timeSlot: string | 'ALL_DAY';
  reason: string;
}

export interface ClientTestimonial {
  id: string;
  name: string;
  city: string;
  purchasedItem: string;
  quote: string;
}
