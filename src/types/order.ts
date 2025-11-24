export type PaymentStatus =
  | "INIT"
  | "PAID"
  | "PARTIAL_REFUND"
  | "REFUNDED"
  | "CANCELED"
  | "FAILED";

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
  status: PaymentStatus;
  provider: string;      // ex) "TOSS"
  method: string;        // ex) "CARD"
  amountKrw: number;     // 결제(또는 전체 결제) 금액
  approvedAt: string;    // ISO 문자열
  canceledAt?: string;   // 취소(환불) 완료 시각
  refundedAmount?: number; // 부분/전체 환불 금액
}

export interface OrderDetail extends OrderSummary {
  payment: PaymentInfo | null;
}