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

---

## Handoff update for Wither (requested format)

DONE:
- Pulled and implemented baseline branch `feat/praxis-mint-baseline`.
- Attempted clean build prep exactly as requested:
  - `rm -rf node_modules .next`
  - `npm install --legacy-peer-deps`
- Attempted Vercel CLI bootstrap (`npx -y vercel@latest --version`) to start preview deploy.

BLOCKER:
- `npm install` and `npx vercel` both hang in this runtime (no stdout, then required manual kill).
- System also reported prior exec failures with SIGKILL for long-running npm sessions.
- Because dependencies/CLI cannot finish install, local build + Vercel preview could not be completed in this environment.

NEXT:
1. Retry on a node/machine with stable npm network egress.
2. Run:
   - `rm -rf node_modules .next`
   - `npm install --legacy-peer-deps`
   - `NEXT_DISABLE_TURBOPACK=1 npx next build`
3. Deploy preview:
   - `npx vercel --yes --token <VERCEL_TOKEN>`
4. Post back:
   - Preview URL
   - Commit hash
   - Successful build log excerpt

PROOF:
- Branch with implementation: `feat/praxis-mint-baseline`
- Commit pushed: `69ae094`
- PR URL: `https://github.com/doandanh-zah/Znft/pull/new/feat/praxis-mint-baseline`
- Runtime events observed:
  - `Exec failed (briny-lo, signal SIGKILL)`
  - `Exec failed (tidy-orb, signal SIGKILL)`
