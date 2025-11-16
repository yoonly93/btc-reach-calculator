function App() {
  const [krw, setKrw] = React.useState(2000000);
  const [bithumbRate, setBithumbRate] = React.useState("");
  const [okxRate, setOkxRate] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // KRW 버튼 추가
  const addAmount = (v) => setKrw((prev) => prev + v);

  // 자동 환율 불러오기
  const fetchRates = async () => {
    setLoading(true);
    try {
      const bithumbRes = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
      const bithumbData = await bithumbRes.json();
      const usdtKrw = Number(bithumbData.data.closing_price);
      setBithumbRate(usdtKrw);

      const okxRes = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
      const okxData = await okxRes.json();
      const btcUsdt = Number(okxData.data[0].last);
      setOkxRate(btcUsdt);
    } catch (e) {
      alert("환율을 불러오지 못했습니다. 직접 입력해주세요.");
    }
    setLoading(false);
  };

  // 계산
  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력하거나 자동 불러오기 버튼을 눌러주세요.");
      return;
    }

    // 1) KRW → USDT (Bithumb 수수료 0.04%)
    const usdt = krw / bithumbRate * 0.9996;

    // 2) OKX에서 BTC 구매 (0.10% 매수 수수료)
    const btc = usdt * 0.999 / okxRate;

    // 3) 출금 수수료
    const finalBtc = Math.max(0, btc - 0.00001);

    setResult({
      usdt: usdt.toFixed(8),
      btc: btc.toFixed(8),
      finalBtc: finalBtc.toFixed(8),
    });
  };

  // 초기화
  const reset = () => {
    setKrw(2000000);
    setBithumbRate("");
    setOkxRate("");
    setResult(null);
  };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h2>BTC 도달량 계산기</h2>

      <div style={{ marginBottom: 12 }}>
        <label>투입 원화:</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input type="number" value={krw} onChange={(e) => setKrw(Number(e.target.value))} style={{ flex: 1, padding: 8 }} />
          <button onClick={() => addAmount(100000)}>+10만</button>
          <button onClick={() => addAmount(1000000)}>+100만</button>
          <button onClick={() => addAmount(10000000)}>+1000만</button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={fetchRates} style={{ width: "100%", padding: 10 }}>
          실시간 환율 불러오기
        </button>
      </div>

      {loading && <p>환율 불러오는 중...</p>}

      <div style={{ marginBottom: 12 }}>
        <label>Bithumb USDT/KRW:</label>
        <input type="number" value={bithumbRate} onChange={(e) => setBithumbRate(Number(e.target.value))} style={{ width: "100%", padding: 8, marginTop: 4 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>OKX BTC/USDT:</label>
        <input type="number" value={okxRate} onChange={(e) => setOkxRate(Number(e.target.value))} style={{ width: "100%", padding: 8, marginTop: 4 }} />
      </div>

      <button onClick={calculate} style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 12 }}>
        계산
      </button>
      <button onClick={reset} style={{ width: "100%", padding: 12, fontSize: 16 }}>
        초기화
      </button>

      {result && (
        <div style={{ marginTop: 16, padding: 16, background: "#f7f7f7", borderRadius: 8 }}>
          <p>구매 USDT (김프 포함): {result.usdt}</p>
          <p>OKX 매수 사용 USDT: {result.btc}</p>
          <p>최종 도달 BTC (출금 후): <b>{result.finalBtc}</b></p>
        </div>
      )}
    </div>
  );
}

// React 18 기준 createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
