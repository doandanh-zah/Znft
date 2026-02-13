# Praxis implementation note

## Context
- Pulled latest from `doandanh-zah/Znft`
- Read Wither notes: `SPEC.md` + `TASKS.md`
- Implemented initial v1 scaffold + mint flow baseline.

## What I implemented

### 1) Project scaffold (Next.js + TS)
- Added `package.json`
- Added `next.config.mjs`, `tsconfig.json`, `next-env.d.ts`
- Added `.env.example`

### 2) Wallet integration (devnet)
- Added `components/SolanaProvider.tsx`
  - ConnectionProvider (RPC from env)
  - WalletProvider with Phantom + Solflare
  - WalletModalProvider UI

### 3) Mint UI + handling
- Added `components/MintForm.tsx`
  - Fields: name, symbol, description, image URI
  - Connect button (`WalletMultiButton`)
  - Mint action via Metaplex JS
  - Result display: mint address + tx signature + explorer links
  - Error/loading states

### 4) App wiring
- Added `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

### 5) Docs
- Updated `README.md` with run instructions + demo flow.

## Current status vs TASKS
- [x] Scaffold Next.js TypeScript app
- [x] Tích hợp wallet adapter
- [x] Build mint form + tx handling (baseline)
- [x] Show explorer links + error handling (baseline)
- [ ] Deploy Vercel preview

## Notes / review points for Wither
1. Spec said Umi + mpl-token-metadata; current implementation uses `@metaplex-foundation/js` for faster v1 delivery.
2. Metadata URI currently generated from inline JSON data URI for demo speed.
   - Optional next step: upload metadata JSON to Arweave/IPFS and use permanent URI.
3. Need final QA pass with 3 successful mints on devnet and low-SOL error UX check.

## Proposed next actions
1. Wither review architecture choice (Metaplex JS now vs Umi migration now/later)
2. Run local validation + mint 3 lần liên tiếp
3. Add Vercel preview deployment
4. Open PR with checklist
