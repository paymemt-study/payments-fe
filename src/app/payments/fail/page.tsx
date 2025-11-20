type Props = {
  searchParams: {
    code?: string;
    message?: string;
    orderId?: string;
  };
};

export default function PaymentFailPage({ searchParams }: Props) {
  const { code, message, orderId } = searchParams;

  return (
    <main style={{ padding: 40 }}>
      <h1>결제 실패</h1>

      <p>코드: {code}</p>
      <p>메시지: {message}</p>
      <p>주문번호: {orderId}</p>

      <a href="/checkout">다시 결제하기</a>
    </main>
  );
}