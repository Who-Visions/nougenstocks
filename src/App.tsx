import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Calculator, ChevronDown, ChevronRight, CircleHelp, Command, Eye, Flame, LayoutDashboard, LineChart, Plus, Search, Settings2, ShieldAlert, Star, Zap } from 'lucide-react'
import { chartSeries, defaultWatchlist, indices, stocks, type Stock } from './data'

type Range = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
const ranges: Range[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL']
type SortKey = 'symbol' | 'price' | 'changePct' | 'marketCap' | 'volume' | 'unkScore' | 'rsi'

const tradeModes = [
  { name: 'DayTrader', label: 'Intraday (1D)', riskPct: 2, rewardRisk: 2 },
  { name: 'SwingTrader', label: 'Multi-day (3-10D)', riskPct: 3, rewardRisk: 3 },
  { name: 'Scalper', label: 'Minutes/Hours', riskPct: 1, rewardRisk: 1.5 },
] as const

const qualityMultipliers: Record<string, { multiplier: number; label: string }> = {
  A: { multiplier: 1.0, label: 'A-Grade (100% Size)' },
  B: { multiplier: 0.75, label: 'B-Grade (75% Size)' },
  C: { multiplier: 0.5, label: 'C-Grade (50% Size)' },
  D: { multiplier: 0.25, label: 'D-Grade (25% Size)' },
}

function readWatchlist() {
  try {
    const stored = localStorage.getItem('nougenstocks.watchlist.v1')
    if (!stored) return defaultWatchlist
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((symbol): symbol is string => typeof symbol === 'string' && stocks.some(stock => stock.symbol === symbol)) : defaultWatchlist
  } catch { return defaultWatchlist }
}

function easternClock(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const value = (key: string) => parts.find(part => part.type === key)?.value ?? ''
  const weekday = value('weekday')
  const minuteOfDay = Number(value('hour')) * 60 + Number(value('minute'))
  const inWeekdaySession = !['Sat', 'Sun'].includes(weekday) && minuteOfDay >= 570 && minuteOfDay < 960
  return {
    date: new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now),
    time: new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(now),
    session: inWeekdaySession ? 'WEEKDAY SESSION HOURS' : 'OUTSIDE SESSION HOURS',
  }
}

function marketCapValue(cap: string) {
  const amount = Number.parseFloat(cap)
  return cap.endsWith('T') ? amount * 1_000_000 : cap.endsWith('B') ? amount * 1_000 : amount
}

function volumeValue(volume: string) {
  const amount = Number.parseFloat(volume)
  return volume.endsWith('M') ? amount * 1_000_000 : volume.endsWith('K') ? amount * 1_000 : amount
}

function Sparkline({ points, up, large = false }: { points: number[]; up: boolean; large?: boolean }) {
  const color = up ? '#b5f36b' : '#f07875'
  const width = large ? 820 : 116
  const height = large ? 230 : 38
  const min = Math.min(...points); const max = Math.max(...points)
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * width},${height - 4 - ((p - min) / (max - min || 1)) * (height - 16)}`).join(' ')
  const id = `fade-${large ? 'hero' : points[0]}-${up ? 'up' : 'down'}`
  return <svg className={large ? 'hero-chart' : 'sparkline'} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label={up ? 'Trending up' : 'Trending down'}>
    {large && <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>}
    {large && <polygon points={`0,${height} ${coords} ${width},${height}`} fill={`url(#${id})`} />}
    <polyline points={coords} fill="none" stroke={color} strokeWidth={large ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>
}

function Logo() { return <div className="brand-mark"><span>N</span><i /></div> }

function App() {
  const [range, setRange] = useState<Range>('1D')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'Gainers' | 'Losers' | 'Strong Buys'>('All')
  const [watchlist, setWatchlist] = useState(readWatchlist)
  const [activeNav, setActiveNav] = useState('Overview')
  const [saved, setSaved] = useState(() => localStorage.getItem('nougenstocks.dashboard-saved.v1') !== 'false')
  const [addOpen, setAddOpen] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'unkScore', direction: 'desc' })
  const [now, setNow] = useState(() => new Date())
  
  // Unk Sizer State (Who-Visions / unk-app-ai):
  const [tradeMode, setTradeMode] = useState<(typeof tradeModes)[number]['name']>('DayTrader')
  const [setupGrade, setSetupGrade] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [activeTicker, setActiveTicker] = useState<string>('NVDA')
  const [accountValue, setAccountValue] = useState('25000')
  const [entryPrice, setEntryPrice] = useState('142.87')
  const [stopPrice, setStopPrice] = useState('140.01')

  const clock = easternClock(now)
  const activeTradeMode = tradeModes.find(mode => mode.name === tradeMode) ?? tradeModes[0]
  const account = Number(accountValue)
  const entry = Number(entryPrice)
  const stop = Number(stopPrice)
  const perShareRisk = entry - stop
  const baseRiskBudget = Number.isFinite(account) && account > 0 ? account * activeTradeMode.riskPct / 100 : 0
  const qualityFactor = qualityMultipliers[setupGrade]?.multiplier ?? 1.0
  const adjustedRiskBudget = baseRiskBudget * qualityFactor
  const affordableShares = entry > 0 && account > 0 ? Math.floor(account / entry) : 0
  const riskSizedShares = perShareRisk > 0 ? Math.floor(adjustedRiskBudget / perShareRisk) : 0
  const plannedShares = Math.min(riskSizedShares, affordableShares)
  const plannedRisk = plannedShares * Math.max(0, perShareRisk)
  const targetPrice = entry + Math.max(0, perShareRisk) * activeTradeMode.rewardRisk
  const validPlan = Number.isFinite(account) && Number.isFinite(entry) && Number.isFinite(stop) && account > 0 && entry > stop && stop > 0 && plannedShares > 0

  const visibleStocks = useMemo(() => {
    const rows = stocks.filter(s => {
      const inWatchlist = watchlist.includes(s.symbol)
      const matchesQuery = `${s.symbol} ${s.name} ${s.sector}`.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'All' 
        ? true 
        : filter === 'Gainers' 
        ? s.changePct >= 0 
        : filter === 'Losers'
        ? s.changePct < 0
        : s.unkSignal === 'STRONG BUY'
      return inWatchlist && matchesQuery && matchesFilter
    })

    return rows.sort((a, b) => {
      const key = sort.key
      let av: string | number = a.symbol
      let bv: string | number = b.symbol
      if (key === 'marketCap') { av = marketCapValue(a.marketCap); bv = marketCapValue(b.marketCap) }
      else if (key === 'volume') { av = volumeValue(a.volume); bv = volumeValue(b.volume) }
      else if (key === 'symbol') { av = a.symbol; bv = b.symbol }
      else if (key === 'unkScore') { av = a.unkScore; bv = b.unkScore }
      else if (key === 'rsi') { av = a.rsi; bv = b.rsi }
      else { av = a[key]; bv = b[key] }

      const comparison = typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv)
      return comparison * (sort.direction === 'asc' ? 1 : -1)
    })
  }, [query, filter, watchlist, sort])

  const toggleStock = (symbol: string) => setWatchlist(current => current.includes(symbol) ? current.filter(s => s !== symbol) : [...current, symbol])
  const setSortKey = (key: SortKey) => setSort(current => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: key === 'symbol' ? 'asc' : 'desc' })

  const loadStockIntoPlanner = (s: Stock) => {
    setActiveTicker(s.symbol)
    setEntryPrice(s.price.toFixed(2))
    const defStop = s.price * (1 - (activeTradeMode.riskPct / 100))
    setStopPrice(defStop.toFixed(2))
    setSetupGrade(s.setupQuality)
    document.querySelector('#trade-prep')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => { localStorage.setItem('nougenstocks.watchlist.v1', JSON.stringify(watchlist)) }, [watchlist])
  useEffect(() => { localStorage.setItem('nougenstocks.dashboard-saved.v1', String(saved)) }, [saved])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.search-input')?.focus()
      }
      if (event.key === 'Escape') { setAddOpen(false); setAddQuery('') }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.clearInterval(timer); window.removeEventListener('keydown', onKeyDown) }
  }, [])

  const goTo = (nav: string) => {
    setActiveNav(nav)
    const target = nav === 'Markets' ? document.querySelector('#market-performance') : nav === 'Watchlist' ? document.querySelector('#watchlist') : nav === 'Trade Prep' ? document.querySelector('#trade-prep') : document.querySelector('.page-heading')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><Logo /><div className="brand-type">nougen<span>stocks</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="main-nav">
        {[[LayoutDashboard,'Overview'],[LineChart,'Markets'],[Calculator,'Trade Prep'],[Eye,'Watchlist']].map(([Icon,label]) => {
          const name = label as string
          const Glyph = Icon as typeof LayoutDashboard
          return <button key={name} className={`nav-item ${activeNav === name ? 'active' : ''}`} onClick={() => goTo(name)}>
            <Glyph size={17}/><span>{name}</span>{name === 'Watchlist' && <em>{watchlist.length}</em>}
          </button>
        })}
      </nav>
      <div className="sidebar-divider" />
      <div className="watchlist-head"><span>YOUR WATCHLIST</span><button aria-label="Add stock" onClick={() => setQuery('')}><Plus size={15}/></button></div>
      <div className="side-tickers">{stocks.filter(s => watchlist.includes(s.symbol)).slice(0,6).map(s => <button className="side-ticker" key={s.symbol} onClick={() => loadStockIntoPlanner(s)}>
        <span className={`ticker-icon ${s.symbol.toLowerCase()}`}>{s.symbol.slice(0,1)}</span>
        <span className="ticker-name"><b>{s.symbol}</b><small>{s.unkSignal}</small></span>
        <span className={s.changePct >= 0 ? 'positive' : 'negative'}>{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</span>
      </button>)}</div>
      <button className="sidebar-add" onClick={() => setAddOpen(true)}><Plus size={15}/> Add symbol</button>
      <div className="sidebar-bottom">
        <button className="nav-item"><CircleHelp size={17}/><span>Help center</span></button>
        <button className="nav-item"><Settings2 size={17}/><span>Settings</span></button>
        <div className="user-profile">
          <div className="avatar">DW</div>
          <div><b>Dave Wilson</b><small>Personal account</small></div>
          <ChevronDown size={15}/>
        </div>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div className="crumb"><span>Workspace</span><ChevronRight size={14}/><b>{activeNav}</b></div>
        <div className="top-actions">
          <div className="market-open" title="Weekday session hours only; exchange holidays are not included">
            <span className="pulse-dot"/> {clock.session} <span className="market-time">· {clock.time}</span>
          </div>
          <div className="top-avatar">DW</div>
        </div>
      </header>
      <div className="page-wrap">
        <section className="page-heading">
          <div>
            <div className="eyebrow"><Activity size={13}/> {clock.date.toUpperCase()}</div>
            <h1>Market overview<span className="heading-dot">.</span></h1>
            <p className="subheading">Systematic Unk Method execution &amp; macroeconomic pulse.</p>
          </div>
          <button className={`primary-button ${saved ? 'saved' : ''}`} onClick={() => setSaved(!saved)}>
            {saved ? <><Star size={15} fill="currentColor"/> Dashboard saved</> : <><Plus size={15}/> Save dashboard</>}
          </button>
        </section>

        {/* Major Macro & Systematic Instruments from Shard 29195 */}
        <section className="index-grid">
          {indices.map(index => <article className="index-card" key={index.symbol}>
            <div className="index-top"><span>{index.symbol}</span><span className={`index-change ${index.up ? 'positive' : 'negative'}`}>{index.up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}{index.change}</span></div>
            <div className="index-value">{index.value}</div>
            <div className="index-bottom"><span>Today</span><Sparkline points={index.points} up={index.up}/></div>
          </article>)}
        </section>

        {/* Unk Method Position Sizing Cockpit (Who-Visions / unk-app-ai) */}
        <section className="trade-planner" id="trade-prep" aria-labelledby="planner-title">
          <div className="planner-head">
            <div>
              <div className="section-kicker">UNK METHOD · TRADE PREP &amp; SIZING</div>
              <h2 id="planner-title">Position sizing cockpit <span className="planner-badge">UNK v3.1 RULE-BASED</span></h2>
              <p>Risk first, entry second. Active target: <b>{activeTicker}</b>. Sized strictly to your risk cap.</p>
            </div>
            <div className="strategy-switch" role="group" aria-label="Trade horizon">
              {tradeModes.map(mode => <button key={mode.name} className={tradeMode === mode.name ? 'selected' : ''} onClick={() => setTradeMode(mode.name)}>
                <b>{mode.name}</b><small>{mode.label}</small>
              </button>)}
            </div>
          </div>

          <div className="planner-body">
            <div className="planner-inputs">
              <label>Account value
                <span className="input-prefix"><i>$</i><input inputMode="decimal" aria-label="Account value" value={accountValue} onChange={event => setAccountValue(event.target.value.replace(/[^0-9.]/g, ''))}/></span>
              </label>
              <label>Entry price ({activeTicker})
                <span className="input-prefix"><i>$</i><input inputMode="decimal" aria-label="Entry price" value={entryPrice} onChange={event => setEntryPrice(event.target.value.replace(/[^0-9.]/g, ''))}/></span>
              </label>
              <label>Stop price
                <span className="input-prefix"><i>$</i><input inputMode="decimal" aria-label="Stop price" value={stopPrice} onChange={event => setStopPrice(event.target.value.replace(/[^0-9.]/g, ''))}/></span>
              </label>
              <div className="setup-grade-selector">
                <span>SETUP GRADE</span>
                <div className="grade-pills">
                  {(['A', 'B', 'C', 'D'] as const).map(g => (
                    <button key={g} className={setupGrade === g ? 'active' : ''} onClick={() => setSetupGrade(g)} title={qualityMultipliers[g].label}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="risk-cap">
                <span>RISK CAP</span><b>{activeTradeMode.riskPct}%</b>
                <small>Tiered: {qualityMultipliers[setupGrade].label} · {activeTradeMode.rewardRisk}:1 R:R target</small>
              </div>
            </div>

            <div className="planner-results">
              <div><small>MAX SHARES</small><strong>{validPlan ? plannedShares.toLocaleString() : '—'}</strong><em>{setupGrade}-tier allocated</em></div>
              <div><small>PLANNED RISK</small><strong>{validPlan ? `$${plannedRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}</strong><em>of ${adjustedRiskBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })} cap</em></div>
              <div><small>RISK TARGET ({activeTradeMode.rewardRisk}R)</small><strong>{validPlan ? `$${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</strong><em>+${validPlan ? (targetPrice - entry).toFixed(2) : '0.00'}/sh</em></div>
              <div><small>POSITION VALUE</small><strong>{validPlan ? `$${(plannedShares * entry).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}</strong><em>cash-capped</em></div>
            </div>
          </div>

          <div className="planner-unk-banner">
            <span className="unk-quote"><b>Unk Wisdom:</b> "Protect the downside first, nephew! Sizing is your armor; the setup is just the spear. Never risk more than your cap!"</span>
            <div className="circuit-breaker-tag"><ShieldAlert size={12}/> Daily Max Loss Guard: 5% (${(account * 0.05).toLocaleString()})</div>
          </div>

          <div className="planner-note">
            <span>Formula derived from <b>Who-Visions / unk-app-ai</b> (Ross Cameron / Small Account Sizing &amp; Cushion protocol).</span>
            <a href="https://github.com/Who-Visions/unk-app-ai/blob/main/docs/TRADING_SKILLS.md" target="_blank" rel="noreferrer">View Unk method source <ChevronRight size={13}/></a>
          </div>
        </section>

        {/* Market Performance Chart */}
        <section className="market-card" id="market-performance">
          <div className="chart-heading">
            <div>
              <div className="section-kicker">MARKET PERFORMANCE</div>
              <h2>Major indices &amp; ETFs <span className="live-badge"><i/> SAMPLE</span></h2>
            </div>
            <div className="range-tabs">{ranges.map(r => <button key={r} onClick={() => setRange(r)} className={range === r ? 'selected' : ''}>{r}</button>)}</div>
          </div>
          <div className="chart-summary"><strong>5,842.47</strong><span className="positive"><ArrowUpRight size={15}/> 37.18 (0.64%)</span><small>Today</small></div>
          <div className="chart-area">
            <div className="y-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <div className="plot">
              <div className="grid-lines"><i/><i/><i/><i/><i/></div>
              <div className="chart-tooltip"><b>{range} · illustrative</b><span>Sample trajectory</span></div>
              <Sparkline points={chartSeries[range]} up large/>
            </div>
          </div>
          <div className="x-axis"><span>9:30 AM</span><span>10:00 AM</span><span>10:30 AM</span><span>11:00 AM</span><span>11:30 AM</span><span>12:00 PM</span><span>12:30 PM</span></div>
          <div className="chart-legend">
            <span><i className="legend-dot sp"/>S&amp;P 500</span>
            <span><i className="legend-dot nd"/>NASDAQ</span>
            <span><i className="legend-dot dj"/>DOW JONES</span>
            <span><i className="legend-dot spmo"/>SPMO (MOM)</span>
          </div>
        </section>

        {/* Watchlist Section with Unk Method Signals & One-Click Sizing */}
        <section className="stocks-section" id="watchlist">
          <div className="stocks-heading">
            <div>
              <div className="section-kicker">YOUR PULSE ON THE MARKET</div>
              <h2>Watchlist &amp; Unk Signals <span className="count-pill">{watchlist.length}</span></h2>
            </div>
            <button className="text-button" onClick={() => { setFilter('All'); setQuery('') }}>Clear filters <ChevronRight size={15}/></button>
          </div>
          <div className="table-controls">
            <div className="filter-tabs">
              {(['All','Gainers','Losers','Strong Buys'] as const).map(f => <button className={filter === f ? 'active' : ''} key={f} onClick={() => setFilter(f)}>{f}</button>)}
            </div>
            <div className="table-tools">
              <label className="search-box">
                <Search size={15}/><input className="search-input" placeholder="Search symbol, sector or name" value={query} onChange={e => setQuery(e.target.value)}/><kbd><Command size={10}/> K</kbd>
              </label>
              <button className="filter-button" onClick={() => setAddOpen(true)}><Plus size={15}/> Add symbols</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><button className="sort-heading" onClick={() => setSortKey('symbol')}>COMPANY</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('price')}>PRICE</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('changePct')}>CHANGE</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('unkScore')}>UNK SIGNAL</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('rsi')}>RSI (14)</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('marketCap')}>MARKET CAP</button></th>
                  <th><button className="sort-heading" onClick={() => setSortKey('volume')}>VOLUME</button></th>
                  <th>LAST 1D</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleStocks.map((s: Stock) => <tr key={s.symbol} className={activeTicker === s.symbol ? 'row-active' : ''}>
                  <td>
                    <div className="company-cell">
                      <button className={`ticker-icon ${s.symbol.toLowerCase()}`} onClick={() => toggleStock(s.symbol)} title={`Remove ${s.symbol} from watchlist`} aria-label={`Remove ${s.symbol} from watchlist`}>
                        <Star size={13} fill="currentColor"/>
                      </button>
                      <span><b>{s.symbol}</b><small>{s.name}</small></span>
                    </div>
                  </td>
                  <td className="mono">${s.price.toFixed(2)}</td>
                  <td>
                    <div className={`change-cell ${s.changePct >= 0 ? 'positive' : 'negative'}`}>
                      {s.changePct >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                      <span>{s.changePct >= 0 ? '+' : ''}{s.change.toFixed(2)}<small>{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</small></span>
                    </div>
                  </td>
                  <td>
                    <span className={`signal-badge ${s.unkSignal.toLowerCase().replace(' ', '-')}`}>
                      {s.unkSignal === 'STRONG BUY' && <Flame size={11}/>}
                      {s.unkSignal} ({s.unkScore > 0 ? `+${s.unkScore}` : s.unkScore})
                    </span>
                  </td>
                  <td className="mono muted">{s.rsi}</td>
                  <td className="mono muted">${s.marketCap}</td>
                  <td className="mono muted">{s.volume}</td>
                  <td><Sparkline points={s.points} up={s.changePct >= 0}/></td>
                  <td>
                    <button className="size-btn" onClick={() => loadStockIntoPlanner(s)} title={`Load ${s.symbol} into Unk Position Sizer`}>
                      <Calculator size={12}/> Size
                    </button>
                  </td>
                </tr>)}
              </tbody>
            </table>
            {visibleStocks.length === 0 && <div className="empty-state">No symbols match this view.</div>}
          </div>
          <div className="table-foot">
            <span>Showing <b>{visibleStocks.length}</b> of <b>{watchlist.length}</b> symbols <span className="sample-note">· Unk Method Scoring Enabled</span></span>
            <button onClick={() => setAddOpen(true)}><Plus size={14}/> Add symbols</button>
          </div>
        </section>

        <footer>
          <span><Zap size={13}/> Built for focus. Powered by NouGen &amp; Unk Trading Engine.</span>
          <span>Illustrative sample data · not a live market feed <span className="footer-sep">·</span> <button onClick={() => setAddOpen(true)}>Manage watchlist</button></span>
        </footer>
      </div>
    </main>

    {addOpen && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) { setAddOpen(false); setAddQuery('') } }}>
      <section className="symbol-modal" role="dialog" aria-modal="true" aria-labelledby="symbol-modal-title">
        <div className="modal-heading">
          <div><div className="section-kicker">SYMBOL UNIVERSE</div><h2 id="symbol-modal-title">Manage watchlist</h2></div>
          <button className="modal-close" onClick={() => { setAddOpen(false); setAddQuery('') }} aria-label="Close">×</button>
        </div>
        <label className="modal-search">
          <Search size={16}/>
          <input autoFocus placeholder="Search symbols or companies" value={addQuery} onChange={event => setAddQuery(event.target.value)}/>
        </label>
        <div className="symbol-list">
          {stocks.filter(stock => `${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase().includes(addQuery.toLowerCase())).map(stock => {
            const included = watchlist.includes(stock.symbol)
            return <div className="symbol-option" key={stock.symbol}>
              <span className={`ticker-icon ${stock.symbol.toLowerCase()}`}>{stock.symbol.slice(0,1)}</span>
              <span className="symbol-option-name">
                <b>{stock.symbol}</b>
                <small>{stock.name} · {stock.sector} · {stock.unkSignal}</small>
              </span>
              <button className={included ? 'symbol-remove' : 'symbol-add'} onClick={() => toggleStock(stock.symbol)}>
                {included ? 'Remove' : 'Add'}
              </button>
            </div>
          })}
          {stocks.every(stock => !`${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase().includes(addQuery.toLowerCase())) && <div className="empty-state">No symbols found in this starter universe.</div>}
        </div>
        <div className="modal-foot">Changes save automatically on this device.</div>
      </section>
    </div>}
  </div>
}

export default App
