# Znft

Web mint NFT trên Solana Devnet.

## Mục tiêu
- Mint NFT trên Devnet qua web UI.
- Wallet connect + mint flow tối giản, dễ demo.

## Stack
- Next.js + TypeScript (App Router)
- @solana/web3.js + Wallet Adapter (Phantom/Solflare)
- @metaplex-foundation/js (mint NFT)

## Biến môi trường
Copy `.env.example` -> `.env.local`

```bash
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

## Run local (<=5 phút)
```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Flow demo
1. Connect wallet
2. Điền Name/Symbol/Description/Image URI
3. Click `Mint NFT (Devnet)`
4. Xem mint address + tx signature + explorer links

## Nhánh làm việc
- main: stable
- feat/*: tính năng
- fix/*: bugfix
