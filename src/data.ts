export type Stock = {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  marketCap: string
  volume: string
  sector: string
  points: number[]
  // Unk Method Sauce (Who-Visions/unk-app-ai):
  rsi: number
  peRatio?: number
  unkScore: number // -5 to +5
  unkSignal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL'
  setupQuality: 'A' | 'B' | 'C'
}

export const stocks: Stock[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 142.87, change: 3.42, changePct: 2.45, marketCap: '3.49T', volume: '42.8M', sector: 'Semiconductors', points: [27,31,26,36,33,45,40,49,44,58,52,66,58,68,61,77,73,88,81,94], rsi: 64, peRatio: 48.2, unkScore: 6, unkSignal: 'STRONG BUY', setupQuality: 'A' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 237.49, change: 1.21, changePct: 0.51, marketCap: '3.61T', volume: '18.2M', sector: 'Consumer tech', points: [65,59,63,55,61,52,56,48,53,46,52,43,48,41,46,39,47,40,44,48], rsi: 52, peRatio: 34.1, unkScore: 3, unkSignal: 'BUY', setupQuality: 'B' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.76, change: -2.18, changePct: -0.51, marketCap: '3.19T', volume: '12.4M', sector: 'Software', points: [78,73,81,68,74,62,70,60,68,55,63,53,60,48,55,51,57,45,52,46], rsi: 48, peRatio: 35.8, unkScore: 1, unkSignal: 'HOLD', setupQuality: 'B' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 352.56, change: 8.91, changePct: 2.59, marketCap: '1.13T', volume: '31.5M', sector: 'Automotive', points: [24,29,22,39,31,45,33,55,42,49,37,65,51,71,60,83,69,76,67,92], rsi: 68, peRatio: 92.4, unkScore: 4, unkSignal: 'BUY', setupQuality: 'A' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 226.14, change: 0.88, changePct: 0.39, marketCap: '2.38T', volume: '14.7M', sector: 'E-commerce', points: [45,48,44,51,46,54,48,58,51,55,49,61,57,64,60,68,63,66,61,71], rsi: 56, peRatio: 41.5, unkScore: 3, unkSignal: 'BUY', setupQuality: 'B' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 612.77, change: -4.26, changePct: -0.69, marketCap: '1.55T', volume: '8.6M', sector: 'Technology', points: [82,77,80,71,76,69,74,63,68,60,65,57,63,52,58,47,55,49,52,45], rsi: 44, peRatio: 27.9, unkScore: 2, unkSignal: 'BUY', setupQuality: 'A' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 166.34, change: 1.76, changePct: 1.07, marketCap: '2.04T', volume: '16.1M', sector: 'Technology', points: [37,34,42,39,46,43,51,45,55,49,61,56,66,60,71,67,77,70,83,91], rsi: 58, peRatio: 22.3, unkScore: 5, unkSignal: 'STRONG BUY', setupQuality: 'A' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 156.23, change: -1.35, changePct: -0.86, marketCap: '253.1B', volume: '24.3M', sector: 'Semiconductors', points: [82,76,80,69,75,67,72,64,68,59,64,57,61,50,56,52,58,47,51,43], rsi: 41, peRatio: 44.0, unkScore: 0, unkSignal: 'HOLD', setupQuality: 'C' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 224.81, change: 0.67, changePct: 0.30, marketCap: '638.2B', volume: '5.7M', sector: 'Financials', points: [42,46,43,48,45,50,47,53,49,54,50,57,52,58,55,60,56,62,59,66], rsi: 61, peRatio: 12.4, unkScore: 5, unkSignal: 'STRONG BUY', setupQuality: 'A' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 458.71, change: -0.92, changePct: -0.20, marketCap: '988.4B', volume: '2.1M', sector: 'Financials', points: [72,68,74,69,72,66,70,65,68,63,66,60,64,59,62,56,61,57,59,54], rsi: 49, peRatio: 21.0, unkScore: 2, unkSignal: 'BUY', setupQuality: 'B' },
  // Macro & Systematic ETFs from Professor G / Shard 29195:
  { symbol: 'SPMO', name: 'Invesco S&P 500 Momentum ETF', price: 89.45, change: 1.25, changePct: 1.42, marketCap: '2.8B', volume: '1.2M', sector: 'Momentum ETF', points: [30,35,32,44,40,51,47,58,54,65,60,72,68,78,74,85,81,90,86,95], rsi: 67, peRatio: 29.5, unkScore: 5, unkSignal: 'STRONG BUY', setupQuality: 'A' },
  { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', price: 29.80, change: 0.11, changePct: 0.37, marketCap: '58.4B', volume: '3.9M', sector: 'Dividend/Tech ETF', points: [45,44,46,43,47,45,49,47,52,50,55,53,58,56,61,59,63,62,65,67], rsi: 53, peRatio: 16.2, unkScore: 3, unkSignal: 'BUY', setupQuality: 'B' },
]

export const defaultWatchlist = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'SPMO', 'SCHD']

export const chartSeries: Record<string, number[]> = {
  '1D': [24,28,25,36,31,34,29,46,41,44,37,53,47,51,43,58,51,62,56,61,52,70,64,68,60,77,69,81,74,92,83,95],
  '1W': [58,52,61,48,55,43,50,46,57,49,63,53,60,55,68,58,72,64,69,61,78,67,81,73,85,77,88,80,92,84,96],
  '1M': [36,42,39,32,45,40,48,37,44,52,46,56,49,60,51,57,66,58,70,63,74,67,62,78,72,83,75,88,81,95],
  '3M': [24,32,28,39,33,44,38,35,49,43,55,47,52,45,61,54,66,57,63,72,65,77,69,74,83,78,88,80,92,86,96],
  '1Y': [18,24,20,29,26,35,30,42,37,33,48,43,52,46,58,51,47,64,59,70,62,76,67,73,82,75,88,80,91,85,96],
  ALL: [14,20,16,26,22,31,27,37,32,29,42,38,49,43,39,55,50,61,54,65,58,53,70,64,76,69,82,74,87,80,96],
}

export const indices = [
  { symbol: 'S&P 500', value: '5,842.47', change: '+0.64%', up: true, points: [42,46,43,52,49,58,54,63,59,68,65,75,70,78,76,85] },
  { symbol: 'NASDAQ', value: '18,421.06', change: '+1.12%', up: true, points: [32,38,35,45,41,51,48,58,53,63,60,70,66,77,73,86] },
  { symbol: 'DOW JONES', value: '43,239.05', change: '−0.18%', up: false, points: [78,74,80,72,76,68,73,66,71,63,68,60,65,57,62,54] },
  { symbol: '10Y YIELD', value: '5.12%', change: '+0.08%', up: true, points: [40,42,41,45,47,46,50,52,51,54,53,58,57,61,64,68] },
  { symbol: 'WTI CRUDE', value: '$94.20', change: '+1.80%', up: true, points: [55,52,58,61,59,65,63,68,66,72,70,76,73,78,82,85] },
  { symbol: 'SPMO (MOM)', value: '$89.45', change: '+1.42%', up: true, points: [30,35,32,44,40,51,47,58,54,65,60,72,68,78,74,85] },
]
