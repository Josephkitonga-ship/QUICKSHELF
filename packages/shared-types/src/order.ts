export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "mpesa" | "card" | "split";

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  tenantId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  source: "pos" | "storefront" | "jumia" | "kilimall";
  externalOrderId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}
