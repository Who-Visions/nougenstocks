<!-- nougen-readme-compiler: v1 -->

# 📈 NouGenStocks

A clean, fast market dashboard starter. The current UI uses clearly labeled sample data and is ready for a quote provider and backend integration.

## 📚 Contents
- [Run locally](#run-locally)
- [Build](#build)
- [Data and security](#data-and-security)
- [Fleet role](#fleet-role)

## 🚀 Run locally

```sh
npm install
npm run dev
```

## 🔧 Build

```sh
npm run build
```

## 🔒 Data and security

The starter does not present sample prices as live market data. Connect a server-side quote adapter before enabling live status. Keep provider credentials on the server; do not put secret keys in `VITE_*` variables.

## Fleet role

| | |
|---|---|
| Role | market dashboard |
| Kind | satellite |
| Status | canonical |
| Canonical for | stocks |
| Visibility | public |

This role table is generated from the NouGenRelay fleet manifest; the fleet manifest stays the source of truth for it.

## 🔗 Links

- [Source Repository](<https://github.com/Who-Visions/nougenstocks>)
