import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, ChevronDown, ChevronRight, CircleHelp, Command, Eye, LayoutDashboard, LineChart, Plus, Search, Settings2, SlidersHorizontal, Star, WalletCards, Zap } from 'lucide-react'
import { indices, stocks, type Stock } from './data'

type Range = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
const ranges: Range[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

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
  const [filter, setFilter] = useState<'All' | 'Gainers' | 'Losers'>('All')
  const [watchlist, setWatchlist] = useState(stocks.map((s) => s.symbol))
  const [activeNav, setActiveNav] = useState('Overview')
  const [saved, setSaved] = useState(true)
  const visibleStocks = useMemo(() => stocks.filter(s => watchlist.includes(s.symbol) && `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || (filter === 'Gainers' ? s.changePct >= 0 : s.changePct < 0))), [query, filter, watchlist])
  const toggleStock = (symbol: string) => setWatchlist(current => current.includes(symbol) ? current.filter(s => s !== symbol) : [...current, symbol])

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><Logo /><div className="brand-type">nougen<span>stocks</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="main-nav">
        {[[LayoutDashboard,'Overview'],[LineChart,'Markets'],[Eye,'Watchlist'],[WalletCards,'Portfolio']].map(([Icon,label]) => { const name = label as string; const Glyph = Icon as typeof LayoutDashboard; return <button key={name} className={`nav-item ${activeNav === name ? 'active' : ''}`} onClick={() => setActiveNav(name)}><Glyph size={17}/><span>{name}</span>{name === 'Watchlist' && <em>{watchlist.length}</em>}</button> })}
      </nav>
      <div className="sidebar-divider" />
      <div className="watchlist-head"><span>YOUR WATCHLIST</span><button aria-label="Add stock" onClick={() => setQuery('')}><Plus size={15}/></button></div>
      <div className="side-tickers">{stocks.filter(s => watchlist.includes(s.symbol)).slice(0,5).map(s => <button className="side-ticker" key={s.symbol} onClick={() => setQuery(s.symbol)}><span className={`ticker-icon ${s.symbol.toLowerCase()}`}>{s.symbol.slice(0,1)}</span><span className="ticker-name"><b>{s.symbol}</b><small>{s.name.split(' ')[0]}</small></span><span className={s.changePct >= 0 ? 'positive' : 'negative'}>{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</span></button>)}</div>
      <button className="sidebar-add" onClick={() => document.querySelector<HTMLInputElement>('.search-input')?.focus()}><Plus size={15}/> Add symbol</button>
      <div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={17}/><span>Help center</span></button><button className="nav-item"><Settings2 size={17}/><span>Settings</span></button><div className="user-profile"><div className="avatar">DW</div><div><b>Dave Wilson</b><small>Personal account</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="crumb"><span>Workspace</span><ChevronRight size={14}/><b>{activeNav}</b></div><div className="top-actions"><div className="market-open"><span className="pulse-dot"/> US MARKET OPEN <span className="market-time">· 10:42 AM ET</span></div><button className="icon-button" aria-label="Notifications"><Bell size={17}/><i/></button><div className="top-avatar">DW</div></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><div className="eyebrow"><Activity size={13}/> MONDAY, OCTOBER 21, 2024</div><h1>Market overview<span className="heading-dot">.</span></h1><p className="subheading">A clearer view of what’s moving today.</p></div><button className={`primary-button ${saved ? 'saved' : ''}`} onClick={() => setSaved(!saved)}>{saved ? <><Star size={15} fill="currentColor"/> Dashboard saved</> : <><Plus size={15}/> Save dashboard</>}</button></section>
        <section className="index-grid">{indices.map(index => <article className="index-card" key={index.symbol}><div className="index-top"><span>{index.symbol}</span><span className={`index-change ${index.up ? 'positive' : 'negative'}`}>{index.up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}{index.change}</span></div><div className="index-value">{index.value}</div><div className="index-bottom"><span>Today</span><Sparkline points={index.points} up={index.up}/></div></article>)}</section>
        <section className="market-card"><div className="chart-heading"><div><div className="section-kicker">MARKET PERFORMANCE</div><h2>Major indices <span className="live-badge"><i/> SAMPLE</span></h2></div><div className="range-tabs">{ranges.map(r => <button key={r} onClick={() => setRange(r)} className={range === r ? 'selected' : ''}>{r}</button>)}</div></div>
          <div className="chart-summary"><strong>5,842.47</strong><span className="positive"><ArrowUpRight size={15}/> 37.18 (0.64%)</span><small>Today</small></div>
          <div className="chart-area"><div className="y-axis"><span>5,880</span><span>5,860</span><span>5,840</span><span>5,820</span><span>5,800</span></div><div className="plot"><div className="grid-lines"><i/><i/><i/><i/><i/></div><div className="chart-tooltip"><b>5,842.47</b><span>10:42 AM</span></div><Sparkline points={[24,28,25,36,31,34,29,46,41,44,37,53,47,51,43,58,51,62,56,61,52,70,64,68,60,77,69,81,74,92,83,95]} up large/></div></div>
          <div className="x-axis"><span>9:30 AM</span><span>10:00 AM</span><span>10:30 AM</span><span>11:00 AM</span><span>11:30 AM</span><span>12:00 PM</span><span>12:30 PM</span></div><div className="chart-legend"><span><i className="legend-dot sp"/>S&amp;P 500</span><span><i className="legend-dot nd"/>NASDAQ</span><span><i className="legend-dot dj"/>DOW JONES</span></div>
        </section>
        <section className="stocks-section"><div className="stocks-heading"><div><div className="section-kicker">YOUR PULSE ON THE MARKET</div><h2>Watchlist <span className="count-pill">{watchlist.length}</span></h2></div><button className="text-button" onClick={() => setFilter('All')}>View all <ChevronRight size={15}/></button></div>
          <div className="table-controls"><div className="filter-tabs">{(['All','Gainers','Losers'] as const).map(f => <button className={filter === f ? 'active' : ''} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="table-tools"><label className="search-box"><Search size={15}/><input className="search-input" placeholder="Search symbol or company" value={query} onChange={e => setQuery(e.target.value)}/><kbd><Command size={10}/> K</kbd></label><button className="filter-button"><SlidersHorizontal size={15}/> Filters</button></div></div>
          <div className="table-wrap"><table><thead><tr><th>COMPANY</th><th>PRICE</th><th>CHANGE</th><th>MARKET CAP</th><th>VOLUME</th><th>LAST 1D</th><th></th></tr></thead><tbody>{visibleStocks.map((s: Stock) => <tr key={s.symbol}><td><div className="company-cell"><button className={`ticker-icon ${s.symbol.toLowerCase()}`} onClick={() => toggleStock(s.symbol)} title="Remove from watchlist"><Star size={13} fill="currentColor"/></button><span><b>{s.symbol}</b><small>{s.name}</small></span></div></td><td className="mono">${s.price.toFixed(2)}</td><td><div className={`change-cell ${s.changePct >= 0 ? 'positive' : 'negative'}`}>{s.changePct >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}<span>{s.changePct >= 0 ? '+' : ''}{s.change.toFixed(2)}<small>{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</small></span></div></td><td className="mono muted">${s.marketCap}</td><td className="mono muted">{s.volume}</td><td><Sparkline points={s.points} up={s.changePct >= 0}/></td><td><button className="row-more" aria-label={`More options for ${s.symbol}`}><ChevronDown size={15}/></button></td></tr>)}</tbody></table>{visibleStocks.length === 0 && <div className="empty-state">No symbols match this view.</div>}</div>
          <div className="table-foot"><span>Showing <b>{visibleStocks.length}</b> of <b>{watchlist.length}</b> symbols <span className="sample-note">· Sample data</span></span><button onClick={() => setWatchlist(stocks.map(s => s.symbol))}><Plus size={14}/> Add symbols</button></div>
        </section>
        <footer><span><Zap size={13}/> Built for focus. Powered by NouGen.</span><span>Market data shown for design preview <span className="footer-sep">·</span> <button>Data settings</button></span></footer>
      </div>
    </main>
  </div>
}

export default App
