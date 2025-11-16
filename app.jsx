import React from "react";
import ReactDOM from "react-dom/client";

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
      const bithumbRes = await fetch(
        "https://api.bithumb.com/public/ticker/USDT_KRW"
      );
      const bithumbData = await bithumbRes.json();
      setBithumbRate(Number(bithumbData.data.closing_price));

      const okxRes = await fetch(
        "https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT"
      );
      const okxData = await okxRes.json();
      setOkxRate(Number(okxData.data[0].last));
    } catch {
      alert("환율을 불러오지 못했습니다. 직접 입력해주세요.");
    }
    setLoading(false);
  };

  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력하거나 자동 불러오기 버튼을 눌러주세요.");
      return;
    }

    const usdt = (krw / bithumbRate) * 0.9996;
    const btc = (usdt * 0.999) / okxRate;
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
    <div className="max-w-md mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center">BTC 도달량 계산기</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">투입 원화</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={krw}
            onChange={(e) => setKrw(Number(e.target.value))}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => addAmount(100000)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +10만
          </button>
          <button
            onClick={() => addAmount(1000000)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +100만
          </button>
          <button
            onClick={() => addAmount(10000000)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +1000만
          </button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={fetchRates}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          실시간 환율 불러오기
        </button>
      </div>

      {loading && <p className="text-blue-600 mb-4">환율 불러오는 중...</p>}

      <div className="mb-4">
        <label className="block font-medium mb-1">Bithumb USDT/KRW</label>
        <input
          type="number"
          value={bithumbRate}
          onChange={(e) => setBithumbRate(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">OKX BTC/USDT</label>
        <input
          type="number"
          value={okxRate}
          onChange={(e) => setOkxRate(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={calculate}
          className="w-full py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
        >
          계산
        </button>
        <button
          onClick={reset}
          className="w-full py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          초기화
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-50 rounded border">
          <p>구매 USDT (김프 포함): <span className="font-medium">{result.usdt}</span></p>
          <p>OKX 매수 사용 USDT: <span className="font-medium">{result.btc}</span></p>
          <p className="text-lg mt-2">최종 도달 BTC (출금 후): <span className="font-bold text-green-700">{result.finalBtc}</span></p>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
