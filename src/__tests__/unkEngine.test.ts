import { describe, expect, it } from 'vitest'
import {
  calculatePositionSize,
  computeCushionStatus,
  evaluateUnkScore,
  calculateVolatilityCashBuffer,
  calculateOptionsWheelPlan,
  type TradeLogEntry,
} from '../unkEngine'

describe('Unk Trading Engine (unkEngine)', () => {
  describe('calculatePositionSize', () => {
    it('calculates standard DayTrader 2% risk on $25,000 account correctly', () => {
      const res = calculatePositionSize({
        accountValue: 25000,
        entryPrice: 100,
        stopPrice: 98, // $2 per share risk
        mode: 'DayTrader', // 2% risk = $500 budget
        grade: 'A', // 100% multiplier
      })

      expect(res.valid).toBe(true)
      expect(res.perShareRisk).toBe(2)
      expect(res.riskBudget).toBe(500)
      // 500 / 2 = 250 shares. Max affordable = 25000 / 100 = 250 shares.
      expect(res.plannedShares).toBe(250)
      expect(res.positionValue).toBe(25000)
      expect(res.actualRiskAmount).toBe(500)
      expect(res.targets.r1).toBe(102)
      expect(res.targets.r2).toBe(104)
      expect(res.targets.r2Profit).toBe(1000) // 2:1 RR
    })

    it('respects setup quality multiplier (B-Grade = 75% size)', () => {
      const res = calculatePositionSize({
        accountValue: 25000,
        entryPrice: 100,
        stopPrice: 98,
        mode: 'DayTrader',
        grade: 'B', // 75% multiplier -> $375 budget
      })

      expect(res.valid).toBe(true)
      expect(res.riskBudget).toBe(375)
      // Math.floor(375 / 2) = 187 shares
      expect(res.plannedShares).toBe(187)
    })

    it('respects SwingTrader 3% risk ceiling with 3:1 RR targets', () => {
      const res = calculatePositionSize({
        accountValue: 50000,
        entryPrice: 200,
        stopPrice: 190, // $10 per share risk
        mode: 'SwingTrader', // 3% risk = $1,500 budget
        grade: 'A',
      })

      expect(res.valid).toBe(true)
      expect(res.riskBudget).toBe(1500)
      expect(res.plannedShares).toBe(150)
      expect(res.targets.r3).toBe(230) // 200 + 3*10
      expect(res.targets.r3Profit).toBe(4500) // 150 * 30
    })

    it('clamps to buying power when risk budget allows more shares than cash', () => {
      const res = calculatePositionSize({
        accountValue: 5000,
        entryPrice: 100,
        stopPrice: 99.9, // tiny $0.10 risk per share
        mode: 'DayTrader', // 2% = $100 budget -> $100 / 0.10 = 1000 shares ($100k)
        grade: 'A',
      })

      expect(res.valid).toBe(true)
      // Max affordable = 5000 / 100 = 50 shares
      expect(res.plannedShares).toBe(50)
      expect(res.positionValue).toBe(5000)
    })

    it('rejects invalid entry and stop values', () => {
      const res1 = calculatePositionSize({
        accountValue: 10000,
        entryPrice: 50,
        stopPrice: 55, // Stop above entry
        mode: 'DayTrader',
        grade: 'A',
      })
      expect(res1.valid).toBe(false)
      expect(res1.error).toContain('strictly higher than stop loss')

      const res2 = calculatePositionSize({
        accountValue: -100,
        entryPrice: 50,
        stopPrice: 48,
        mode: 'DayTrader',
        grade: 'A',
      })
      expect(res2.valid).toBe(false)
    })
  })

  describe('evaluateUnkScore', () => {
    it('scores high-conviction fundamental growth and technical sweet-spot as STRONG BUY', () => {
      const res = evaluateUnkScore({
        peRatio: 18, // +2
        revenueGrowthPct: 25, // +2
        roePct: 22, // +2
        debtToEquity: 0.4, // +1
        rsi: 60, // +1
        macdTrend: 'BULLISH', // +1
      })

      expect(res.score).toBeGreaterThanOrEqual(5)
      expect(res.signal).toBe('STRONG BUY')
      expect(res.factors.length).toBeGreaterThan(3)
    })

    it('flags extended overbought conditions with penalty', () => {
      const res = evaluateUnkScore({
        rsi: 85, // -2
        macdTrend: 'BEARISH', // -1
      })

      expect(res.score).toBeLessThan(0)
      expect(['HOLD', 'SELL', 'STRONG SELL']).toContain(res.signal)
    })
  })

  describe('computeCushionStatus & Circuit Breakers', () => {
    it('triggers daily max loss breaker when realized loss exceeds 5% of account', () => {
      const trades: TradeLogEntry[] = [
        {
          id: '1',
          timestamp: '2026-09-26',
          symbol: 'NVDA',
          shares: 50,
          entryPrice: 140,
          exitPrice: 130,
          pnl: -500,
          pnlPct: -7.1,
          mode: 'DayTrader',
          grade: 'A',
        },
        {
          id: '2',
          timestamp: '2026-09-26',
          symbol: 'TSLA',
          shares: 20,
          entryPrice: 350,
          exitPrice: 310,
          pnl: -800,
          pnlPct: -11.4,
          mode: 'DayTrader',
          grade: 'A',
        },
      ]

      // Account = $20,000 -> 5% max loss = $1,000. Total pnl = -$1,300.
      const status = computeCushionStatus(trades, 20000)
      expect(status.circuitBreakerHit).toBe(true)
      expect(status.circuitBreakerReason).toContain('Daily Max Loss Hit')
    })

    it('triggers consecutive loss breaker after 3 back-to-back losses', () => {
      const trades: TradeLogEntry[] = [
        { id: '1', timestamp: '1', symbol: 'A', shares: 10, entryPrice: 10, exitPrice: 9, pnl: -10, pnlPct: -10, mode: 'Scalper', grade: 'B' },
        { id: '2', timestamp: '2', symbol: 'B', shares: 10, entryPrice: 10, exitPrice: 9, pnl: -10, pnlPct: -10, mode: 'Scalper', grade: 'B' },
        { id: '3', timestamp: '3', symbol: 'C', shares: 10, entryPrice: 10, exitPrice: 9, pnl: -10, pnlPct: -10, mode: 'Scalper', grade: 'B' },
      ]

      const status = computeCushionStatus(trades, 50000)
      expect(status.circuitBreakerHit).toBe(true)
      expect(status.circuitBreakerReason).toContain('Consecutive Loss Limit Hit')
    })
  })

  describe('calculateVolatilityCashBuffer', () => {
    it('enforces 30% cash buffer in low VIX complacency regime (<15)', () => {
      const alloc = calculateVolatilityCashBuffer(14.1)
      expect(alloc.regime).toBe('COMPLACENCY')
      expect(alloc.targetCashPct).toBe(30)
      expect(alloc.targetEquityPct).toBe(70)
      expect(alloc.statusBadge).toBe('WARNING')
      expect(alloc.tacticalAction).toContain('Cash-Secured Puts')
    })

    it('recommends standard 80/20 in normal VIX regime (15-22)', () => {
      const alloc = calculateVolatilityCashBuffer(18.5)
      expect(alloc.regime).toBe('NORMAL')
      expect(alloc.targetCashPct).toBe(20)
      expect(alloc.targetEquityPct).toBe(80)
    })

    it('triggers panic capital deployment zone at extreme VIX (>30)', () => {
      const alloc = calculateVolatilityCashBuffer(35)
      expect(alloc.regime).toBe('PANIC')
      expect(alloc.targetCashPct).toBe(5)
      expect(alloc.targetEquityPct).toBe(95)
      expect(alloc.statusBadge).toBe('BULLISH')
    })
  })

  describe('calculateOptionsWheelPlan', () => {
    it('computes cash secured put strikes and net discount basis correctly', () => {
      const plan = calculateOptionsWheelPlan('GOOGL', 340, 52)
      expect(plan.symbol).toBe('GOOGL')
      expect(plan.cspStrike).toBeLessThan(340)
      expect(plan.estimatedPremium).toBeGreaterThan(0)
      expect(plan.netEffectiveCostBasis).toBe(plan.cspStrike - plan.estimatedPremium)
      expect(plan.discountFromMarketPct).toBeGreaterThan(0)
      expect(plan.coveredCallStrike).toBeGreaterThan(340)
      expect(plan.strangleMonthlyIncome).toBeGreaterThan(plan.estimatedPremium)
    })
  })
})

