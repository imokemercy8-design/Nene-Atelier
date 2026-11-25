import { useState } from 'react';
import {
  CalendarX,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  AppointmentRecord,
  BlockedSlot,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '../types/beauty';
import { TIME_SLOTS } from '../data/seedData';
import { formatNaira, formatShortDate, getUpcomingDates } from '../utils/format';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  appointments: AppointmentRecord[];
  blockedSlots: BlockedSlot[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddBlockedSlot: (slot: BlockedSlot) => void;
  onRemoveBlockedSlot: (slotId: string) => void;
}

type AdminTab = 'inventory' | 'orders' | 'calendar';

const STUDIO_PHOTO_PRESETS = [
  { label: 'Nigerian Model — 30" Bussdown Straight', url: '/src/assets/images/wig_model_bussdown_30_1795600731070.jpg' },
  { label: 'Nigerian Model — Double-Drawn 13x4 Straight', url: '/src/assets/images/ng_wig_double_drawn_1795601033321.jpg' },
  { label: 'Nigerian Model — 360 High Ponytail Bussdown', url: '/src/assets/images/ng_wig_high_ponytail_1795601033452.jpg' },
  { label: 'Nigerian Model — 5x5 Glueless Side-Part Straight', url: '/src/assets/images/ng_wig_glueless_closure_1795601033734.jpg' },
  { label: 'Nigerian Model — Wet Water Wave', url: '/src/assets/images/wig_model_waterwave_wet_1795600730276.jpg' },
  { label: 'Nigerian Model — Deep-Wave Waterfall Frontal', url: '/src/assets/images/ng_wig_deepwave_waterfall_1795601035325.jpg' },
  { label: 'Nigerian Model — Beach-Curl Glueless Water Wave', url: '/src/assets/images/ng_wig_beach_curl_1795601035915.jpg' },
  { label: 'Nigerian Model — Piano Highlights Wave', url: '/src/assets/images/wig_model_piano_highlights_1795600730721.jpg' },
  { label: 'Nigerian Model — Copper Ginger Wave', url: '/src/assets/images/wig_model_ginger_copper_1795600731181.jpg' },
  { label: 'Nigerian Model — Kinky Straight Blowout', url: '/src/assets/images/wig_model_kinky_straight_1795600732555.jpg' },
  { label: 'Nigerian Model — Knotless Braid Frontal', url: '/src/assets/images/wig_model_braided_cornrow_1795600731893.jpg' },
  { label: 'Nigerian Model — 90s Blowout Curtain Bangs', url: '/src/assets/images/wig_model_curtain_bangs_1795600732484.jpg' },
  { label: 'Nigerian Model — Rooted #613 Blonde', url: '/src/assets/images/wig_model_ash_blonde_1795600733874.jpg' },
  { label: 'Nigerian Model — Jerry Curl Bob', url: '/src/assets/images/wig_model_jerry_curl_1795600734338.jpg' },
  { label: 'Nigerian Model — Asymmetrical Sleek Bob', url: '/src/assets/images/wig_model_asymmetrical_bob_1795600734295.jpg' },
  { label: 'Nigerian Model — 99J Burgundy Curl', url: '/src/assets/images/wig_model_burgundy_curl_1795600747134.jpg' },
  { label: 'Nigerian Model — Chocolate Mocha Wave', url: '/src/assets/images/wig_model_chocolate_twist_1795600734742.jpg' },
  { label: 'Bone-Straight Wig', url: '/src/assets/images/product_wig_bussdown_1795599126778.jpg' },
  { label: 'Body Wave Wig', url: '/src/assets/images/product_wig_bodywave_1795599450967.jpg' },
  { label: '99J Burgundy Wine Wig', url: '/src/assets/images/product_wig_wine_red_1795600400625.jpg' },
  { label: 'Honey Blonde Wig', url: '/src/assets/images/product_wig_blonde_1795599452058.jpg' },
  { label: 'Deep-Wave Curly Wig', url: '/src/assets/images/product_wig_curly_1795599127471.jpg' },
  { label: 'Kinky-Curly 4A Wig', url: '/src/assets/images/product_wig_kinky_1795599453783.jpg' },
  { label: 'Full Bangs Fringe Bob', url: '/src/assets/images/product_wig_fringe_1795600378356.jpg' },
  { label: 'Silk Headband Curly Wig', url: '/src/assets/images/product_wig_headband_1795600377571.jpg' },
  { label: 'Feathered Pixie Wig', url: '/src/assets/images/product_wig_pixie_1795599452853.jpg' },
  { label: 'Straight 3-Bundle + Frontal', url: '/src/assets/images/product_hair_bundles_1795600377767.jpg' },
  { label: 'Curly 3-Bundle + Closure', url: '/src/assets/images/product_wig_waterwave_bundles_1795600398663.jpg' },
  { label: 'French Almond Nails', url: '/src/assets/images/product_nails_almond_1795599128094.jpg' },
  { label: '3D Molten Gold Swirl Nails', url: '/src/assets/images/product_nails_goldswirl_1795600379629.jpg' },
  { label: 'Baby Boomer Ombre Nails', url: '/src/assets/images/product_nails_ombre_1795600378350.jpg' },
  { label: 'Plum Chrome Nails', url: '/src/assets/images/product_nails_chrome_1795599128261.jpg' },
  { label: 'Bridal Pearl Nails', url: '/src/assets/images/product_nails_pearl_1795599453814.jpg' },
  { label: 'Champagne Cat-Eye Nails', url: '/src/assets/images/product_nails_cateye_1795599705911.jpg' },
  { label: 'Emerald Gold Rim Nails', url: '/src/assets/images/product_nails_emerald_1795599706810.jpg' },
  { label: 'Amber Tortoiseshell Nails', url: '/src/assets/images/product_nails_tortoiseshell_1795599705465.jpg' },
  { label: 'Velvet Matte Cocoa Nails', url: '/src/assets/images/product_nails_matte_nude_1795599706918.jpg' },
  { label: 'Rose Aura Crystal Nails', url: '/src/assets/images/product_nails_rhinestone_1795599706984.jpg' },
  { label: 'Parisian Cherry Stiletto', url: '/src/assets/images/product_nails_crimson_1795599708230.jpg' },
  { label: 'Hot Comb & Care Kit', url: '/src/assets/images/product_beauty_accessories_1795599452623.jpg' },
  { label: 'Silk Bonnet & Edge Kit', url: '/src/assets/images/product_bonnet_edge_1795600380719.jpg' },
  { label: 'Pro Nail Glue & Care Kit', url: '/src/assets/images/product_nails_care_kit_1795600399464.jpg' },
];

export function AdminDashboard({
  products,
  orders,
  appointments,
  blockedSlots,
  onUpdateStock,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddBlockedSlot,
  onRemoveBlockedSlot,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [inventorySearch, setInventorySearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');

  // Add Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Press-On Nails');
  const [newPrice, setNewPrice] = useState('18500');
  const [newStock, setNewStock] = useState('10');
  const [newNote, setNewNote] = useState('');
  const [newImage, setNewImage] = useState(STUDIO_PHOTO_PRESETS[6].url);

  // Block Slot Form State
  const dates = getUpcomingDates(14);
  const [blockDate, setBlockDate] = useState(dates[0].iso);
  const [blockTime, setBlockTime] = useState<string>('ALL_DAY');
  const [blockReason, setBlockReason] = useState('Studio Closed / Private Booking');

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalChargedNow, 0);
  const lowStockCount = products.filter((p) => p.stock <= 3).length;
  const activeBookingsCount = appointments.filter((a) => a.status === 'Confirmed').length;

  const filteredOrders =
    orderStatusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  const filteredInventory = inventorySearch.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
          p.category.toLowerCase().includes(inventorySearch.toLowerCase())
      )
    : products;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const priceNum = Math.max(1000, Number(newPrice) || 15000);
    const stockNum = Math.max(0, Number(newStock) || 0);

    const created: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      basePrice: priceNum,
      stock: stockNum,
      badgeText: 'New Listing',
      wigCapType: newCategory === 'Wigs' ? '13x4 HD Frontal' : newCategory === 'Press-On Nails' ? 'Custom Gel Set' : 'Studio Essential',
      image: newImage.trim() || STUDIO_PHOTO_PRESETS[0].url,
      textureNote:
        newNote.trim() ||
        (newCategory === 'Wigs'
          ? 'Raw virgin strands · Pre-plucked hairline'
          : 'Salon-grade reusable set'),
      description: 'Added via Nene Atelier Inventory Console.',
      ...(newCategory === 'Wigs'
        ? {
            lengths: ['16"', '20"', '24"', '28"'],
            laceTypes: ['HD Lace', 'Transparent Lace'],
            densities: ['180%', '200%', '250%'],
          }
        : newCategory === 'Press-On Nails'
        ? {
            nailShapes: ['Almond', 'Coffin', 'Stiletto', 'Square'],
            nailSizes: ['XS', 'S', 'M', 'L'],
          }
        : {
            accessoryOptions: ['Standard'],
          }),
    };
    onAddProduct(created);
    setNewName('');
    setNewNote('');
  };

  const handleBlockSlot = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBlockedSlot({
      id: `BLK-${Date.now()}`,
      date: blockDate,
      timeSlot: blockTime,
      reason: blockReason.trim() || 'Unavailable',
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E7E1D9]">
        <div>
          <p className="text-xs text-[#6E655D]">Staff &amp; Owner Operations</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-[#181512]">
            Studio Admin Console
          </h1>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg self-start" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inventory'}
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({products.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
            }`}
          >
            <CalendarX className="w-3.5 h-3.5" />
            <span>Booking Calendar ({activeBookingsCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E7E1D9] rounded-xl p-5">
          <p className="text-xs text-[#6E655D]">Collected Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-[#181512] tabular-nums">
            {formatNaira(totalRevenue)}
          </p>
        </div>
        <div className="bg-white border border-[#E7E1D9] rounded-xl p-5">
          <p className="text-xs text-[#6E655D]">Confirmed Glam Appointments</p>
          <p className="mt-1 text-2xl font-semibold text-[#181512] tabular-nums">
            {activeBookingsCount}
          </p>
        </div>
        <div className="bg-white border border-[#E7E1D9] rounded-xl p-5">
          <p className="text-xs text-[#6E655D]">Low-Stock Alerts (&le; 3 units)</p>
          <p className="mt-1 text-2xl font-semibold text-[#181512] tabular-nums">
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFEAE2] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#181512]">Product Stock Ledger</h2>
                <span className="text-xs text-[#6E655D]">Live sync with Storefront</span>
              </div>
              <input
                type="search"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Filter catalog SKUs..."
                aria-label="Filter inventory products"
                className="w-full sm:w-56 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg text-[#181512] focus:outline-none focus:border-[#6B1D3A]"
              />
            </div>
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#EFEAE2] text-xs text-[#6E655D] bg-white sticky top-0">
                    <th className="py-3 px-4 font-medium">Product</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium text-right">Base Price</th>
                    <th className="py-3 px-4 font-medium text-right">Stock</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EDE6]">
                  {filteredInventory.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-medium text-[#181512]">{product.name}</td>
                      <td className="py-3 px-4 text-xs text-[#5A524A]">{product.category}</td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {formatNaira(product.basePrice)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 1))}
                            className="w-6 h-6 rounded border border-[#DDD5CA] text-xs font-semibold hover:bg-[#EFEAE2] cursor-pointer"
                            aria-label={`Decrease stock for ${product.name}`}
                          >
                            -
                          </button>
                          <span
                            className={`w-7 text-center font-mono text-xs tabular-nums font-semibold ${
                              product.stock <= 2 ? 'text-[#B91C1C]' : 'text-[#181512]'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.id, product.stock + 1)}
                            className="w-6 h-6 rounded border border-[#DDD5CA] text-xs font-semibold hover:bg-[#EFEAE2] cursor-pointer"
                            aria-label={`Increase stock for ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product.id)}
                          aria-label={`Delete ${product.name}`}
                          className="p-1.5 text-[#8B8278] hover:text-[#B91C1C] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={handleCreateProduct}
            className="lg:col-span-4 bg-white border border-[#E7E1D9] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#181512]">Add New Listing</h2>
            <div>
              <label className="block text-xs font-medium text-[#5A524A] mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Sunset Ombre Almond Press-Ons"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5A524A] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
                >
                  <option value="Wigs">Wigs</option>
                  <option value="Press-On Nails">Press-On Nails</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A524A] mb-1">Stock Count</label>
                <input
                  type="number"
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A524A] mb-1">Base Price (₦)</label>
              <input
                type="number"
                min={500}
                step={500}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A524A] mb-1">Texture / Finish Note</label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g., Soft builder gel · Reusable"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A524A] mb-1">
                Studio Photo Preset
              </label>
              <select
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
              >
                {STUDIO_PHOTO_PRESETS.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#6B1D3A] hover:bg-[#55152D] rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish Product
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Order Management */}
      {activeTab === 'orders' && (
        <div className="mt-8 bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EFEAE2] flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#181512]">Customer Orders &amp; Dispatch</h2>
            <div className="inline-flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg">
              {(['All', 'Processing', 'Dispatched', 'Delivered'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    orderStatusFilter === status ? 'bg-white text-[#181512]' : 'text-[#5A524A]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#EFEAE2] text-xs text-[#6E655D]">
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer &amp; Address</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium text-right">Paid Now</th>
                  <th className="py-3 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EDE6]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#181512]">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#181512]">{order.customerName}</p>
                      <p className="text-xs text-[#5A524A]">
                        {order.customerPhone} · {order.address}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#453F3A]">
                      {order.items
                        .map((i) =>
                          i.kind === 'product'
                            ? `${i.quantity}x ${i.name}`
                            : `${i.packageName} (${formatShortDate(i.date)})`
                        )
                        .join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                      {formatNaira(order.totalChargedNow)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        aria-label={`Order status for ${order.id}`}
                        className="px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Booking Calendar & Slot Blocking */}
      {activeTab === 'calendar' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E7E1D9] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFEAE2] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#181512]">Upcoming Makeup Appointments</h2>
              <span className="text-xs text-[#6E655D]">Synced with customer booking slots</span>
            </div>
            <div className="divide-y divide-[#F2EDE6]">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6E655D]">
                      <span className="font-mono text-[#181512] font-semibold">
                        {formatShortDate(apt.date)} · {apt.timeSlot}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.locationMode === 'studio' ? 'Studio Visit' : 'Home Service'}</span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-[#181512]">
                      {apt.packageName} — {apt.clientName}
                    </h3>
                    <p className="text-xs text-[#5A524A] mt-0.5">
                      Phone: {apt.clientPhone}
                      {apt.homeAddress ? ` · Address: ${apt.homeAddress}` : ''}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs font-semibold text-[#15803D] tabular-nums">
                      Paid: {formatNaira(apt.amountPaid)}
                    </p>
                    <p className="text-xs text-[#6E655D] tabular-nums mt-0.5">
                      Balance: {formatNaira(apt.balanceDue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <form
              onSubmit={handleBlockSlot}
              className="bg-white border border-[#E7E1D9] rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-[#181512]">Block Unavailable Dates/Hours</h2>
              <div>
                <label className="block text-xs font-medium text-[#5A524A] mb-1">Date</label>
                <select
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
                >
                  {dates.map((d) => (
                    <option key={d.iso} value={d.iso}>
                      {formatShortDate(d.iso)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A524A] mb-1">Time Slot</label>
                <select
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
                >
                  <option value="ALL_DAY">Entire Day</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A524A] mb-1">Reason</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DDD5CA] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#181512] hover:bg-[#312C27] rounded-lg cursor-pointer"
              >
                Block Slot
              </button>
            </form>

            <div className="bg-white border border-[#E7E1D9] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#181512]">Currently Blocked</h3>
              {blockedSlots.length === 0 ? (
                <p className="text-xs text-[#6E655D]">No blocked dates or slots.</p>
              ) : (
                <ul className="space-y-2">
                  {blockedSlots.map((blk) => (
                    <li
                      key={blk.id}
                      className="flex items-center justify-between gap-2 text-xs py-2 border-b border-[#F2EDE6] last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-[#181512]">
                          {formatShortDate(blk.date)} · {blk.timeSlot === 'ALL_DAY' ? 'All Day' : blk.timeSlot}
                        </p>
                        <p className="text-[#6E655D]">{blk.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveBlockedSlot(blk.id)}
                        className="text-xs font-medium text-[#6B1D3A] hover:underline cursor-pointer"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
