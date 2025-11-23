import Link from "next/link";
import { OrderSummary } from "@/types/order";

async function fetchMyOrders(): Promise<OrderSummary[]> {
  // TODO: userId는 나중에 로그인 붙이면 토큰/세션에서 가져오고,
  // 지금은 데모로 1 고정
  const res = await fetch("http://localhost:8080/api/orders/me?userId=1", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("주문 목록 조회 실패");
  }

  return res.json();
}

export default async function OrdersPage() {
  const orders = await fetchMyOrders();

  return (
    <main style={{ padding: 40 }}>
      <h1>내 주문 목록</h1>

      {orders.length === 0 && <p>주문 내역이 없습니다.</p>}

      {orders.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>주문번호</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>금액</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>통화</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>상태</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>생성일시</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  <Link href={`/orders/${o.orderId}`}>{o.orderId}</Link>
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.amount.toLocaleString()}원
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.currency}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.status}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {new Date(o.createdAt).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/checkout">새 결제하기</Link>
      </div>
    </main>
  );
}