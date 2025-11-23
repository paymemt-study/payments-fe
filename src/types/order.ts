export type OrderStatus = "PENDING" | "PAID" | "CANCELED" | "FAILED";

export interface OrderSummary {
  orderId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string; // ISO 문자열
}

export interface PaymentInfo {
  paymentKey: string;
  status: string;
  provider: string;
  approvedAt: string;
}

export interface OrderDetail extends OrderSummary {
  payment: PaymentInfo | null;
}