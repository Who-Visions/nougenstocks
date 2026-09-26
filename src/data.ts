export type Stock = {
  symbol: string; name: string; price: number; change: number; changePct: number
  marketCap: string; volume: string; sector: string; points: number[]
}

export const stocks: Stock[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 142.87, change: 3.42, changePct: 2.45, marketCap: '3.49T', volume: '42.8M', sector: 'Semiconductors', points: [27,31,26,36,33,45,40,49,44,58,52,66,58,68,61,77,73,88,81,94] },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 237.49, change: 1.21, changePct: 0.51, marketCap: '3.61T', volume: '18.2M', sector: 'Consumer tech', points: [65,59,63,55,61,52,56,48,53,46,52,43,48,41,46,39,47,40,44,48] },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.76, change: -2.18, changePct: -0.51, marketCap: '3.19T', volume: '12.4M', sector: 'Software', points: [78,73,81,68,74,62,70,60,68,55,63,53,60,48,55,51,57,45,52,46] },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 352.56, change: 8.91, changePct: 2.59, marketCap: '1.13T', volume: '31.5M', sector: 'Automotive', points: [24,29,22,39,31,45,33,55,42,49,37,65,51,71,60,83,69,76,67,92] },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 226.14, change: 0.88, changePct: 0.39, marketCap: '2.38T', volume: '14.7M', sector: 'E-commerce', points: [45,48,44,51,46,54,48,58,51,55,49,61,57,64,60,68,63,66,61,71] },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 612.77, change: -4.26, changePct: -0.69, marketCap: '1.55T', volume: '8.6M', sector: 'Technology', points: [82,77,80,71,76,69,74,63,68,60,65,57,63,52,58,47,55,49,52,45] },
]

export const indices = [
  { symbol: 'S&P 500', value: '5,842.47', change: '+0.64%', up: true, points: [42,46,43,52,49,58,54,63,59,68,65,75,70,78,76,85] },
  { symbol: 'NASDAQ', value: '18,421.06', change: '+1.12%', up: true, points: [32,38,35,45,41,51,48,58,53,63,60,70,66,77,73,86] },
  { symbol: 'DOW JONES', value: '43,239.05', change: '−0.18%', up: false, points: [78,74,80,72,76,68,73,66,71,63,68,60,65,57,62,54] },
]
