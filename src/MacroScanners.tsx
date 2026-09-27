import { useState } from 'react'
import { Flame, Gauge, Layers, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { macroRegime, type Stock } from './data'
import { calculateVolatilityCashBuffer } from './unkEngine'

interface MacroScannersProps {
  stocks: Stock[]
  onSelectStock: (stock: Stock) => void
  onApplyFilter: (filterName: string) => void
}

export function MacroScanners({ stocks, onSelectStock, onApplyFilter }: MacroScannersProps) {
  const [vixInput, setVixInput] = useState<number>(14.10)
  const volAlloc = calculateVolatilityCashBuffer(vixInput)

  const momentumLeaders = stocks.filter(s => s.rsi >= 60 && s.macdTrend === 'BULLISH')
  const highConviction = stocks.filter(s => s.unkScore >= 5)
  const dipBuys = stocks.filter(s => s.rsi <= 45)
  const wheelSetups = stocks.filter(s => ['WDC', 'CLS', 'GLW', 'GOOGL', 'SCHD'].includes(s.symbol) || (s.peRatio && s.peRatio <= 22))

  return (
    <div className="macro-scanners-wrap" id="macro">
      {/* Volatility Regime & Dynamic Cash Buffer Header */}
      <div className="vix-allocation-banner">
        <div className="vix-banner-left">
          <div className="section-kicker">INSTITUTIONAL RISK ALLOCATION · OPTIONS DESK DOCTRINE</div>
          <div className="vix-banner-title">
            <Gauge size={18} className="vix-icon" />
            <h3>Macro Volatility &amp; Capital Reserve Meter</h3>
            <span className={`status-pill ${volAlloc.statusBadge.toLowerCase()}`}>
              {volAlloc.regime}
            </span>
          </div>
          <p className="vix-banner-desc">{volAlloc.recommendation}</p>
          <div className="vix-tactical-callout">
            <b>Tactical Playbook:</b> {volAlloc.tacticalAction}
          </div>
        </div>

        <div className="vix-banner-right">
          <div className="vix-meter-stat">
            <div className="vix-stat-label">BENCHMARK VIX</div>
            <div className="vix-stat-value mono">{vixInput.toFixed(2)}</div>
            <div className="vix-quick-selects">
              <button className={`vix-preset-btn ${vixInput === 14.10 ? 'active' : ''}`} onClick={() => setVixInput(14.10)}>
                VIX 14.1 (Low)
              </button>
              <button className={`vix-preset-btn ${vixInput === 21.50 ? 'active' : ''}`} onClick={() => setVixInput(21.50)}>
                VIX 21.5 (Normal)
              </button>
              <button className={`vix-preset-btn ${vixInput === 32.00 ? 'active' : ''}`} onClick={() => setVixInput(32.00)}>
                VIX 32.0 (Spike)
              </button>
            </div>
          </div>

          <div className="allocation-progress-card">
            <div className="allocation-bar-labels">
              <span><b>{volAlloc.targetCashPct}%</b> Cash / Dry Powder</span>
              <span><b>{volAlloc.targetEquityPct}%</b> Active Equity &amp; Wheels</span>
            </div>
            <div className="allocation-track">
              <div className="allocation-fill cash-fill" style={{ width: `${volAlloc.targetCashPct}%` }} />
              <div className="allocation-fill equity-fill" style={{ width: `${volAlloc.targetEquityPct}%` }} />
            </div>
            <div className="allocation-subhint">
              <span>Reserve: Dip buying buffer ($S5FI breadth guard)</span>
              <span>Active: CSPs + Covered Strangles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Regime Cards Strip */}
      <div className="macro-section-head">
        <div>
          <div className="section-kicker">MACROECONOMIC CATALYSTS &amp; GEX PROFILES</div>
          <h2>Institutional Drivers, Dealer Walls &amp; Rebalances</h2>
          <p>Synthesized cross-desk catalysts from YouTube institutional desks and ETF rebalances.</p>
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
        <h3>Curated Setups by Market Horizon &amp; Strategy</h3>
      </div>

      <div className="scanners-grid">
        {/* Institutional Wheel & GEX Scanner */}
        <div className="scanner-card wheel-highlight">
          <div className="scanner-top">
            <span className="scanner-badge"><Layers size={13}/> Institutional Options Wheel &amp; GEX</span>
            <button className="scanner-filter-link" onClick={() => onApplyFilter('All')}>
              View Wheel Setups ({wheelSetups.length})
            </button>
          </div>
          <p className="scanner-desc">High FCF, low P/E (&le;22x), and range oscillation above 200 DMA with GEX Put Wall support.</p>
          <div className="scanner-tickers">
            {wheelSetups.map(s => (
              <button key={s.symbol} className="scanner-pill" onClick={() => onSelectStock(s)}>
                <b>{s.symbol}</b> <span>{s.peRatio ? `${s.peRatio}x P/E` : 'GEX Floor'}</span>
              </button>
            ))}
          </div>
        </div>

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
          <p className="scanner-desc">Highest scoring multi-factor equities combining robust balance sheets with institutional motion.</p>
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
