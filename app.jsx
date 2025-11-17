/** @jsx React.createElement */

/*
  app.jsx
  - 탭형 거래소 선택 (USDT/KRW: 빗썸/업비트, BTC/USDT: OKX/바이낸스)
  - 선택 즉시 fetch -> placeholder 갱신
  - 수동 입력 가능 (입력하면 placeholder 값 대신 사용)
  - 계산: 빗썸/업비트 기준 USDT, OKX/바이낸스 기준 BTC, 수수료/출금비 반영
*/

function formatNumber(n) {
  if (n === null || n === undefined || n === "") return "";
  const num = Number(n);
  if (isNaN(num)) return "";
  return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function App() {
  // 입력/선택 상태
  const [krwValue, setKrwValue] = React.useState(2000000);

  const [usdtProvider, setUsdtProvider] = React.useState("bithumb"); // bithumb | upbit
  const [btcProvider, setBtcProvider] = React.useState("okx"); // okx | binance

  // placeholder (실시간) 값
  const [usdtRealtime, setUsdtRealtime] = React.useState("");
  const [btcRealtime, setBtcRealtime] = React.useState("");

  // 사용자가 직접 입력한 값(수동)
  const [usdtManual, setUsdtManual] = React.useState("");
  const [btcManual, setBtcManual] = React.useState("");

  // 계산 결과
  const [result, setResult] = React.useState(null);
  const [loadingUsdt, setLoadingUsdt] = React.useState(false);
  const [loadingBtc, setLoadingBtc] = React.useState(false);

  // -------- fetch helpers --------
  const fetchUsdt = async (provider) => {
    setLoadingUsdt(true);
    try {
      if (provider === "bithumb") {
        const res = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
        const j = await res.json();
        const v = j?.data?.closing_price;
        setUsdtRealtime(v ? Number(v).toFixed(2) : "");
      } else if (provider === "upbit") {
        // Upbit KRW-USDT
        const res = await fetch("https://api.upbit.com/v1/ticker?markets=KRW-USDT");
        const j = await res.json();
        const v = j?.[0]?.trade_price;
        setUsdtRealtime(v ? Number(v).toFixed(2) : "");
      }
    } catch (e) {
      console.error("fetchUsdt error", e);
      setUsdtRealtime("");
    } finally {
      setLoadingUsdt(false);
    }
  };

  const fetchBtc = async (provider) => {
    setLoadingBtc(true);
    try {
      if (provider === "okx") {
        const res = await fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT");
        const j = await res.json();
        const v = j?.data?.[0]?.last;
        setBtcRealtime(v ? Number(v) : "");
      } else if (provider === "binance") {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const j = await res.json();
        const v = j?.price;
        setBtcRealtime(v ? Number(v) : "");
      }
    } catch (e) {
      console.error("fetchBtc error", e);
      setBtcRealtime("");
    } finally {
      setLoadingBtc(false);
    }
  };

  // 즉시 fetch: provider 변경 시
  React.useEffect(() => {
    fetchUsdt(usdtProvider);
    // reset manual USDT input so placeholder is shown unless user types
    // (we keep manual value untouched; user can overwrite)
  }, [usdtProvider]);

  React.useEffect(() => {
    fetchBtc(btcProvider);
  }, [btcProvider]);

  // 초기 로드
  React.useEffect(() => {
    fetchUsdt(usdtProvider);
    fetchBtc(btcProvider);
  }, []);

  // 계산 함수 (수수료·출금수수료 적용)
  const handleCalculate = () => {
    const usdtPrice = usdtManual ? Number(usdtManual) : Number(usdtRealtime);
    const btcPrice = btcManual ? Number(btcManual) : Number(btcRealtime);

    if (!usdtPrice || !btcPrice) {
      alert("환율(USDT/KRW)과 가격(BTC/USDT)을 확인하세요.");
      return;
    }

    const krw = Number(krwValue);

    // 1) KRW -> USDT (빗썸/업비트) : 빗썸 수수료 0.04% 적용 (net = 1 - 0.0004)
    const usdtBeforeFee = krw / usdtPrice;
    const usdtAfterExchangeFee = usdtBeforeFee * (1 - 0.0004); // 0.04%

    // 2) USDT -> BTC (OKX/Binance) : 매수 수수료 0.10% 적용 (net 1 - 0.001)
    const usdtAfterBuyFee = usdtAfterExchangeFee * (1 - 0.001); // 0.1%
    const btcBought = usdtAfterBuyFee / btcPrice;

    // 3) 출금 수수료
    const btcFinal = Math.max(0, btcBought - 0.00001);

    setResult({
      inputs: {
        krw,
        usdtPrice,
        btcPrice,
      },
      steps: {
        usdtBeforeFee: usdtBeforeFee,
        usdtAfterExchangeFee,
        usdtAfterBuyFee,
        btcBought,
        btcFinal,
      },
    });
  };

  const handleReset = () => {
    setKrwValue(2000000);
    setUsdtManual("");
    setBtcManual("");
    setResult(null);
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6">
      {/* 계산기 카드 */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center">BTC 도달량 계산기</h2>
<p className="mt-2 text-center text-gray-600">
  거래소에서 구입한 비트코인을 셀프커스터디 목적으로,<br />콜드월렛·개인지갑에 이체해 보관할 때 확보되는<br />최종 실제 수량을 계산합니다.
</p>

        {/* 원화 입력 */}
        <div>
         <div>
  <label className="font-medium text-gray-700">투입 원화 (KRW)</label>

  {/* 입력창 */}
  <input
    type="number"
    className="w-full border rounded px-3 py-2 mt-2"
    value={krwValue}
    onChange={(e) => setKrwValue(Number(e.target.value))}
  />

  {/* 버튼 3개 → 아래로 이동 */}
  <div className="flex gap-2 mt-2">
    <button
      onClick={() => setKrwValue((v) => v + 100000)}
      className="flex-1 px-3 py-2 bg-gray-100 rounded"
    >
      +10만원
    </button>
    <button
      onClick={() => setKrwValue((v) => v + 1000000)}
      className="flex-1 px-3 py-2 bg-gray-100 rounded"
    >
      +100만원
    </button>
    <button
      onClick={() => setKrwValue((v) => v + 10000000)}
      className="flex-1 px-3 py-2 bg-gray-100 rounded"
    >
      +1000만원
    </button>
  </div>


  {/* 한국어 금액 표기 */}
<div className="mt-1 text-xs text-gray-500">
  {(() => {
    const v = krwValue;
    if (v >= 100000000) return `${v / 100000000}억원`;
    if (v >= 10000) return `${v / 10000}만원`;
    return `${v}원`;
  })()}
</div>

</div>

        </div>

        {/* USDT/KRW 탭 */}
        <div>
          <label className="font-medium text-gray-700">USDT/KRW</label>

          <div className="mt-2 flex border rounded-lg overflow-hidden">
            <button
              className={`flex-1 px-3 py-2 text-center ${usdtProvider === "bithumb" ? "bg-white text-blue-600 font-semibold" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setUsdtProvider("bithumb")}
            >
              빗썸
            </button>
            <button
              className={`flex-1 px-3 py-2 text-center ${usdtProvider === "upbit" ? "bg-white text-blue-600 font-semibold" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setUsdtProvider("upbit")}
            >
              업비트
            </button>
          </div>

          <input
            type="number"
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder={loadingUsdt ? "불러오는 중..." : (usdtRealtime ? `${formatNumber(usdtRealtime)} KRW` : "실시간 환율 없음")}
            value={usdtManual}
            onChange={(e) => setUsdtManual(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">선택: <span className="font-medium">{usdtProvider === "bithumb" ? "빗썸" : "업비트"}</span> · 실시간: {usdtRealtime ? formatNumber(usdtRealtime) + " KRW" : "—"}</div>
        </div>

        {/* BTC/USDT 탭 */}
        <div>
          <label className="font-medium text-gray-700">BTC/USDT</label>

          <div className="mt-2 flex border rounded-lg overflow-hidden">
            <button
              className={`flex-1 px-3 py-2 text-center ${btcProvider === "okx" ? "bg-white text-blue-600 font-semibold" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setBtcProvider("okx")}
            >
              OKX
            </button>
            <button
              className={`flex-1 px-3 py-2 text-center ${btcProvider === "binance" ? "bg-white text-blue-600 font-semibold" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setBtcProvider("binance")}
            >
              바이낸스
            </button>
          </div>

          <input
            type="number"
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder={loadingBtc ? "불러오는 중..." : (btcRealtime ? `${formatNumber(btcRealtime)} USDT` : "실시간 가격 없음")}
            value={btcManual}
            onChange={(e) => setBtcManual(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">선택: <span className="font-medium">{btcProvider === "okx" ? "OKX" : "바이낸스"}</span> · 실시간: {btcRealtime ? formatNumber(btcRealtime) + " USDT" : "—"}</div>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <button onClick={handleCalculate} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">계산</button>
          <button onClick={handleReset} className="w-full py-3 bg-gray-200 rounded-lg">초기화</button>
        </div>

        {/* 결과 (상세) */}
        {result && (
          <div className="p-3 bg-gray-50 rounded space-y-2">
            <div>빗썸/업비트 USDT 가격: <b>{formatNumber(result.inputs.usdtPrice)} KRW</b></div>
            <div>선택 BTC/USDT 가격: <b>{formatNumber(result.inputs.btcPrice)} USDT</b></div>
            <hr />
            <div>USDT (환전 전): <b>{formatNumber(result.steps.usdtBeforeFee)}</b> USDT</div>
            <div>USDT (수수료 적용): <b>{formatNumber(result.steps.usdtAfterExchangeFee)}</b> USDT</div>
            <div>USDT (OKX/바이낸스 매수 후 사용 가능): <b>{formatNumber(result.steps.usdtAfterBuyFee)}</b> USDT</div>
            <div>구매된 BTC: <b>{formatNumber(result.steps.btcBought)}</b> BTC</div>
            <div className="text-lg font-bold text-blue-600">최종 도달 비트코인 수량(출금 후): {formatNumber(result.steps.btcFinal)} BTC</div>
          </div>
        )}

        {/* 주의사항 (카드 안) */}
        <div className="mt-3 p-3 bg-yellow-100 text-yellow-800 rounded text-sm text-center">
          ⚠️ 계산한 내역은 저장되지 않습니다. 또한 계산 결과는 참고용이며, 실제 거래와 차이가 있을 수 있습니다.
        </div>
      </div>
    </div>
  );
}

// 마운트
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
