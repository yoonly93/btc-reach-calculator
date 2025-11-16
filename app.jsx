/** @jsx React.createElement */

function App() {
  const [krw, setKrw] = React.useState(2000000);
  const [bithumbRate, setBithumbRate] = React.useState("");
  const [okxRate, setOkxRate] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const addAmount = (v) => setKrw((prev) => prev + v);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const bithumbRes = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
      const bithumbData = await bithumbRes.json();
      setBithumbRate(Number(bithumbData.data.closing_price));

      const okxRes = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
      const okxData = await okxRes.json();
      setOkxRate(Number(okxData.data[0].last));
    } catch {
      alert("환율을 불러오지 못했습니다. 수동 입력해주세요.");
    }
    setLoading(false);
  };

  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력하거나 자동 불러오기를 눌러주세요.");
      return;
    }

    const usdt = krw / bithumbRate * 0.9996;
    const btc = usdt * 0.999 / okxRate;
    const finalBtc = Math.max(0, btc - 0.00001);

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
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-6">

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

      {/* 자동 환율 */}
      <button
        onClick={fetchRates}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        실시간 환율 불러오기
      </button>
      {loading && <p className="text-center text-gray-600">환율 불러오는 중...</p>}

      {/* 환율 입력 */}
      <div>
        <label className="font-semibold text-gray-700">Bithumb USDT/KRW</label>
        <input
          type="number"
          value={bithumbRate}
          onChange={(e) => setBithumbRate(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded-md mt-1"
        />
      </div>
      <div>
        <label className="font-semibold text-gray-700">OKX BTC/USDT</label>
        <input
          type="number"
          value={okxRate}
          onChange={(e) => setOkxRate(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded-md mt-1"
        />
      </div>

      {/* 계산 버튼 */}
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

      {/* 결과 */}
      {result && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p>구매 USDT: {result.usdt}</p>
          <p>OKX 매수 사용 USDT: {result.btc}</p>
          <p className="font-bold text-lg mt-2">
            최종 도달 BTC: <span className="text-blue-600">{result.finalBtc}</span>
          </p>
        </div>
      )}

      {/* 구글 광고 */}
      <div className="mt-6 text-center">
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-4826107918413125"
          data-ad-slot="YOUR_AD_SLOT"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>

      {/* 주의사항 */}
      <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded text-sm text-center">
        ⚠️ 계산한 내역은 저장되지 않습니다. 또한 계산 결과는 참고용이며, 실제 거래와 차이가 있을 수 있습니다.
      </div>
    </div>
  );
}

// React 18 createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
