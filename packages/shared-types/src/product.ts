export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  category?: string;
  tags?: string[];
  imageUrls: string[];
  syncToJumia: boolean;
  syncToKilimall: boolean;
  jumiaSku?: string;
  kilimallSku?: string;
  createdAt: string;
  updatedAt: string;
}
export interface InventoryUpdateRequest {
  sku: string;
  quantityDelta: number;
  source: "pos" | "jumia" | "kilimall" | "manual";
}
