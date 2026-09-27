# Trading methods and provenance

NouGenStocks carries forward the risk settings documented in [Unk](https://github.com/Who-Visions/unk-app-ai), the trading system Dave used. The upstream project documents three horizons and their default per-trade risk and reward-to-risk parameters:

| Horizon | Risk budget | Target multiple | Upstream source |
| --- | ---: | ---: | --- |
| DayTrader | 2% of account value | 2R | [strategy](https://github.com/Who-Visions/unk-app-ai/blob/main/services/strategies/daytrader.py) |
| SwingTrader | 3% of account value | 3R | [strategy](https://github.com/Who-Visions/unk-app-ai/blob/main/services/strategies/swingtrader.py) |
| Scalper | 1% of account value | 1.5R | [strategy](https://github.com/Who-Visions/unk-app-ai/blob/main/services/strategies/stockscalper.py) |

These are source-described defaults, not performance claims. The upstream project combines technical and fundamental inputs and describes ATR-based stop placement. NouGenStocks does not import its scoring signals or claim that the strategies are profitable.

## Sample content

Prices, fundamentals, indicator values, scores, grades, macro metrics, chart paths, and commentary in the current dashboard are illustrative UI fixtures. They are not live quotes or validated recommendations. The stock score is a local prototype and is not Unk's upstream scoring algorithm. Setup-grade multipliers and journal guardrails are NouGenStocks demo rules. New journals start empty; only entries users add are shown.

## Position planner

The planner is a long-equity calculator. The user supplies account value, entry, and stop, then chooses one of Unk’s three risk profiles. It computes:

```text
risk budget = account value × selected risk percentage
risk per share = entry − stop
risk-sized shares = floor(risk budget ÷ risk per share)
cash-capped shares = floor(account value ÷ entry)
shares = min(risk-sized shares, cash-capped shares)
target = entry + (risk per share × selected R multiple)
```

The planner rejects a stop at or above entry and floors to whole shares. Its output is arithmetic from user inputs; it does not select a ticker, assess a setup, place an order, or issue a buy/sell signal. Calculations exclude commissions, fees, slippage, price gaps, taxes, liquidity, and execution timing. Short positions and options are outside its scope.

## Market context

The linked [Investing Simplified Professor G video](https://www.youtube.com/watch?v=zIwQnCBaFDE), captured in NouGenTube as `tube:zIwQnCBaFDE`, discusses oil prices, 10-year Treasury yields, and Federal Reserve policy while cautioning against trying to time the market. It also discusses diversification, rebalancing, and a longer investment horizon. These are the speaker’s views and reported figures; NouGenStocks does not present them as verified data or predictive signals.

## Evidence boundary

Upstream strategy settings establish what Unk’s code specifies. They do not establish returns, win rates, or robustness. The video establishes what its speaker said, not whether its forecasts or historical statistics are accurate. Before presenting any strategy as an edge, the product needs a reproducible backtest with point-in-time data, corporate actions, fees, slippage, and out-of-sample evaluation.
