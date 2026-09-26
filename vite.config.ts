import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function freeMarketProxyPlugin(): Plugin {
  return {
    name: 'free-market-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()

        // 1. Live Quotes Proxy: /api/quote/:symbol
        if (req.url.startsWith('/api/quote/')) {
          const rawSymbol = req.url.split('/api/quote/')[1]?.split('?')[0] || ''
          const symbol = decodeURIComponent(rawSymbol).trim().toUpperCase()
          if (!symbol) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Symbol required' }))
            return
          }

          try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`
            const upstream = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            })

            if (!upstream.ok) {
              res.statusCode = upstream.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `Upstream quote provider returned HTTP ${upstream.status}` }))
              return
            }

            const data = await upstream.json()
            const result = data?.chart?.result?.[0]
            if (!result) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `No quote data available for ${symbol}` }))
              return
            }

            const meta = result.meta
            const quotes = result.indicators?.quote?.[0]
            const rawCloses: number[] = quotes?.close || []
            const validCloses = rawCloses.filter(c => typeof c === 'number' && !isNaN(c))
            const price = meta.regularMarketPrice ?? validCloses[validCloses.length - 1] ?? 0
            const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price
            const change = price - prevClose
            const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                symbol,
                price: Number(price.toFixed(2)),
                change: Number(change.toFixed(2)),
                changePct: Number(changePct.toFixed(2)),
                previousClose: Number(prevClose.toFixed(2)),
                currency: meta.currency || 'USD',
                volume: meta.regularMarketVolume
                  ? meta.regularMarketVolume >= 1e9
                    ? `${(meta.regularMarketVolume / 1e9).toFixed(2)}B`
                    : `${(meta.regularMarketVolume / 1e6).toFixed(1)}M`
                  : 'N/A',
                points: validCloses.slice(-20),
                provenance: 'Yahoo Finance v8 API (Free Proxy)',
                timestamp: new Date().toISOString(),
              })
            )
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // 2. Live News Proxy: /api/news/:symbol
        if (req.url.startsWith('/api/news/')) {
          const rawSymbol = req.url.split('/api/news/')[1]?.split('?')[0] || ''
          const symbol = decodeURIComponent(rawSymbol).trim().toUpperCase()
          if (!symbol) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Symbol required' }))
            return
          }

          try {
            const feedUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}`
            const upstream = await fetch(feedUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
            })
            if (!upstream.ok) {
              res.statusCode = upstream.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `News feed returned HTTP ${upstream.status}` }))
              return
            }

            const xml = await upstream.text()
            const items = []
            const matches = xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g)
            for (const m of matches) {
              const cleanTitle = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
              items.push({ title: cleanTitle, link: m[2], pubDate: m[3] })
              if (items.length >= 6) break
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ symbol, headlines: items, source: 'Yahoo Finance RSS' }))
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), freeMarketProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
