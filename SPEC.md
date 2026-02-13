# Znft Spec v1 (Devnet)

## Goal
Web app mint NFT trên Solana Devnet, demo được end-to-end trong 1 flow đơn giản.

## Scope v1
- Connect wallet (Phantom/Solflare)
- Nhập metadata cơ bản: name, symbol, description, image URI
- Mint 1 NFT/tx trên Devnet
- Hiển thị mint result: mint address + explorer link

## Out of scope v1
- Mainnet
- Candy Machine phức tạp
- Batch mint
- Role-based admin panel

## Tech
- Next.js + TypeScript
- @solana/web3.js
- @solana/wallet-adapter-react + ui
- @metaplex-foundation/umi + mpl-token-metadata

## Env
- `NEXT_PUBLIC_SOLANA_RPC` (default devnet)
- `NEXT_PUBLIC_NETWORK=devnet`

## UX flow
1. User connect wallet
2. User nhập metadata fields
3. Click Mint
4. App gửi tx + confirm
5. App show mint address + tx signature + Solana Explorer links

## Done definition
- Mint thành công ít nhất 3 lần liên tiếp trên devnet
- Có error state rõ ràng khi thiếu balance hoặc reject tx
- README có hướng dẫn run local dưới 5 phút
