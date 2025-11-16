import React, { useState } from "react";
import ReactDOM from "react-dom";

function CryptoFlowCalculator() {
  const [krw, setKrw] = useState(2000000);
  const [bithumbRate, setBithumbRate] = useState("");
  const [okxRate, setOkxRate] = useState("");
  const [result, setResult] = useState(null);

  const addAmount = (amount) => setKrw((prev) => prev + amount);

  const fetchRates = async () => {
    try {
      const bithumbRes = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
      const bithumbData = await bithumbRes.json();
      const usdtKrw = parseFloat(bithumbData.data.closing_price);

      const okxRes = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
      const okxData = await okxRes.json();
      const btcUsdt = parseFloat(okxData.data[0].last);

      setBithumbRate(usdtKrw);
      setOkxRate(btcUsdt);
    } catch {
      alert("환율 불러오기 실패. 직접 입력해주세요.");
    }
  };

  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력하거나 자동으로 불러와 주세요.");
      return;
    }

    const krwValue = Number(krw);
    const usdtRate = Number(bithumbRate);
    const btcRate = Number(okxRate);

    // 빗썸 0.04% 수수료
    const usdtBeforeFee = krwValue / usdtRate;
    const usdt = usdtBeforeFee * 0.9996;

    // OKX 매수 0.10% 수수료
    const usableUsdt = usdt * 0.999;
    const btcBought = usableUsdt / btcRate;

    // 출금 수수료
    const finalBtc = btcBought - 0.00001;

    setResult({
      usdt: usdt.toFixed(8),
      usableUsdt: usableUsdt.toFixed(8),
      btcBought: btcBought.toFixed(8),
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
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">BTC 도달량 계산기</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">투입 원화 (KRW)</label>
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => addAmount(100000)}
          >
            +10만
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => addAmount(1000000)}
          >
            +100만
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => addAmount(10000000)}
          >
            +1000만
          </button>
        </div>
        <input
          type="number"
          value={krw}
          onChange={(e) => setKrw(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={fetchRates}
        className="w-full py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        실시간 환율 불러오기
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block mb-1 font-medium">Bithumb USDT/KRW</label>
          <input
            type="number"
            value={bithumbRate}
            onChange={(e) => setBithumbRate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">OKX BTC/USDT</label>
          <input
            type="number"
            value={okxRate}
            onChange={(e) => setOkxRate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={calculate}
          className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          계산
        </button>
        <button
          onClick={reset}
          className="flex-1 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          리셋
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded shadow-inner">
          <h3 className="font-semibold mb-2">결과</h3>
          <p>구매 USDT (김프 반영): {result.usdt}</p>
          <p>OKX 매수 사용 USDT: {result.usdAfter}</p>
          <p>구매된 BTC: {result.btcBought}</p>
          <p className="font-bold text-green-700 text-lg">
            최종 도달 BTC: {result.finalBtc}
          </p>
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<CryptoFlowCalculator />, document.getElementById("root"));
