import { Flame, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { macroRegime, type Stock } from './data'

interface MacroScannersProps {
  stocks: Stock[]
  onSelectStock: (stock: Stock) => void
  onApplyFilter: (filterName: string) => void
}

export function MacroScanners({ stocks, onSelectStock, onApplyFilter }: MacroScannersProps) {
  const momentumLeaders = stocks.filter(s => s.rsi >= 60 && s.macdTrend === 'BULLISH')
  const highConviction = stocks.filter(s => s.unkScore >= 5)
  const dipBuys = stocks.filter(s => s.rsi <= 45)

  return (
    <div className="macro-scanners-wrap" id="macro">
      {/* Editorial context derived from one video; values are not live market data. */}
      <div className="macro-section-head">
        <div>
          <div className="section-kicker">VIDEO CONTEXT · SAMPLE DATA</div>
          <h2>Macroeconomic Catalysts &amp; ETF Rebalances</h2>
          <p>Discussion points from Professor G’s video; figures and claims are unverified and not current quotes.</p>
        </div>
      </div>

      <div className="macro-cards-grid">
        {macroRegime.map(item => (
          <div className={`macro-card ${item.status.toLowerCase()}`} key={item.name}>
            <div className="macro-card-top">
              <span className="macro-name">{item.name}</span>
              <span className={`status-pill ${item.status.toLowerCase()}`}>
                {item.status === 'WARNING' && <ShieldAlert size={11}/>}
                {item.status === 'BULLISH' && <TrendingUp size={11}/>}
                {item.status}
              </span>
            </div>
            <div className="macro-metric">{item.metric}</div>
            <p className="macro-insight">{item.insight}</p>
            <div className="macro-source">{item.source}</div>
          </div>
        ))}
      </div>

      {/* Strategy Scanners Strip */}
      <div className="scanners-head">
        <div className="section-kicker">STRATEGY SCANNER PRESETS</div>
        <h3>Curated Setups by Market Horizon</h3>
      </div>

      <div className="scanners-grid">
        {/* Momentum Scanner */}
        <div className="scanner-card">
          <div className="scanner-top">
            <span className="scanner-badge"><Flame size={13}/> Momentum Breakouts</span>
            <button className="scanner-filter-link" onClick={() => onApplyFilter('Gainers')}>
              Filter Watchlist ({momentumLeaders.length})
            </button>
          </div>
          <p className="scanner-desc">High RSI (&gt;60) with bullish MACD momentum pressing toward new session highs.</p>
          <div className="scanner-tickers">
            {momentumLeaders.map(s => (
              <button key={s.symbol} className="scanner-pill" onClick={() => onSelectStock(s)}>
                <b>{s.symbol}</b> <span>+{s.changePct.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* High Conviction Scanner */}
        <div className="scanner-card">
          <div className="scanner-top">
            <span className="scanner-badge"><Sparkles size={13}/> Unk High Conviction</span>
            <button className="scanner-filter-link" onClick={() => onApplyFilter('Strong Buys')}>
              Filter Watchlist ({highConviction.length})
            </button>
          </div>
          <p className="scanner-desc">Prototype score from illustrative inputs; this is not Unk’s upstream scoring model.</p>
          <div className="scanner-tickers">
            {highConviction.map(s => (
              <button key={s.symbol} className="scanner-pill" onClick={() => onSelectStock(s)}>
                <b>{s.symbol}</b> <span>Score +{s.unkScore}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dip Buys Scanner */}
        <div className="scanner-card">
          <div className="scanner-top">
            <span className="scanner-badge"><TrendingUp size={13}/> Oversold Dip Buys</span>
            <button className="scanner-filter-link" onClick={() => onApplyFilter('Losers')}>
              Filter Watchlist ({dipBuys.length})
            </button>
          </div>
          <p className="scanner-desc">Cooling RSI (&le;45) pulling back to primary support for high reward:risk entries.</p>
          <div className="scanner-tickers">
            {dipBuys.map(s => (
              <button key={s.symbol} className="scanner-pill" onClick={() => onSelectStock(s)}>
                <b>{s.symbol}</b> <span>RSI {s.rsi}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
