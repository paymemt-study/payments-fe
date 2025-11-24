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
  refundedAmountKrw?: number; // 부분/전체 환불 금액
}

export interface OrderDetail extends OrderSummary {
  payment: PaymentInfo | null;
}

// =======================
//   주문 생성 요청 타입
// =======================

export type CreateOrderItem = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  userId: number;              // 백엔드 Long userId 와 매칭
  items: CreateOrderItem[];    // 백엔드 OrderItemRequest 와 동일
};

// =======================
//   주문 생성 응답 타입
// =======================

export type CreateOrderResponse = {
  orderId: string;        // 백엔드 CreateOrderResponse.orderId 와 매칭 (externalId)
  totalAmountKrw: number; // 백엔드 CreateOrderResponse.totalAmountKrw
  currency: string;       // 백엔드 CreateOrderResponse.currency
};