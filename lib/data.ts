// Sample data. Replace with Supabase queries when the backend is connected.
export type Shop = { slug: string; name: string; town: string; category: string; whatsapp: string; pickup: boolean; areas: { name: string; fee: number }[] }
export type Product = { slug: string; name: string; price: number; shop: string; shopName: string; town: string; shopWhatsapp: string; category: string; badge?: 'New' | 'Offer'; stock: number; description: string }

export const categories = ['Phones & Tablets', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Care', 'Groceries', 'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Services', 'Building', 'Water & Drinks']

export const shops: Shop[] = [
  { slug: 'mama-njeri', name: 'Mama Njeri’s Groceries', town: 'Westlands', category: 'Groceries', whatsapp: '254700000001', pickup: true, areas: [{ name: 'Westlands', fee: 70 }, { name: 'Nairobi CBD', fee: 100 }] },
  { slug: 'kamau-electronics', name: 'Kamau Electronics', town: 'Nairobi CBD', category: 'Electronics', whatsapp: '254700000002', pickup: true, areas: [] },
  { slug: 'wanjiru-fashion', name: 'Wanjiru Fashion', town: 'Thika', category: 'Fashion', whatsapp: '254700000003', pickup: true, areas: [{ name: 'Thika town', fee: 150 }] },
  { slug: 'otieno-hardware', name: 'Otieno Hardware', town: 'Kisumu', category: 'Building', whatsapp: '254700000004', pickup: true, areas: [{ name: 'Kisumu town', fee: 200 }] },
  { slug: 'achieng-home', name: 'Achieng Home', town: 'Mombasa', category: 'Home & Kitchen', whatsapp: '254700000005', pickup: true, areas: [{ name: 'Mombasa island', fee: 150 }] },
]

const p = (slug: string, name: string, price: number, shop: string, category: string, stock: number, badge?: 'New' | 'Offer'): Product => { const s = shops.find((x) => x.slug === shop)!; return { slug, name, price, shop, shopName: s.name, town: s.town, shopWhatsapp: s.whatsapp, category, stock, badge, description: 'Sample description. Replace with the shop’s own text.' } }
export const products: Product[] = [
  p('maize-flour-2kg', 'Maize flour 2 kg', 150, 'mama-njeri', 'Groceries', 24, 'Offer'),
  p('cooking-oil-1l', 'Cooking oil 1 L', 280, 'mama-njeri', 'Groceries', 2),
  p('tomatoes-1kg', 'Tomatoes 1 kg', 120, 'mama-njeri', 'Groceries', 40, 'New'),
  p('phone-charger', 'Phone charger', 450, 'kamau-electronics', 'Electronics', 15),
  p('bluetooth-speaker', 'Bluetooth speaker', 1800, 'kamau-electronics', 'Electronics', 6, 'Offer'),
  p('cotton-dress', 'Cotton dress', 1200, 'wanjiru-fashion', 'Fashion', 10, 'New'),
  p('sneakers', 'Sneakers', 2100, 'wanjiru-fashion', 'Fashion', 0),
  p('padlock-50mm', 'Padlock 50 mm', 380, 'otieno-hardware', 'Building', 30),
  p('work-boots', 'Work boots', 2900, 'otieno-hardware', 'Building', 8, 'New'),
  p('kitchen-set', 'Kitchen set', 2400, 'achieng-home', 'Home & Kitchen', 5),
]
export const ads = [{ id: 'a1', shop: 'kamau-electronics', headline: 'Weekend offer at Kamau Electronics', line: 'Chargers from KSh 450' }]
export const plans = [
  { id: 'starter', name: 'Starter', price: 800, products: 25, perks: ['Sell on QuickShelf', 'Your own vendor page', 'Orders on WhatsApp'] },
  { id: 'growth', name: 'Growth', price: 1500, products: 50, perks: ['Everything in Starter', 'Buy wholesale to restock'] },
  { id: 'top', name: 'Top tier', price: 2000, products: 100, perks: ['Everything in Growth', 'Supply wholesale to other vendors'] },
]
export const getShop = (slug: string) => shops.find((s) => s.slug === slug)
export const getProduct = (slug: string) => products.find((x) => x.slug === slug)

// Sample wholesale listings. Real ones come from the wholesale_terms table and are visible only to approved vendors.
export type WholesaleItem = { slug: string; name: string; supplier: string; town: string; whatsapp: string; moq: number; breaks: { from: number; price: number }[]; dispatch: string; specs: string; verified: boolean }
export const wholesale: WholesaleItem[] = [
  { slug: 'w-maize-flour', name: 'Maize flour 2 kg', supplier: 'Mwangi Wholesalers', town: 'Nairobi', whatsapp: '254700000011', moq: 12, breaks: [{ from: 12, price: 130 }, { from: 48, price: 122 }], dispatch: '2 days', specs: 'Maize meal, 2 kg pack', verified: true },
  { slug: 'w-cooking-oil', name: 'Cooking oil 1 L', supplier: 'Mwangi Wholesalers', town: 'Nairobi', whatsapp: '254700000011', moq: 12, breaks: [{ from: 12, price: 240 }, { from: 36, price: 232 }], dispatch: '2 days', specs: 'Edible oil, 1 L bottle', verified: true },
  { slug: 'w-phone-charger', name: 'Phone charger', supplier: 'Atieno Distributors', town: 'Kisumu', whatsapp: '254700000012', moq: 10, breaks: [{ from: 10, price: 360 }, { from: 50, price: 340 }], dispatch: '3 days', specs: 'Fast USB charger', verified: true },
  { slug: 'w-padlock', name: 'Padlock 50 mm', supplier: 'Karanja Supplies', town: 'Thika', whatsapp: '254700000013', moq: 6, breaks: [{ from: 6, price: 310 }, { from: 24, price: 290 }], dispatch: '1 day', specs: 'Steel padlock, 50 mm', verified: false },
]

// Price per unit for a quantity, using the supplier's price breaks.
export const unitPrice = (x: WholesaleItem, qty: number) => [...x.breaks].sort((p, q) => q.from - p.from).find((br) => qty >= br.from)?.price ?? x.breaks[0].price
