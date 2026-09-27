export interface LiveQuote {
  symbol: string
  price: number
  change: number
  changePct: number
  previousClose: number
  currency: string
  volume: string
  points: number[]
  provenance: string
  timestamp: string
}

export interface LiveNewsItem {
  title: string
  link: string
  pubDate: string
}

export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(`/api/quote/${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data as LiveQuote
  } catch (err) {
    console.warn(`[MarketAPI] Failed to fetch live quote for ${symbol}:`, err)
    return null
  }
}

export async function fetchLiveNews(symbol: string): Promise<LiveNewsItem[]> {
  try {
    const res = await fetch(`/api/news/${encodeURIComponent(symbol)}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.headlines || []) as LiveNewsItem[]
  } catch (err) {
    console.warn(`[MarketAPI] Failed to fetch live news for ${symbol}:`, err)
    return []
  }
}
