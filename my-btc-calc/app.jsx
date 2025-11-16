import React, { useState } from "https://cdn.skypack.dev/react";
import ReactDOM from "https://cdn.skypack.dev/react-dom";

function Calculator() {
  const [krwInput, setKrwInput] = useState(2000000);
  const [bithumbRate, setBithumbRate] = useState("");
  const [okxRate, setOkxRate] = useState("");
  const [result, setResult] = useState(null);

  const addAmount = (v) => setKrwInput(prev => prev + v);

  const fetchLiveRates = async () => {
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
      alert("환율을 불러오지 못했습니다. 직접 입력해 주세요.");
    }
  };

  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력하거나 자동으로 불러와 주세요.");
      return;
    }

    const krw = Number(krwInput);
    const br = Number(bithumbRate);
    const or = Number(okxRate);

    const usdtBeforeFee = krw / br;
    const usdt = usdtBeforeFee * (1 - 0.0004);
    const usableUsdt = usdt * (1 - 0.001);
    const btc = usableUsdt / or;
    const finalBtc = btc - 0.00001;

    setResult({
      usdt: usdt.toFixed(8),
      usableUsdt: usableUsdt.toFixed(8),
      btc: btc.toFixed(8),
      finalBtc: finalBtc.toFixed(8)
    });
  };

  return (
    <div>
      <h2>BTC 계산기</h2>

      <div>
        <label>투입 원화:</label>
        <input type="number" value={krwInput} onChange={e => setKrwInput(Number(e.target.value))} />
        <button onClick={() => addAmount(100000)}>+10만</button>
        <button onClick={() => addAmount(1000000)}>+100만</button>
        <button onClick={() => addAmount(10000000)}>+1000만</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchLiveRates} style={{ width: "100%" }}>실시간 환율 불러오기</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Bithumb USDT/KRW:</label>
        <input type="number" value={bithumbRate} onChange={e => setBithumbRate(e.target.value)} />

        <label>OKX BTC/USDT:</label>
        <input type="number" value={okxRate} onChange={e => setOkxRate(e.target.value)} />
      </div>

      <button onClick={calculate} style={{ width: "100%", marginTop: 12 }}>계산하기</button>

      {result && (
        <div style={{ marginTop: 12, padding: 12, background: "#f0f0f0", borderRadius: 6 }}>
          <p>구매 USDT: {result.usdt}</p>
          <p>OKX 매수 사용 USDT: {result.usableUsdt}</p>
          <p>구매 BTC: {result.btc}</p>
          <p>최종 도달 BTC (출금 후): <b>{result.finalBtc}</b></p>
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<Calculator />, document.getElementById("root"));
