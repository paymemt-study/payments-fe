# 💳 Payments FE – 결제 시스템 데모 
Next.js 14 App Router 기반 결제 데모 프로젝트입니다.
TossPayments SDK를 이용해 카드 결제 수행 → 성공/실패 페이지로 이동 → Webhook 자동 동기화까지 포함합니다.

## 📁 패키지 구조
```text
src/
├─ app/
│  ├─ page.tsx                 # 메인 페이지 (필요 시)
│  ├─ checkout/page.tsx        # 결제 데모 페이지 (상품 선택 + 주문 생성 + Toss 결제 호출)
│  └─ payments/
│     ├─ success/page.tsx      # 결제 성공 페이지 (paymentKey, orderId, amount 표시 예정)
│     └─ fail/page.tsx         # 결제 실패 페이지 (에러 메시지 표시 예정)
│
├─ types/
│  └─ order.ts                 # Order / Payment / Product 관련 타입 정의
└─ styles/
   └─ globals.css              # 글로벌 스타일

```

## 🧩  구성 요소 요약
###  **1. 상품 조회**
- GET api/products
- Checkout 페이지에서 상품을 렌더링

### **2. 주문 생성**

- 여러 상품 + 수량 기반 Order + OrderLine 생성

 Request:
```ts
export type CreateOrderItem = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  userId: number;
  items: CreateOrderItem[];
};
```
Response:
```ts
export type CreateOrderResponse = {
  orderId: string;
  totalAmountKrw: number;
  currency: string;
};
```

3. TossPayments 결제창 실행

```ts
tossPayments.requestPayment("카드", {
  amount: order.totalAmountKrw,
  orderId: order.orderId,
  orderName: "테스트 주문",
  successUrl: `${origin}/payments/success`,
  failUrl: `${origin}/payments/fail`,
});
```
### **4. 결제 성공 페이지**

- successUrl에서 paymentKey, orderId, amount 쿼리 파라미터 제공됨
- 백엔드로 Confirm API 호출 → 결제 승인

### **5. 결제 실패 페이지**

- Toss가 실패 원인을 failUrl에 전달함

## **💳 Checkout UI 구현 요약**

### **기능:**
- 상품 목록 자동 렌더링
- 상품별 수량 증가/감소(+/-)
- 여러 상품을 동시에 선택 가능
- 선택된 상품 목록 미리보기
- “결제하기” 버튼 클릭 시:
    1. 주문 생성 API 호출
    2. TossPayments 결제창 실행

결제 흐름
```
프론트: 상품 선택 → 주문 생성 → Toss 결제 요청
백엔드: 승인 API 호출 → payment 상태 업데이트
Toss: Webhook → 주문/결제 상태 최종 동기화
```