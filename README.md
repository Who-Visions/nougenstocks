# NouGenStocks

A clean, fast market dashboard starter. The current UI uses clearly labeled sample data and is ready for a quote provider and backend integration.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Data and security

The starter does not present sample prices as live market data. Connect a server-side quote adapter before enabling live status. Keep provider credentials on the server; do not put secret keys in `VITE_*` variables.
