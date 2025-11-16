// app.jsx
function App() {
  const [krw, setKrw] = React.useState(2000000);
  const [bithumbRate, setBithumbRate] = React.useState("");
  const [okxRate, setOkxRate] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // KRW 버튼 증가
  const addAmount = (v) => setKrw((prev) => prev + v);

  // 자동 환율 불러오기
  const fetchRates = async () => {
    setLoading(true);
    try {
      const bithumbRes = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
      const bithumbData = await bithumbRes.json();
      setBithumbRate(Number(bithumbData.data.closing_price));

      const okxRes = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
      const okxData = await okxRes.json();
      setOkxRate(Number(okxData.data[0].last));
    } catch (e) {
      alert("환율을 불러오지 못했습니다.");
    }
    setLoading(false);
  };

  // 계산
  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 불러오세요.");
      return;
    }

    const usdt = (krw / bithumbRate) * 0.9996;        // 빗썸 수수료 0.04%
    const btc = (usdt * 0.999) / okxRate;             // OKX 매수 수수료 0.10%
    const finalBtc = Math.max(0, btc - 0.00001);      // 출금 수수료

    setResult({
      usdt: usdt.toFixed(8),
      btc: btc.toFixed(8),
      finalBtc: finalBtc.toFixed(8),
    });
  };

  const reset = () => {
    setKrw(2000000);
    setBithumbRate("");
    setOkxRate("");
    setResult(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-8 bg-white shadow-lg rounded-xl border">
      <h2 className="text-2xl font-bold mb-6 text-center">BTC 도달량 계산기</h2>

      {/* KRW 입력 */}
      <div className="mb-6">
        <label className="font-medium">투입 원화</label>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={krw}
            onChange={(e) => setKrw(Number(e.target.value))}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button className="px-3 py-2 bg-gray-100 rounded-lg" onClick={() => addAmount(100000)}>+10만</button>
          <button className="px-3 py-2 bg-gray-100 rounded-lg" onClick={() => addAmount(1000000)}>+100만</button>
          <button className="px-3 py-2 bg-gray-100 rounded-lg" onClick={() => addAmount(10000000)}>+1000만</button>
        </div>
      </div>

      {/* 자동 환율 버튼 */}
      <button
        onClick={fetchRates}
        className="w-full py-3 bg-blue-600 text-white rounded-lg mb-4 hover:bg-blue-700"
      >
        실시간 환율 불러오기
      </button>

      {loading && <p className="text-sm text-gray-500 mb-4">불러오는 중...</p>}

      {/* Bithumb 입력 */}
      <div className="mb-4">
        <label className="font-medium">Bithumb USDT/KRW</label>
        <input
          type="number"
          value={bithumbRate}
          onChange={(e) => setBithumbRate(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* OKX 입력 */}
      <div className="mb-6">
        <label className="font-medium">OKX BTC/USDT</label>
        <input
          type="number"
          value={okxRate}
          onChange={(e) => setOkxRate(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* 버튼들 */}
      <button
        onClick={calculate}
        className="w-full py-3 bg-green-600 text-white rounded-lg mb-3 hover:bg-green-700"
      >
        계산
      </button>

      <button
        onClick={reset}
        className="w-full py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
      >
        초기화
      </button>

      {/* 결과 */}
      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
          <p>구매 USDT (김프 포함): <b>{result.usdt}</b></p>
          <p>OKX 매수 사용 USDT: <b>{result.btc}</b></p>
          <p className="text-lg mt-2">최종 도달 BTC: <b>{result.finalBtc}</b></p>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
