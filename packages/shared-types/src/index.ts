export type MarketplaceChannel = 'jumia' | 'kilimall';
export type IntegrationStatus = 'active' | 'paused' | 'error';

export interface MarketplaceConnection {
  id: string;
  productId: string;
  platformName: MarketplaceChannel;
  marketplaceSku: string;
  syncEnabled: boolean;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
}

export interface Product {
  id: string;
  skuReference: string;
  title: string;
  description: string | null;
  basePriceKes: number;
  unifiedStock: number;
  isPublishedStorefront: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithIntegrations extends Product {
  integrations: MarketplaceConnection[];
}

export type OrderSourceChannel = 'pos' | 'storefront' | 'jumia' | 'kilimall';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'mpesa' | 'cash' | 'marketplace_escrow';

export interface OrderItem {
  id?: number;
  orderId: string;
  productId: string;
  quantityRequested: number;
  unitPriceKes: number;
}

export interface Order {
  id: string;
  sourceChannel: OrderSourceChannel;
  externalOrderReference: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmountKes: number;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
