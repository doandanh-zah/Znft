"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

export default function MintForm() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState("ZNFT Demo");
  const [symbol, setSymbol] = useState("ZNFT");
  const [description, setDescription] = useState("Demo NFT on Solana devnet");
  const [imageUri, setImageUri] = useState("https://placehold.co/600x600/png");
  const [mintAddress, setMintAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const metaplex = useMemo(() => Metaplex.make(connection).use(walletAdapterIdentity(wallet)), [connection, wallet]);

  const onMint = async () => {
    setError("");
    setMintAddress("");
    setSignature("");

    if (!wallet.publicKey) return setError("Please connect wallet first.");
    if (!imageUri) return setError("Image URI is required.");

    setLoading(true);
    try {
      const metadataUri = `data:application/json,${encodeURIComponent(
        JSON.stringify({ name, symbol, description, image: imageUri })
      )}`;

      const { nft, response } = await metaplex.nfts().create({
        uri: metadataUri,
        name,
        sellerFeeBasisPoints: 0,
        symbol,
        tokenOwner: wallet.publicKey,
        isMutable: true,
      });

      setMintAddress(nft.address.toBase58());
      setSignature(response.signature);
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Znft Devnet Mint</h2>
      <p className="small">Network: {process.env.NEXT_PUBLIC_NETWORK || "devnet"}</p>
      <WalletMultiButton />

      <div style={{ marginTop: 16 }}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <div className="row">
          <div>
            <label>Symbol</label>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <label>Image URI</label>
            <input value={imageUri} onChange={(e) => setImageUri(e.target.value)} />
          </div>
        </div>

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        <button onClick={onMint} disabled={loading || !wallet.connected}>
          {loading ? "Minting..." : "Mint NFT (Devnet)"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {mintAddress && (
        <div style={{ marginTop: 12 }}>
          <p className="success">Mint thành công ✅</p>
          <p className="small">Mint: {mintAddress}</p>
          <p className="small">Tx: {signature}</p>
          <a href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`} target="_blank">
            Xem mint trên Explorer
          </a>
          <br />
          <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank">
            Xem transaction
          </a>
        </div>
      )}
    </div>
  );
}
