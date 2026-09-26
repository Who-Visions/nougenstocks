import { Calculator, CheckCircle2, Flame, LineChart, Shield } from 'lucide-react'
import { type Stock } from './data'

interface StockDetailModalProps {
  stock: Stock | null
  onClose: () => void
  onLoadIntoPlanner: (stock: Stock) => void
}

export function StockDetailModal({ stock, onClose, onLoadIntoPlanner }: StockDetailModalProps) {
  if (!stock) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="stock-detail-title">
        <header className="detail-head">
          <div className="detail-title-block">
            <span className={`ticker-icon ${stock.symbol.toLowerCase()}`}>{stock.symbol.slice(0, 1)}</span>
            <div>
              <div className="detail-kicker">SAMPLE DATA · {stock.sector}</div>
              <h2 id="stock-detail-title">{stock.symbol} <span className="detail-name">{stock.name}</span></h2>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </header>

        {/* Sample score is a local prototype, not an upstream Unk signal. */}
        <div className="detail-unk-card">
          <div className="unk-card-header">
            <span className="unk-badge">PROTOTYPE SCORE · NOT LIVE</span>
            <span className={`signal-badge ${stock.unkSignal.toLowerCase().replace(' ', '-')}`}>
              {stock.unkSignal === 'STRONG BUY' && <Flame size={12}/>}
              {stock.unkSignal} (Score: {stock.unkScore > 0 ? `+${stock.unkScore}` : stock.unkScore})
            </span>
          </div>
          <p className="unk-quote-text">{stock.unkCommentary}</p>
        </div>

        <div className="detail-body-grid">
          {/* Technical Section */}
          <div className="detail-panel">
            <div className="panel-title"><LineChart size={14}/> Technical Setup</div>
            <div className="metric-row">
              <span>Price</span>
              <b>${stock.price.toFixed(2)}</b>
            </div>
            <div className="metric-row">
              <span>Day Change</span>
              <b className={stock.changePct >= 0 ? 'positive' : 'negative'}>
                {stock.changePct >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePct.toFixed(2)}%)
              </b>
            </div>
            <div className="metric-row">
              <span>RSI (14)</span>
              <b className={stock.rsi > 70 ? 'negative' : stock.rsi < 40 ? 'positive' : ''}>
                {stock.rsi} {stock.rsi > 70 ? '(Overbought)' : stock.rsi < 40 ? '(Oversold Dip)' : '(Balanced)'}
              </b>
            </div>
            <div className="metric-row">
              <span>MACD Momentum</span>
              <b className={stock.macdTrend === 'BULLISH' ? 'positive' : stock.macdTrend === 'BEARISH' ? 'negative' : ''}>
                {stock.macdTrend}
              </b>
            </div>
            <div className="metric-row">
              <span>Bollinger Range</span>
              <b className="mono">{stock.bollingerRange}</b>
            </div>
          </div>

          {/* Fundamental Section */}
          <div className="detail-panel">
            <div className="panel-title"><Shield size={14}/> Fundamentals &amp; Quality</div>
            <div className="metric-row">
              <span>Market Cap</span>
              <b>${stock.marketCap}</b>
            </div>
            <div className="metric-row">
              <span>P/E Ratio</span>
              <b>{stock.peRatio ? `${stock.peRatio}x` : 'N/A (ETF)'}</b>
            </div>
            <div className="metric-row">
              <span>Revenue Growth (YoY)</span>
              <b className={stock.revGrowthPct >= 15 ? 'positive' : ''}>+{stock.revGrowthPct}%</b>
            </div>
            <div className="metric-row">
              <span>ROE (Return on Equity)</span>
              <b className={stock.roePct >= 20 ? 'positive' : ''}>{stock.roePct}%</b>
            </div>
            <div className="metric-row">
              <span>Debt / Equity</span>
              <b>{stock.debtToEquity}</b>
            </div>
          </div>
        </div>

        {/* Action Foot */}
        <div className="detail-foot">
          <div className="setup-hint">
            <CheckCircle2 size={14} className="positive"/>
            <span>Illustrative grade: <b>{stock.setupQuality}</b> · Horizon: <b>{stock.bestHorizon}</b></span>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              onLoadIntoPlanner(stock)
              onClose()
            }}
          >
            <Calculator size={14}/> Load {stock.symbol} into Trade Sizer
          </button>
        </div>
      </section>
    </div>
  )
}
