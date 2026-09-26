import { useState } from 'react'
import { Plus, ShieldAlert, Trash2 } from 'lucide-react'
import {
  computeCushionStatus,
  type SetupGrade,
  type TradeLogEntry,
  type TradeModeName,
} from './unkEngine'

interface TradingJournalProps {
  accountSize: number
  trades: TradeLogEntry[]
  onAddTrade: (trade: Omit<TradeLogEntry, 'id' | 'timestamp' | 'pnl' | 'pnlPct'>) => void
  onClearJournal: () => void
}

export function TradingJournal({
  accountSize,
  trades,
  onAddTrade,
  onClearJournal,
}: TradingJournalProps) {
  const [symbol, setSymbol] = useState('NVDA')
  const [shares, setShares] = useState('50')
  const [entryPrice, setEntryPrice] = useState('140.00')
  const [exitPrice, setExitPrice] = useState('144.50')
  const [mode, setMode] = useState<TradeModeName>('DayTrader')
  const [grade, setGrade] = useState<SetupGrade>('A')

  const status = computeCushionStatus(trades, accountSize)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sh = Number(shares)
    const en = Number(entryPrice)
    const ex = Number(exitPrice)
    if (sh > 0 && en > 0 && ex > 0) {
      onAddTrade({
        symbol: symbol.toUpperCase(),
        shares: sh,
        entryPrice: en,
        exitPrice: ex,
        mode,
        grade,
      })
    }
  }

  return (
    <div className="journal-container" id="journal">
      <div className="journal-head">
        <div>
          <div className="section-kicker">ROSS CAMERON CUSHION &amp; DISCIPLINE PROTOCOL</div>
          <h2>Paper Trading Journal &amp; Cushion Status</h2>
          <p>Track your trade executions, realized PnL cushion, and automatic risk breakers.</p>
        </div>
        {trades.length > 0 && (
          <button className="text-button" onClick={onClearJournal}>
            <Trash2 size={13}/> Reset Journal
          </button>
        )}
      </div>

      {/* Circuit Breaker Alert Banner */}
      {status.circuitBreakerHit && (
        <div className="circuit-breaker-banner">
          <ShieldAlert size={20}/>
          <div>
            <b>CIRCUIT BREAKER TRIGGERED · TRADING STOPPED</b>
            <p>{status.circuitBreakerReason}</p>
          </div>
        </div>
      )}

      {/* Cushion Metric Cards */}
      <div className="cushion-grid">
        <div className="cushion-card">
          <small>CURRENT P&amp;L CUSHION</small>
          <strong className={status.realizedPnl >= 0 ? 'positive' : 'negative'}>
            {status.realizedPnl >= 0 ? '+' : ''}${status.realizedPnl.toFixed(2)}
          </strong>
          <span>Account: ${accountSize.toLocaleString()}</span>
        </div>
        <div className="cushion-card">
          <small>CUSHION SIZING MODE</small>
          <strong className="cushion-mode">{status.mode} ({status.multiplier * 100}%)</strong>
          <span>Based on profit reserve</span>
        </div>
        <div className="cushion-card">
          <small>WIN RATE</small>
          <strong>{status.winRatePct}%</strong>
          <span>{trades.length} recorded trades</span>
        </div>
        <div className="cushion-card">
          <small>CONSECUTIVE LOSSES</small>
          <strong className={status.consecutiveLosses >= 2 ? 'negative' : ''}>
            {status.consecutiveLosses} / 3 max
          </strong>
          <span>Mandatory pause at 3</span>
        </div>
      </div>

      {/* Add Simulated Trade Form */}
      <form className="journal-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            <span>Ticker</span>
            <input value={symbol} onChange={e => setSymbol(e.target.value)} required/>
          </label>
          <label>
            <span>Shares</span>
            <input type="number" min="1" value={shares} onChange={e => setShares(e.target.value)} required/>
          </label>
          <label>
            <span>Entry ($)</span>
            <input type="number" step="0.01" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} required/>
          </label>
          <label>
            <span>Exit ($)</span>
            <input type="number" step="0.01" value={exitPrice} onChange={e => setExitPrice(e.target.value)} required/>
          </label>
          <label>
            <span>Horizon</span>
            <select value={mode} onChange={e => setMode(e.target.value as TradeModeName)}>
              <option value="DayTrader">DayTrader (2%)</option>
              <option value="SwingTrader">SwingTrader (3%)</option>
              <option value="Scalper">Scalper (1%)</option>
            </select>
          </label>
          <label>
            <span>Grade</span>
            <select value={grade} onChange={e => setGrade(e.target.value as SetupGrade)}>
              <option value="A">Grade A (100%)</option>
              <option value="B">Grade B (75%)</option>
              <option value="C">Grade C (50%)</option>
              <option value="D">Grade D (25%)</option>
            </select>
          </label>
          <button type="submit" className="primary-button form-submit">
            <Plus size={14}/> Log Trade
          </button>
        </div>
      </form>

      {/* Trades Table */}
      {trades.length > 0 ? (
        <div className="table-wrap journal-table">
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>TICKER</th>
                <th>HORIZON</th>
                <th>GRADE</th>
                <th>SHARES</th>
                <th>ENTRY</th>
                <th>EXIT</th>
                <th>NET P&amp;L</th>
                <th>RETURN %</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.id}>
                  <td className="mono muted">{t.timestamp}</td>
                  <td><b>{t.symbol}</b></td>
                  <td><span className="horizon-tag">{t.mode}</span></td>
                  <td><span className="grade-tag">{t.grade}</span></td>
                  <td className="mono">{t.shares.toLocaleString()}</td>
                  <td className="mono">${t.entryPrice.toFixed(2)}</td>
                  <td className="mono">${t.exitPrice.toFixed(2)}</td>
                  <td className={`mono ${t.pnl >= 0 ? 'positive' : 'negative'}`}>
                    <b>{t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}</b>
                  </td>
                  <td className={`mono ${t.pnlPct >= 0 ? 'positive' : 'negative'}`}>
                    {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">No simulated trades recorded yet. Log your first execution above.</div>
      )}
    </div>
  )
}
