/**
 * Unk Trading Engine v3.1 (Who-Visions / unk-app-ai)
 * Position sizing based on risk settings documented in Unk's source project.
 * Setup grade multipliers and journal guardrails below are NouGenStocks demo rules.
 */

export type TradeModeName = 'DayTrader' | 'SwingTrader' | 'Scalper'
export type SetupGrade = 'A' | 'B' | 'C' | 'D'

export interface TradeModeConfig {
  name: TradeModeName
  label: string
  horizon: string
  riskPct: number
  rewardRisk: number
  description: string
}

export const TRADE_MODES: Record<TradeModeName, TradeModeConfig> = {
  DayTrader: {
    name: 'DayTrader',
    label: 'Intraday',
    horizon: '1 Day hold',
    riskPct: 2.0,
    rewardRisk: 2.0,
    description: 'Active setups on liquid equities. Strict end-of-day exit.',
  },
  SwingTrader: {
    name: 'SwingTrader',
    label: 'Multi-day',
    horizon: '3–10 Day hold',
    riskPct: 3.0,
    rewardRisk: 3.0,
    description: 'Trend following on key moving averages with wider trailing stops.',
  },
  Scalper: {
    name: 'Scalper',
    label: 'High-Freq',
    horizon: 'Minutes to hours',
    riskPct: 1.0,
    rewardRisk: 1.5,
    description: 'Rapid momentum scalps on high volatility names. Tight 1% risk ceiling.',
  },
}

export const SETUP_GRADES: Record<SetupGrade, { multiplier: number; label: string; description: string }> = {
  A: { multiplier: 1.0, label: 'A-Grade', description: 'All technicals & fundamentals aligned (100% position size)' },
  B: { multiplier: 0.75, label: 'B-Grade', description: 'Solid trend with minor resistance ahead (75% size)' },
  C: { multiplier: 0.5, label: 'C-Grade', description: 'Counter-trend or elevated macro friction (50% size)' },
  D: { multiplier: 0.25, label: 'D-Grade', description: 'High-risk speculative probe (25% size)' },
}

export interface SizingInput {
  accountValue: number
  entryPrice: number
  stopPrice: number
  mode: TradeModeName
  grade: SetupGrade
}

export interface SizingResult {
  valid: boolean
  error?: string
  plannedShares: number
  positionValue: number
  perShareRisk: number
  riskBudget: number
  actualRiskAmount: number
  riskPctOfAccount: number
  buyingPowerUtilPct: number
  targets: {
    r1: number
    r1Profit: number
    r2: number
    r2Profit: number
    r3: number
    r3Profit: number
  }
}

export function calculatePositionSize(input: SizingInput): SizingResult {
  const { accountValue, entryPrice, stopPrice, mode, grade } = input

  if (!Number.isFinite(accountValue) || accountValue <= 0) {
    return createEmptyResult('Account value must be greater than zero.')
  }
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
    return createEmptyResult('Entry price must be greater than zero.')
  }
  if (!Number.isFinite(stopPrice) || stopPrice <= 0) {
    return createEmptyResult('Stop price must be greater than zero.')
  }
  if (entryPrice <= stopPrice) {
    return createEmptyResult('Entry price must be strictly higher than stop loss for long positions.')
  }

  const modeConfig = TRADE_MODES[mode] || TRADE_MODES.DayTrader
  const gradeConfig = SETUP_GRADES[grade] || SETUP_GRADES.A

  const perShareRisk = entryPrice - stopPrice
  const baseRiskBudget = accountValue * (modeConfig.riskPct / 100)
  const adjustedRiskBudget = baseRiskBudget * gradeConfig.multiplier

  // Sizing ceilings
  const maxAffordableShares = Math.floor(accountValue / entryPrice)
  const riskSizedShares = Math.floor(adjustedRiskBudget / perShareRisk)
  const plannedShares = Math.min(riskSizedShares, maxAffordableShares)

  if (plannedShares <= 0) {
    return createEmptyResult('Capital or risk budget insufficient to purchase at least 1 share.')
  }

  const positionValue = plannedShares * entryPrice
  const actualRiskAmount = plannedShares * perShareRisk
  const riskPctOfAccount = (actualRiskAmount / accountValue) * 100
  const buyingPowerUtilPct = (positionValue / accountValue) * 100

  return {
    valid: true,
    plannedShares,
    positionValue: Number(positionValue.toFixed(2)),
    perShareRisk: Number(perShareRisk.toFixed(2)),
    riskBudget: Number(adjustedRiskBudget.toFixed(2)),
    actualRiskAmount: Number(actualRiskAmount.toFixed(2)),
    riskPctOfAccount: Number(riskPctOfAccount.toFixed(2)),
    buyingPowerUtilPct: Number(buyingPowerUtilPct.toFixed(2)),
    targets: {
      r1: Number((entryPrice + perShareRisk * 1).toFixed(2)),
      r1Profit: Number((plannedShares * perShareRisk * 1).toFixed(2)),
      r2: Number((entryPrice + perShareRisk * 2).toFixed(2)),
      r2Profit: Number((plannedShares * perShareRisk * 2).toFixed(2)),
      r3: Number((entryPrice + perShareRisk * 3).toFixed(2)),
      r3Profit: Number((plannedShares * perShareRisk * 3).toFixed(2)),
    },
  }
}

function createEmptyResult(error: string): SizingResult {
  return {
    valid: false,
    error,
    plannedShares: 0,
    positionValue: 0,
    perShareRisk: 0,
    riskBudget: 0,
    actualRiskAmount: 0,
    riskPctOfAccount: 0,
    buyingPowerUtilPct: 0,
    targets: { r1: 0, r1Profit: 0, r2: 0, r2Profit: 0, r3: 0, r3Profit: 0 },
  }
}

export interface UnkScoringInput {
  peRatio?: number
  revenueGrowthPct?: number
  roePct?: number
  debtToEquity?: number
  rsi: number
  macdTrend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

export type UnkSignal = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL'

/** Prototype score for sample data only; this is not Unk's upstream algorithm. */
export function evaluateUnkScore(input: UnkScoringInput): {
  score: number
  signal: UnkSignal
  factors: string[]
} {
  let score = 0
  const factors: string[] = []

  // Fundamentals
  if (input.peRatio && input.peRatio > 0 && input.peRatio < 20) {
    score += 2
    factors.push('Value: P/E < 20 (+2)')
  }
  if (input.revenueGrowthPct && input.revenueGrowthPct >= 15) {
    score += 2
    factors.push(`Growth: Revenue +${input.revenueGrowthPct}% (+2)`)
  }
  if (input.roePct && input.roePct >= 20) {
    score += 2
    factors.push(`Quality: ROE +${input.roePct}% (+2)`)
  }
  if (input.debtToEquity !== undefined && input.debtToEquity < 0.6) {
    score += 1
    factors.push('Balance: Low Debt/Equity (+1)')
  }

  // Technicals
  if (input.rsi < 35) {
    score += 2
    factors.push(`Technicals: RSI ${input.rsi} Oversold Dip (+2)`)
  } else if (input.rsi >= 50 && input.rsi <= 68) {
    score += 1
    factors.push(`Technicals: RSI ${input.rsi} Sweet Spot (+1)`)
  } else if (input.rsi > 78) {
    score -= 2
    factors.push(`Technicals: RSI ${input.rsi} Extended Overbought (-2)`)
  }

  if (input.macdTrend === 'BULLISH') {
    score += 1
    factors.push('Momentum: Bullish MACD Crossover (+1)')
  } else if (input.macdTrend === 'BEARISH') {
    score -= 1
    factors.push('Momentum: Bearish MACD Histogram (-1)')
  }

  let signal: UnkSignal = 'HOLD'
  if (score >= 5) signal = 'STRONG BUY'
  else if (score >= 2) signal = 'BUY'
  else if (score >= -1) signal = 'HOLD'
  else if (score >= -4) signal = 'SELL'
  else signal = 'STRONG SELL'

  return { score, signal, factors }
}

export interface TradeLogEntry {
  id: string
  timestamp: string
  symbol: string
  shares: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPct: number
  mode: TradeModeName
  grade: SetupGrade
}

export interface CushionStatus {
  mode: 'FULL' | 'THREE_QUARTER' | 'HALF' | 'QUARTER'
  multiplier: number
  consecutiveLosses: number
  realizedPnl: number
  winRatePct: number
  circuitBreakerHit: boolean
  circuitBreakerReason?: string
}

export function computeCushionStatus(
  trades: TradeLogEntry[],
  accountSize: number
): CushionStatus {
  const maxDailyLoss = accountSize * 0.05
  let realizedPnl = 0
  let wins = 0
  let consecutiveLosses = 0

  for (const t of trades) {
    realizedPnl += t.pnl
    if (t.pnl > 0) {
      wins++
      consecutiveLosses = 0
    } else if (t.pnl < 0) {
      consecutiveLosses++
    }
  }

  const winRatePct = trades.length > 0 ? (wins / trades.length) * 100 : 0

  let circuitBreakerHit = false
  let circuitBreakerReason: string | undefined

  if (realizedPnl <= -maxDailyLoss) {
    circuitBreakerHit = true
    circuitBreakerReason = `Daily Max Loss Hit: -$${Math.abs(realizedPnl).toFixed(2)} exceeds 5% account threshold ($${maxDailyLoss.toFixed(2)}).`
  } else if (consecutiveLosses >= 3) {
    circuitBreakerHit = true
    circuitBreakerReason = `Consecutive Loss Limit Hit: 3 consecutive losses recorded. Downside rule enforces mandatory step-back.`
  }

  let mode: CushionStatus['mode'] = 'QUARTER'
  let multiplier = 0.25

  if (realizedPnl >= maxDailyLoss * 2) {
    mode = 'FULL'
    multiplier = 1.0
  } else if (realizedPnl >= maxDailyLoss) {
    mode = 'THREE_QUARTER'
    multiplier = 0.75
  } else if (realizedPnl > 0) {
    mode = 'HALF'
    multiplier = 0.5
  }

  return {
    mode,
    multiplier,
    consecutiveLosses,
    realizedPnl: Number(realizedPnl.toFixed(2)),
    winRatePct: Number(winRatePct.toFixed(1)),
    circuitBreakerHit,
    circuitBreakerReason,
  }
}
