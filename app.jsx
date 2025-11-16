function App() {
  const [krw, setKrw] = React.useState(2000000);
  const [bithumbRate, setBithumbRate] = React.useState("");
  const [okxRate, setOkxRate] = React.useState("");
  const [result, setResult] = React.useState(null);

  const addAmount = (v) => setKrw((k) => k + v);

  const calculate = () => {
    if (!bithumbRate || !okxRate) {
      alert("환율을 입력해주세요");
      return;
    }
    const usdt = krw / bithumbRate * 0.9996;
    const btc = usdt * 0.999 / okxRate;
    const finalBtc = Math.max(0, btc - 0.00001);
    setResult({ usdt, btc, finalBtc });
  };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h2>BTC 계산기</h2>
      <input type="number" value={krw} onChange={e => setKrw(Number(e.target.value))} />
      <div>
        <button onClick={() => addAmount(100000)}>+10만</button>
        <button onClick={() => addAmount(1000000)}>+100만</button>
        <button onClick={() => addAmount(10000000)}>+1000만</button>
      </div>
      <input placeholder="Bithumb USDT/KRW" value={bithumbRate} onChange={e => setBithumbRate(Number(e.target.value))} />
      <input placeholder="OKX BTC/USDT" value={okxRate} onChange={e => setOkxRate(Number(e.target.value))} />
      <button onClick={calculate}>계산</button>
      {result && (
        <div>
          <p>USDT: {result.usdt.toFixed(8)}</p>
          <p>BTC: {result.btc.toFixed(8)}</p>
          <p>최종 BTC: {result.finalBtc.toFixed(8)}</p>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
