const { useMemo, useState } = React;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const seedArticles = [
  { id: 1, title: "Where Should a Beginner Invest First?", category: "Beginner", content: "Start with a goal, emergency fund, and time horizon. Mutual funds are usually easier for beginners because they reduce single-stock risk and create disciplined exposure." },
  { id: 2, title: "Stocks vs Mutual Funds", category: "Strategy", content: "Stocks can deliver outsized returns but need research and emotional discipline. Mutual funds spread your capital across many companies and are easier for long-term compounding." },
  { id: 3, title: "High Risk vs Low Risk Investing", category: "Risk", content: "Higher-risk assets can create faster growth, but portfolio drawdowns are also deeper. Lower-risk assets protect capital better but may struggle to beat inflation over long periods." },
  { id: 4, title: "Why SIPs Work for Busy Investors", category: "Beginner", content: "SIPs automate discipline. By investing every month or year, investors avoid trying to perfectly time the market and stay consistent through volatility." },
  { id: 5, title: "How to Think About Diversification", category: "Strategy", content: "Diversification means not depending on a single company, sector, or asset class. Mixing equities, debt, and cash-like buffers can improve risk-adjusted returns." },
  { id: 6, title: "What Loss Tolerance Really Means", category: "Risk", content: "Risk tolerance is not just about return preference. It is about how much temporary loss you can handle without panic-selling your investments at the worst time." },
];

const stockCatalog = [
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4120 },
  { symbol: "INFY", name: "Infosys", price: 1488 },
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2940 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1715 },
  { symbol: "ITC", name: "ITC", price: 438 },
  { symbol: "SBIN", name: "State Bank of India", price: 812 },
];

function generateGrowthSeries(amount, rate, years) {
  return calculateGrowthSeries("lumpsum", amount, rate, years);
}

function calculateProjection(mode, amount, rate, years) {
  if (mode === "monthly") {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const invested = amount * months;
    const futureValue = monthlyRate === 0
      ? invested
      : amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return {
      invested,
      futureValue,
      profit: futureValue - invested,
    };
  }

  const invested = amount;
  const futureValue = amount * Math.pow(1 + rate / 100, years);

  return {
    invested,
    futureValue,
    profit: futureValue - invested,
  };
}

function calculateGrowthSeries(mode, amount, rate, years) {
  const data = [];

  for (let year = 0; year <= years; year += 1) {
    if (mode === "monthly") {
      const months = year * 12;
      const monthlyRate = rate / 100 / 12;
      const value = monthlyRate === 0
        ? amount * months
        : amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      data.push({ year, value });
    } else {
      data.push({ year, value: amount * Math.pow(1 + rate / 100, year) });
    }
  }

  return data;
}

function Chart({ data }) {
  const width = 620;
  const height = 250;
  const padding = 26;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (point.value / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Growth projection chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(31,41,55,0.12)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(31,41,55,0.12)" />
        <polyline fill="none" stroke="#0f766e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {data.map((point, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (point.value / maxValue) * (height - padding * 2);
          return <circle key={point.year} cx={x} cy={y} r="4.5" fill="#f59e0b" />;
        })}
      </svg>
      <div className="chart-note">
        <span>Year 0</span>
        <span>Compounded growth view</span>
        <span>Year {data[data.length - 1].year}</span>
      </div>
    </div>
  );
}

function App() {
  const [investmentMode, setInvestmentMode] = useState("lumpsum");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [category, setCategory] = useState("All");
  const [cash, setCash] = useState(100000);
  const [portfolio, setPortfolio] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(stockCatalog[0].symbol);
  const [quantity, setQuantity] = useState(5);
  const [equity, setEquity] = useState(60);
  const [debt, setDebt] = useState(25);
  const [cashBuffer, setCashBuffer] = useState(15);
  const [riskYears, setRiskYears] = useState(5);

  const calculatorSummary = useMemo(
    () => calculateProjection(investmentMode, amount, rate, years),
    [investmentMode, amount, rate, years]
  );
  const { invested, futureValue, profit } = calculatorSummary;
  const growthSeries = useMemo(
    () => calculateGrowthSeries(investmentMode, amount, rate, years),
    [investmentMode, amount, rate, years]
  );
  const filteredArticles = category === "All" ? seedArticles : seedArticles.filter((article) => article.category === category);
  const activeStock = stockCatalog.find((stock) => stock.symbol === selectedStock);
  const orderValue = activeStock.price * quantity;

  const holdings = Object.entries(portfolio).map(([symbol, qty]) => {
    const stock = stockCatalog.find((item) => item.symbol === symbol);
    const invested = transactions.filter((txn) => txn.symbol === symbol && txn.type === "BUY").reduce((sum, txn) => sum + txn.quantity * txn.price, 0);
    const soldValue = transactions.filter((txn) => txn.symbol === symbol && txn.type === "SELL").reduce((sum, txn) => sum + txn.quantity * txn.price, 0);
    const currentValue = qty * stock.price;
    return { symbol, name: stock.name, qty, price: stock.price, currentValue, pnl: currentValue - (invested - soldValue) };
  });

  const holdingsValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPortfolioValue = cash + holdingsValue;
  const totalPnL = totalPortfolioValue - 100000;
  const rankedHoldings = [...holdings].sort((a, b) => b.pnl - a.pnl);

  const volatilityScore = Math.round(equity * 1.1 + debt * 0.45 + cashBuffer * 0.15);
  const riskBand = volatilityScore >= 75 ? "High Risk" : volatilityScore >= 50 ? "Balanced" : "Low Risk";
  const growthRate = (equity * 0.14 + debt * 0.075 + cashBuffer * 0.04) / 100;
  const balancedRate = (equity * 0.08 + debt * 0.065 + cashBuffer * 0.035) / 100;
  const stressRate = (equity * 0.04 + debt * 0.055 + cashBuffer * 0.03) / 100;
  const expectedScenarioValue = amount * Math.pow(1 + growthRate, riskYears);
  const conservativeScenarioValue = amount * Math.pow(1 + balancedRate, riskYears);
  const stressedScenarioValue = amount * Math.pow(1 + stressRate, riskYears);

  const handleTrade = (type) => {
    if (quantity <= 0) return;

    if (type === "BUY") {
      if (orderValue > cash) {
        alert("Not enough virtual cash for this order.");
        return;
      }
      setCash((current) => current - orderValue);
      setPortfolio((current) => ({ ...current, [selectedStock]: (current[selectedStock] || 0) + quantity }));
    }

    if (type === "SELL") {
      const owned = portfolio[selectedStock] || 0;
      if (quantity > owned) {
        alert("You do not own enough shares to sell that quantity.");
        return;
      }
      setCash((current) => current + orderValue);
      setPortfolio((current) => {
        const nextQty = (current[selectedStock] || 0) - quantity;
        const next = { ...current };
        if (nextQty <= 0) delete next[selectedStock];
        else next[selectedStock] = nextQty;
        return next;
      });
    }

    setTransactions((current) => [{
      id: `${type}-${selectedStock}-${Date.now()}`,
      type,
      symbol: selectedStock,
      quantity,
      price: activeStock.price,
      timestamp: new Date().toLocaleString("en-IN"),
    }, ...current]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">FP</div>
          <div className="brand-copy">
            <h1>FinPilot</h1>
            <p>Calculator, learning, simulation, and paper trading in one clean demo.</p>
          </div>
        </div>
        <nav className="nav-pills">
          <a className="nav-pill" href="#calculator">Calculator</a>
          <a className="nav-pill" href="#articles">Articles</a>
          <a className="nav-pill" href="#paper-trading">Paper Trading</a>
          <a className="nav-pill" href="#risk">Risk Lab</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Hackathon-ready financial product UI</div>
          <h2>Learn, simulate, and invest smarter.</h2>
          <p>This combines a compound growth calculator, beginner-friendly investing education, virtual paper trading, and a risk simulation engine that helps users understand outcomes before they invest real money.</p>
          <div className="hero-actions">
            <a className="button-primary" href="#paper-trading">Try Paper Trading</a>
            <a className="button-secondary" href="#risk">Open Risk Simulation</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card"><div className="eyebrow">Virtual portfolio value</div><div className="stat-value">{formatCurrency(totalPortfolioValue)}</div></div>
          <div className="stat-card"><div className="eyebrow">Projected calculator value</div><div className="stat-value">{formatCurrency(futureValue)}</div></div>
          <div className="stat-card"><div className="eyebrow">Risk profile</div><div className="stat-value">{riskBand}</div></div>
        </div>
      </section>

      <main className="layout-grid">
        <section id="calculator" className="panel span-12">
          <div className="section-header">
            <div>
              <h3 className="section-title">SIP / Investment Calculator</h3>
              <div className="section-subtitle">Compare one-time investing with monthly SIP contributions using compound growth.</div>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Investment Type</label>
              <select value={investmentMode} onChange={(e) => setInvestmentMode(e.target.value)}>
                <option value="lumpsum">One-Time Investment</option>
                <option value="monthly">Monthly SIP</option>
              </select>
            </div>
            <div className="field"><label>{investmentMode === "monthly" ? "Monthly Amount" : "Amount"}</label><input type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
            <div className="field"><label>Expected Return (%)</label><input type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} /></div>
            <div className="field"><label>Time (years)</label><input type="number" min="1" value={years} onChange={(e) => setYears(Number(e.target.value) || 1)} /></div>
          </div>
          <div className="calculator-results">
            <div className="metric"><div className="label">Invested value</div><div className="value">{formatCurrency(invested)}</div></div>
            <div className="metric"><div className="label">Total value</div><div className="value">{formatCurrency(futureValue)}</div></div>
            <div className="metric"><div className="label">Profit earned</div><div className="value positive">{formatCurrency(profit)}</div></div>
          </div>
          <Chart data={growthSeries} />
          <p className="helper-text">
            {investmentMode === "monthly"
              ? "Monthly SIP mode compounds each monthly contribution across the selected duration."
              : "Formula used: A = P(1 + r)^t for one-time investment growth."}
          </p>
        </section>

        <section id="articles" className="panel span-12">
          <div className="section-header">
            <div>
              <h3 className="section-title">Investment Articles</h3>
              <div className="section-subtitle">Beginner-focused education cards with category filters.</div>
            </div>
            <div className="filter-row">
              {["All", "Beginner", "Risk", "Strategy"].map((item) => (
                <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="article-grid">
            {filteredArticles.map((article) => (
              <article className="article-card" key={article.id}>
                <div className="tag">{article.category}</div>
                <h4 className="card-title">{article.title}</h4>
                <p>{article.content}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="paper-trading" className="panel span-12">
          <div className="section-header">
            <div>
              <h3 className="section-title">Paper Trading</h3>
              <div className="section-subtitle">Start with INR 1,00,000, buy and sell virtual stocks, and track performance.</div>
            </div>
          </div>
          <div className="paper-summary">
            <div className="metric"><div className="label">Cash balance</div><div className="value">{formatCurrency(cash)}</div></div>
            <div className="metric"><div className="label">Holdings value</div><div className="value">{formatCurrency(holdingsValue)}</div></div>
            <div className="metric"><div className="label">Total P/L</div><div className={`value ${totalPnL >= 0 ? "positive" : "negative"}`}>{formatCurrency(totalPnL)}</div></div>
          </div>
          <div className="paper-layout">
            <div className="trade-form">
              <h4 className="card-title">Trade Ticket</h4>
              <p className="muted">Portfolio uses a stock-to-quantity map and transactions array behind the scenes.</p>
              <div className="field">
                <label>Stock</label>
                <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
                  {stockCatalog.map((stock) => <option key={stock.symbol} value={stock.symbol}>{stock.symbol} - {stock.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
              </div>
              <div className="trade-price">
                <strong>{activeStock.symbol}</strong> at {formatCurrency(activeStock.price)} per share
                <div className="muted">Estimated order value: {formatCurrency(orderValue)}</div>
              </div>
              <div className="trade-actions" style={{ marginTop: 16 }}>
                <button className="trade-button alt" onClick={() => handleTrade("BUY")}>Buy Stock</button>
                <button className="trade-button warn" onClick={() => handleTrade("SELL")}>Sell Stock</button>
              </div>
            </div>
            <div>
              <div className="holding-list">
                {rankedHoldings.length === 0 ? (
                  <div className="holding-row"><div><div className="card-title">No holdings yet</div><div className="muted">Place your first virtual trade to build the demo portfolio.</div></div><strong>INR 0</strong></div>
                ) : rankedHoldings.map((holding) => (
                  <div className="holding-row" key={holding.symbol}>
                    <div><div className="card-title">{holding.symbol}</div><div className="muted">{holding.qty} shares - {holding.name}</div></div>
                    <strong>{formatCurrency(holding.currentValue)}</strong>
                    <strong className={holding.pnl >= 0 ? "positive" : "negative"}>{formatCurrency(holding.pnl)}</strong>
                  </div>
                ))}
              </div>
              <div className="panel" style={{ marginTop: 18, padding: 20 }}>
                <h4 className="card-title">Transactions</h4>
                <table className="transaction-table">
                  <thead><tr><th>Type</th><th>Stock</th><th>Qty</th><th>Price</th></tr></thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr><td colSpan="4" className="muted">No trades yet.</td></tr>
                    ) : transactions.slice(0, 6).map((txn) => (
                      <tr key={txn.id}><td>{txn.type}</td><td>{txn.symbol}</td><td>{txn.quantity}</td><td>{formatCurrency(txn.price)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="risk" className="panel span-12">
          <div className="section-header">
            <div>
              <h3 className="section-title">Risk Simulation Lab</h3>
              <div className="section-subtitle">Your USP feature: adjust allocation and compare realistic future outcomes.</div>
            </div>
          </div>
          <div className="risk-layout">
            <div>
              <div className="form-grid">
                <div className="field"><label>Equity %</label><input type="number" min="0" max="100" value={equity} onChange={(e) => setEquity(Number(e.target.value) || 0)} /></div>
                <div className="field"><label>Debt %</label><input type="number" min="0" max="100" value={debt} onChange={(e) => setDebt(Number(e.target.value) || 0)} /></div>
                <div className="field"><label>Cash %</label><input type="number" min="0" max="100" value={cashBuffer} onChange={(e) => setCashBuffer(Number(e.target.value) || 0)} /></div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Simulation period (years)</label>
                <input type="number" min="1" max="30" value={riskYears} onChange={(e) => setRiskYears(Number(e.target.value) || 1)} />
              </div>
              <div className="allocation-bar" aria-hidden="true">
                <span style={{ width: `${equity}%` }}></span>
                <span style={{ width: `${debt}%` }}></span>
                <span style={{ width: `${cashBuffer}%` }}></span>
              </div>
              <p className="helper-text">Tip: keeping total allocation near 100% makes the simulation more realistic for a presentation.</p>
            </div>
            <div>
              <div className="risk-summary">
                <div className="metric"><div className="label">Volatility score</div><div className="value">{volatilityScore}/100</div></div>
                <div className="metric"><div className="label">Risk band</div><div className="value">{riskBand}</div></div>
                <div className="metric"><div className="label">Allocation total</div><div className="value">{equity + debt + cashBuffer}%</div></div>
              </div>
              <div className="scenario-grid">
                <div className="scenario-card"><div className="tag">Growth Case</div><h4 className="card-title">{formatCurrency(expectedScenarioValue)}</h4><p>Higher-equity upside if markets reward long-term risk-taking.</p></div>
                <div className="scenario-card"><div className="tag">Balanced Case</div><h4 className="card-title">{formatCurrency(conservativeScenarioValue)}</h4><p>More stable compounding for users who want smoother performance.</p></div>
                <div className="scenario-card"><div className="tag">Stress Case</div><h4 className="card-title">{formatCurrency(stressedScenarioValue)}</h4><p>Useful to show how a tougher market cycle affects future outcomes.</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">FinPilot demo UI built for your hackathon concept: calculator engine, education layer, paper trading, and risk simulation.</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
