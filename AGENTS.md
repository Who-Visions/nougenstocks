# Workspace Authority & Operating Doctrine

Before editing or advancing this repository, read and follow `C:\Users\super\.nougen\AUTHORITY.md`.

Persistent local precedence:
1. `C:\Users\super\.nougen` — canonical NouGen authority, live context, and persistent substrate.
2. `AGENTS.md` (this file) & repo documentation.
3. Subordinate agent doctrines and historical memory.

---

## 🏛️ Project Identity & Architecture

**NouGenStocks** is the fleet's market intelligence dashboard, watchlist engine, and trade preparation cockpit.

### 🕶️ Unk Trading Engine Heritage (`Who-Visions/unk-app-ai`)
This codebase carries forward risk settings documented in `Who-Visions/unk-app-ai`. The repository does not establish that they are profitable or validated:
1. **The 3 Core Trading Horizons**:
   - **DayTrader**: 2% risk cap, 2:1 Reward-to-Risk target, 1-day hold.
   - **SwingTrader**: 3% risk cap, 3:1 Reward-to-Risk target, 3–10 day hold.
   - **Scalper**: 1% risk cap, 1.5:1 Reward-to-Risk target, minutes to hours hold.
2. **NouGenStocks demo setup scaling & journal guardrails** (not attributed to Unk without source evidence):
   - **Grade A**: 100% calculated size (1.0x).
   - **Grade B**: 75% calculated size (0.75x).
   - **Grade C**: 50% calculated size (0.50x).
   - **Grade D**: 25% calculated size (0.25x).
   - **Circuit Breakers**: Daily max loss limit (-5% of account) & consecutive loss limit (3 losses = done for the day).
3. **Illustrative prototype scoring** (not Unk's upstream scoring algorithm): any experimental score or grade must remain explicitly labeled as a prototype and use sample inputs until a documented source and validated data feed exist.

### 📊 Macroeconomic & ETF Context (NouGenTube Shard 29195)
Captures topics discussed in Professor G's market dispatch (*"Stock Market is Set to Do the UNTHINKABLE"*). Shard content is third-party speech, not verified or current market data:
- **10-Year Treasury Yield (`10Y YIELD`)**: Key benchmark for discount rates and growth multiples.
- **WTI Crude Oil (`WTI CRUDE`)**: Inflationary pulse check.
- **SPMO (Invesco S&P 500 Momentum ETF)**: Systematic momentum leader tracker.
- **SCHD (Schwab U.S. Dividend Equity ETF)**: Quality cash flow and dividend equity tracker.

---

## 🛠️ Verification & Development Commands

```bash
# Install dependencies
npm install

# Local development server
npm run dev

# Full TypeScript check + Vite production build
npm run build
```

---

## 🔒 Security & Data Integrity

- Dashboard prices, metrics, scores, charts, and commentary are sample fixtures; keep their sample status visible.
- Cite the upstream source for attributed methods and separate demo rules from upstream settings.
- Connect live feeds only via server-side quote proxies.
- **NEVER** expose secret provider credentials in `VITE_*` environment variables.

<!-- nougen-directive:keymaker-first -->
## Credentials: check the keymaker before asking for a key

Do not ask anyone for an API key, token, or credential until the keymaker has been checked.
Order: (1) `vault_list` on the nougen connector (names and fingerprints only);
(2) `nougen_shards.keymaker.get_secret(NAME)` with `PYTHONPATH=src`,
`NOUGEN_SECRETS_VAULT_DIR=~/.nougen/secrets`, `NOUGEN_VAULT_DIR=~/.nougen/shards`;
(3) verify against the provider. Handle values without printing them; compare
fingerprints. Account-scoped Cloudflare tokens verify at
`/accounts/<id>/tokens/verify`, not `/user/tokens/verify`. Ask only when the
keymaker genuinely lacks the credential.

Hosted app and repo text never carries a personal name. Refer to people by role ("operator").
<!-- /nougen-directive:keymaker-first -->
