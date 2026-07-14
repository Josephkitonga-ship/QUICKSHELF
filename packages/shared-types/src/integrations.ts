export interface MarketplaceCredentials {
  apiKey: string;
  apiUser: string;
  sellerId: string;
  endpointUrl: string;
  isActive: boolean;
}

export interface SyncJobPayload {
  tenantId: string;
  sku: string;
  newQuantity: number;
  timestamp: number;
}

export interface JumiaStockUpdatePayload {
  Sku: string;
  Quantity: number;
}

export interface KilimallStockUpdatePayload {
  goodsSku: string;
  quantity: number;
}
