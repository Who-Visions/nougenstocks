import { useState, useMemo } from 'react'
import { Sparkles, X, ShieldAlert, ArrowUpRight, Search, Target, BookOpen, CheckCircle2 } from 'lucide-react'
import { type Stock } from './data'

export interface UnkTerm {
  term: string
  translation: string
  tradingContext: string
  category: 'Risk' | 'Psychology' | 'Technical' | 'Execution'
  example: string
}

export const UNK_MARKET_TERMS: UnkTerm[] = [
  {
    term: 'Standing on Business',
    translation: 'Honoring your commitments and integrity with zero excuses.',
    tradingContext: 'Strictly honoring your stop-loss order and adhering 100% to your 2:1 or 3:1 R:R trading plan, even when it hurts.',
    category: 'Risk',
    example: 'Hit the stop at $173.20 and took the controlled 1.5% loss without moving the stop. That is standing on business.',
  },
  {
    term: 'Don\'t Crash Out',
    translation: 'Do not lose your composure or act self-destructively due to frustration.',
    tradingContext: 'Circuit Breaker rule: Never revenge-trade or double down after taking a red trade. Walk away from the screen.',
    category: 'Psychology',
    example: 'Took two consecutive stop-outs on TSLA today. Unk rule says shut down the terminal—do not crash out on tilt.',
  },
  {
    term: 'Glazing',
    translation: 'Over-hyping or brown-nosing something past the point of reason.',
    tradingContext: 'Chasing an overbought stock at the upper Bollinger band when RSI > 75 just because everyone on Twitter is hyping it.',
    category: 'Psychology',
    example: 'RSI is at 82 and price is 15% extended from the 20 EMA. Stop glazing the hype and wait for the pullback.',
  },
  {
    term: 'Motion',
    translation: 'Having momentum, capital, and active moves happening.',
    tradingContext: 'Institutional accumulation: High relative volume (>1.8x), clean VWAP reclaim, and 20 EMA crossing above 50 EMA.',
    category: 'Technical',
    example: 'NVDA broke above $175 on 50M volume with 20 EMA support. That ticker has real institutional motion.',
  },
  {
    term: 'Lock In',
    translation: 'Buckling down and focusing with complete mental discipline.',
    tradingContext: 'Calculating your exact share size from your 1-2% risk budget before submitting an order. Zero impulsive sizing.',
    category: 'Execution',
    example: 'Market open is in 5 minutes. Pull up the Unk checklist, calculate the stop distance, and lock in.',
  },
  {
    term: 'Cooked',
    translation: 'Doomed, toast, or up a creek without a paddle.',
    tradingContext: 'Holding an unhedged options position through earnings or letting a small 1% loss turn into a -45% bag.',
    category: 'Risk',
    example: 'Didn\'t use a stop-loss and the stock gapped down 18% overnight. The trade is cooked.',
  },
  {
    term: 'Cap / No Cap',
    translation: 'Lying / Telling the absolute honest truth.',
    tradingContext: 'Real verified risk telemetry vs. fake social media P&L screenshots. Pure mathematical accountability.',
    category: 'Execution',
    example: 'The strategy delivers a 2.42 profit factor over 100 audited paper trades—no cap.',
  },
  {
    term: 'Opp',
    translation: 'Opposition, rival, or predatory adversary.',
    tradingContext: 'Institutional stop-hunters and high-frequency algorithms designed to sweep retail stop clusters below obvious support.',
    category: 'Technical',
    example: 'Algorithms swept the round $170 level to grab liquidity before reversing. Watch out for the opps at whole numbers.',
  },
  {
    term: 'Bet',
    translation: 'Agreement, done deal, executed.',
    tradingContext: 'Pulling the trigger with confidence once all 4 compliance checklist items (VWAP, EMA, Volume, R:R) are verified.',
    category: 'Execution',
    example: 'Setup is Grade A, above VWAP with 3:1 R:R. Sizing 283 shares. Bet.',
  },
]

interface UnkOracleModalProps {
  stocks: Stock[]
  activeStock: Stock | null
  onSelectStock: (stock: Stock) => void
  onLoadPlanner: (stock: Stock) => void
  onClose: () => void
}

export function UnkOracleModal({
  stocks,
  activeStock,
  onSelectStock,
  onLoadPlanner,
  onClose,
}: UnkOracleModalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(activeStock?.symbol || stocks[0]?.symbol || 'NVDA')
  const [termQuery, setTermQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'tape' | 'dictionary'>('tape')

  const currentStock = useMemo(() => {
    return stocks.find(s => s.symbol === selectedSymbol) || stocks[0]
  }, [stocks, selectedSymbol])

  const filteredTerms = useMemo(() => {
    const q = termQuery.toLowerCase()
    return UNK_MARKET_TERMS.filter(
      t => t.term.toLowerCase().includes(q) || t.tradingContext.toLowerCase().includes(q) || t.translation.toLowerCase().includes(q)
    )
  }, [termQuery])

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Unk Market Oracle">
      <div className="detail-modal unk-oracle-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-head">
          <div className="detail-title-block">
            <div className="oracle-avatar">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="detail-kicker">WHO VISIONS AI · UNK METHODOLOGY</div>
              <h2>Unk Tape Decoder & Market Oracle</h2>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="oracle-nav-tabs">
          <button
            className={`oracle-tab ${activeTab === 'tape' ? 'active' : ''}`}
            onClick={() => setActiveTab('tape')}
          >
            <Target size={14} />
            <span>Tape Verdict & Plays</span>
          </button>
          <button
            className={`oracle-tab ${activeTab === 'dictionary' ? 'active' : ''}`}
            onClick={() => setActiveTab('dictionary')}
          >
            <BookOpen size={14} />
            <span>Translate the Motion (Glossary)</span>
          </button>
        </div>

        {activeTab === 'tape' ? (
          <>
            {/* Ticker Quick Selector */}
            <div className="oracle-ticker-selector">
              <span>SELECT INSTRUMENT:</span>
              <div className="oracle-ticker-pills">
                {stocks.map(s => (
                  <button
                    key={s.symbol}
                    className={`oracle-ticker-pill ${s.symbol === selectedSymbol ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSymbol(s.symbol)
                      onSelectStock(s)
                    }}
                  >
                    <b>{s.symbol}</b>
                    <small className={s.changePct >= 0 ? 'positive' : 'negative'}>
                      {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                    </small>
                  </button>
                ))}
              </div>
            </div>

            {/* Unk Verdict Banner */}
            <div className="oracle-verdict-card">
              <div className="oracle-verdict-top">
                <div className="oracle-ticker-title">
                  <h3>{currentStock.symbol}</h3>
                  <span>{currentStock.name} · {currentStock.sector}</span>
                </div>
                <div className="oracle-badges">
                  <span className={`signal-badge ${currentStock.unkSignal.toLowerCase().replace(' ', '-')}`}>
                    {currentStock.unkSignal}
                  </span>
                  <span className={`grade-tag grade-${currentStock.setupQuality.toLowerCase()}`}>
                    Grade {currentStock.setupQuality} Setup
                  </span>
                </div>
              </div>

              {/* Unk Advice Quote */}
              <div className="oracle-quote-box">
                <div className="oracle-quote-lead">Unk says:</div>
                <p className="oracle-quote-text">
                  "{currentStock.unkCommentary}"
                </p>
              </div>

              {/* Key Unk Execution Playbook */}
              <div className="oracle-playbook-grid">
                <div className="oracle-play-card">
                  <span className="play-label">OPTIMAL ENTRY</span>
                  <b className="play-val">${currentStock.price.toFixed(2)}</b>
                  <small className="play-hint">Wait for VWAP test or 20 EMA bounce</small>
                </div>
                <div className="oracle-play-card">
                  <span className="play-label">INVALIDATION STOP</span>
                  <b className="play-val play-stop">
                    ${(currentStock.price * 0.975).toFixed(2)}
                  </b>
                  <small className="play-hint">Hard stop (-2.5%). Stand on business.</small>
                </div>
                <div className="oracle-play-card">
                  <span className="play-label">2R REWARD TARGET</span>
                  <b className="play-val play-target">
                    ${(currentStock.price * 1.05).toFixed(2)}
                  </b>
                  <small className="play-hint">+5.0% gain. Scale out 40% position.</small>
                </div>
                <div className="oracle-play-card">
                  <span className="play-label">3R RUNNER TARGET</span>
                  <b className="play-val play-target">
                    ${(currentStock.price * 1.075).toFixed(2)}
                  </b>
                  <small className="play-hint">+7.5% runner. Move stop to breakeven.</small>
                </div>
              </div>

              {/* Circuit Breaker Warning */}
              <div className="oracle-warning-box">
                <ShieldAlert size={16} />
                <div>
                  <b>Unk's "Don't Crash Out" Rule for {currentStock.symbol}:</b>
                  <p>
                    {currentStock.rsi > 70 ? (
                      <>RSI is elevated at {currentStock.rsi}. Do not chase this gap-up. If it loses the 20 EMA, cut immediately—no holding and hoping.</>
                    ) : currentStock.rsi < 35 ? (
                      <>RSI is oversold at {currentStock.rsi}. Look for double-bottom confirmation before buying. Do not try to catch a falling knife with oversized contracts.</>
                    ) : (
                      <>RSI is healthy at {currentStock.rsi}. Max risk is 1.5% of account equity. If stop-loss hits, accept the feedback and move to the next setup.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="oracle-actions">
                <button
                  className="primary-button oracle-load-btn"
                  onClick={() => {
                    onLoadPlanner(currentStock)
                    onClose()
                  }}
                >
                  <ArrowUpRight size={14} />
                  <span>Load {currentStock.symbol} into Position Planner</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Translate the Motion Dictionary */
          <div className="oracle-dictionary-pane">
            <div className="oracle-search-bar">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search market slang & Unk trading concepts (e.g. Standing on business, Crash out, Glazing)..."
                value={termQuery}
                onChange={e => setTermQuery(e.target.value)}
                autoFocus
              />
              {termQuery && (
                <button onClick={() => setTermQuery('')} className="clear-btn">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="oracle-terms-list">
              {filteredTerms.map(t => (
                <div key={t.term} className="oracle-term-card">
                  <div className="term-card-head">
                    <span className="term-title">"{t.term}"</span>
                    <span className={`term-category ${t.category.toLowerCase()}`}>{t.category}</span>
                  </div>
                  <div className="term-trans">
                    <b>Cultural Meaning:</b> <span>{t.translation}</span>
                  </div>
                  <div className="term-trading">
                    <CheckCircle2 size={13} className="term-icon" />
                    <div>
                      <b>Wall Street & Tape Application:</b>
                      <p>{t.tradingContext}</p>
                    </div>
                  </div>
                  <div className="term-example">
                    <em>Example: "{t.example}"</em>
                  </div>
                </div>
              ))}
              {filteredTerms.length === 0 && (
                <div className="empty-state">
                  No terms found matching "{termQuery}". Try searching "stop", "risk", "glazing", or "motion".
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
