"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useSolanaNetwork } from "./SolanaProvider";

export default function MintForm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { network, setNetwork } = useSolanaNetwork();

  const [name, setName] = useState("ZNFT Demo");
  const [symbol, setSymbol] = useState("ZNFT");
  const [description, setDescription] = useState("Demo NFT on Solana");
  const [imageUri, setImageUri] = useState("https://placehold.co/600x600/png");
  const [recipient, setRecipient] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimatedSol, setEstimatedSol] = useState<string>("");

  const metaplex = useMemo(() => Metaplex.make(connection).use(walletAdapterIdentity(wallet)), [connection, wallet]);

  const onSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "7359317da099d8eb8ad72b9fe8512564";

    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      const url = json?.data?.url as string | undefined;

      if (!res.ok || !url) throw new Error(json?.error?.message || "Image upload failed");
      setImageUri(url);
    } catch (err: any) {
      setError(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onEstimate = async () => {
    if (!wallet.publicKey) return setError("Please connect your wallet first.");

    setEstimating(true);
    setError("");
    try {
      const { blockhash } = await connection.getLatestBlockhash();

      const msg = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: 1,
          }),
        ],
      }).compileToV0Message();

      const tx = new VersionedTransaction(msg);
      const feeRes = await connection.getFeeForMessage(tx.message, "confirmed");
      const networkFeeLamports = feeRes.value ?? 5000;

      const mintRent = await connection.getMinimumBalanceForRentExemption(82);
      const ataRent = await connection.getMinimumBalanceForRentExemption(165);
      const metadataRent = await connection.getMinimumBalanceForRentExemption(679);
      const masterEditionRent = await connection.getMinimumBalanceForRentExemption(282);

      const totalLamports = networkFeeLamports * 2 + mintRent + ataRent + metadataRent + masterEditionRent;
      setEstimatedSol((totalLamports / 1_000_000_000).toFixed(6));
    } catch (e: any) {
      const msg = e?.message || "Estimate failed.";
      if (msg.includes("403") || msg.toLowerCase().includes("access forbidden")) {
        setError("Mainnet RPC is blocked (403). Please set NEXT_PUBLIC_SOLANA_RPC_MAINNET to an accessible endpoint.");
      } else {
        setError(msg);
      }
    } finally {
      setEstimating(false);
    }
  };

  const onMint = async () => {
    setError("");
    setMintAddress("");
    setSignature("");
    setOwnerAddress("");

    if (!wallet.publicKey) return setError("Please connect your wallet first.");
    if (!imageUri) return setError("Image URI is required.");

    let tokenOwner: PublicKey;
    try {
      tokenOwner = recipient.trim() ? new PublicKey(recipient.trim()) : wallet.publicKey;
    } catch {
      return setError("Recipient wallet address is invalid.");
    }

    setLoading(true);
    try {
      const metadataRes = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol, description, image: imageUri }),
      });

      const metadataJson = await metadataRes.json();
      if (!metadataRes.ok || !metadataJson?.uri) {
        throw new Error(metadataJson?.error || "Create metadata failed");
      }

      const { nft, response } = await metaplex.nfts().create({
        uri: metadataJson.uri,
        name,
        sellerFeeBasisPoints: 0,
        symbol,
        tokenOwner,
        isMutable: true,
      });

      setMintAddress(nft.address.toBase58());
      setSignature(response.signature);
      setOwnerAddress(tokenOwner.toBase58());
    } catch (e: any) {
      const msg = e?.message || "Mint failed.";
      if (msg.includes("403") || msg.toLowerCase().includes("access forbidden")) {
        setError("Mainnet RPC is blocked (403). Please set NEXT_PUBLIC_SOLANA_RPC_MAINNET to an accessible endpoint.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="hero-row">
        <div>
          <h2>ZNFT Mint Studio</h2>
          <p className="small">Mint NFTs on Solana with a clean, reliable, and production-ready flow.</p>
        </div>
        <div className="status-chip">{wallet.connected ? "Wallet Connected" : "Wallet Not Connected"}</div>
      </div>

      <div className="section">
        <div className="row">
          <div>
            <label>Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value as "devnet" | "mainnet-beta")} style={{ width: "100%", marginTop: 8, marginBottom: 14 }}>
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
            <p className="small" style={{ marginBottom: 6 }}>Current: {network}</p>
            <p className="small" style={{ marginBottom: 10 }}>
              Provider: {network === "mainnet-beta" ? "Mainnet Provider (secured)" : "Devnet Provider"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {network === "mainnet-beta" && (
        <div className="notice warn">
          Mainnet mode is live. Transactions use real SOL and cannot be reversed.
        </div>
      )}

      <div className="section">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <div className="row">
          <div>
            <label>Symbol</label>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <label>Upload Image</label>
            <input type="file" accept="image/*" onChange={onSelectFile} />
            <p className="small">{uploading ? "Uploading image..." : "Upload via ImgBB"}</p>
          </div>
        </div>

        <label>Image URI</label>
        <input value={imageUri} onChange={(e) => setImageUri(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        <label>Recipient Wallet (optional)</label>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Leave empty to mint into the connected wallet" />

        <div className="actions">
          <button onClick={onEstimate} disabled={estimating || !wallet.connected}>
            {estimating ? "Estimating..." : "Estimate Fee"}
          </button>
          <button onClick={onMint} disabled={loading || uploading || !wallet.connected}>
            {loading ? "Minting..." : uploading ? "Uploading image..." : `Mint NFT (${network === "mainnet-beta" ? "Mainnet" : "Devnet"})`}
          </button>
          <span className="small">1 NFT / transaction</span>
        </div>

        {estimatedSol && <p className="small" style={{ marginTop: 10 }}>Estimated mint fee: ~{estimatedSol} SOL (pre-sign estimate)</p>}
      </div>

      {error && <p className="error">{error}</p>}

      {mintAddress && (
        <div className="result">
          <p className="success">Mint successful ✅</p>
          <p className="small">Mint: {mintAddress}</p>
          <p className="small">Owner: {ownerAddress || wallet.publicKey?.toBase58()}</p>
          <p className="small">Tx: {signature}</p>
          <a href={`https://explorer.solana.com/address/${mintAddress}?cluster=${network}`} target="_blank">View mint on Explorer</a>
          <br />
          <a href={`https://explorer.solana.com/tx/${signature}?cluster=${network}`} target="_blank">View transaction</a>
        </div>
      )}
    </div>
  );
}
