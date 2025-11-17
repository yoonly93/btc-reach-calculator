/** @jsx React.createElement */

function App() {
  const [krw, setKrw] = React.useState(2000000);

  // 거래소 선택 상태
  const [usdtExchange, setUsdtExchange] = React.useState("bithumb"); // bithumb / upbit
  const [btcExchange, setBtcExchange] = React.useState("okx");       // okx / binance

  // 환율 상태
  const [usdtRate, setUsdtRate] = React.useState("");
  const [btcRate, setBtcRate] = React.useState("");

  // placeholder 용 실시간 fetch값
  const [usdtPlaceholder, setUsdtPlaceholder] = React.useState("");
  const [btcPlaceholder, setBtcPlaceholder] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  // KRW 버튼
  const addAmount = (v) => setKrw((prev) => prev + v);

  // USDT/KRW 실시간 fetch
  const fetchUsdtRate = async (exchange) => {
    try {
      let rate;
      if (exchange === "bithumb") {
        const res = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
        const data = await res.json();
        rate = Number(data.data.closing_price);
      } else if (exchange === "upbit") {
        const res = await fetch("https://api.upbit.com/v1/ticker?markets=USDT-KRW");
        const data = await res.json();
        rate = Number(data[0].trade_price);
      }
      setUsdtPlaceholder(rate);
      if (!usdtRate) setUsdtRate(rate);
    } catch (e) {
      alert("USDT/KRW 환율을 가져오지 못했습니다.");
    }
  };

  // BTC/USDT 실시간 fetch
  const fetchBtcRate = async (exchange) => {
    try {
      let rate;
      if (exchange === "okx") {
        const res = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
        const data = await res.json();
        rate = Number(data.data[0].last);
      } else if (exchange === "binance") {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const data = await res.json();
        rate = Number(data.price);
      }
      setBtcPlaceholder(rate);
      if (!btcRate) setBtcRate(rate);
    } catch (e) {
      alert("BTC/USDT 환율을 가져오지 못했습니다.");
    }
  };

  // exchange 변경 시 fetch
  React.useEffect(() => {
    fetchUsdtRate(usdtExchange);
  }, [usdtExchange]);

  React.useEffect(() => {
    fetchBtcRate(btcExchange);
  }, [btcExchange]);

  // 계산
  const calculate = () => {
    const usdt = (Number(usdtRate) ? krw / Number(usdtRate) : krw / usdtPlaceholder) * 0.9996;
    const btc = (Number(btcRate) ? usdt * 0.999 / Number(btcRate) : usdt * 0.999 / btcPlaceholder);
    const finalBtc = Math.max(0, btc - 0.00001);

    setResult({
      usdt: usdt.toFixed(8),
      btc: btc.toFixed(8),
      finalBtc: finalBtc.toFixed(8),
    });
  };

  const reset = () => {
    setKrw(2000000);
    setUsdtRate("");
    setBtcRate("");
    setResult(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">BTC 도달량 계산기</h2>

      {/* KRW 입력 */}
      <div>
        <label className="font-semibold text-gray-700">투입 원화</label>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={krw}
            onChange={(e) => setKrw(Number(e.target.value))}
            className="flex-1 border px-3 py-2 rounded-md"
          />
          <button className="px-3 py-1 bg-gray-200 rounded-md" onClick={() => addAmount(100000)}>+10만</button>
          <button className="px-3 py-1 bg-gray-200 rounded-md" onClick={() => addAmount(1000000)}>+100만</button>
          <button className="px-3 py-1 bg-gray-200 rounded-md" onClick={() => addAmount(10000000)}>+1000만</button>
        </div>
      </div>

      {/* USDT/KRW */}
      <div>
        <label className="font-semibold text-gray-700">USDT/KRW</label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="usdtExchange"
              value="bithumb"
              checked={usdtExchange === "bithumb"}
              onChange={(e) => setUsdtExchange(e.target.value)}
            />
            빗썸
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="usdtExchange"
              value="upbit"
              checked={usdtExchange === "upbit"}
              onChange={(e) => setUsdtExchange(e.target.value)}
            />
            업비트
          </label>
        </div>
        <input
          type="number"
          placeholder={usdtPlaceholder}
          value={usdtRate}
          onChange={(e) => setUsdtRate(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded-md mt-2"
        />
      </div>

      {/* BTC/USDT */}
      <div>
        <label className="font-semibold text-gray-700">BTC/USDT</label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="btcExchange"
              value="okx"
              checked={btcExchange === "okx"}
              onChange={(e) => setBtcExchange(e.target.value)}
            />
            OKX
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="btcExchange"
              value="binance"
              checked={btcExchange === "binance"}
              onChange={(e) => setBtcExchange(e.target.value)}
            />
            바이낸스
          </label>
        </div>
        <input
          type="number"
          placeholder={btcPlaceholder}
          value={btcRate}
          onChange={(e) => setBtcRate(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded-md mt-2"
        />
      </div>

      {/* 버튼 */}
      <div className="space-y-3">
        <button
          onClick={calculate}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
        >
          계산
        </button>
        <button
          onClick={reset}
          className="w-full py-3 bg-gray-300 text-black rounded-lg font-semibold hover:bg-gray-400"
        >
          초기화
        </button>
      </div>

      {/* 결과 + 주의사항 */}
      {result && (
        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <p>구매 USDT: {result.usdt}</p>
          <p>OKX 매수 사용 USDT: {result.btc}</p>
          <p className="font-bold text-lg mt-2">
            최종 도달 BTC: <span className="text-blue-600">{result.finalBtc}</span>
          </p>
          <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm text-center">
            ⚠️ 계산한 내역은 저장되지 않습니다. 또한 계산 결과는 참고용이며, 실제 거래와 차이가 있을 수 있습니다.
          </div>
        </div>
      )}
    </div>
  );
}

// React 18 createRoot 사용
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
