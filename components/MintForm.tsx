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
  const [description, setDescription] = useState("Demo NFT on Solana devnet");
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

    const imgbbKey =
      process.env.NEXT_PUBLIC_IMGBB_API_KEY || "7359317da099d8eb8ad72b9fe8512564";

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

      if (!res.ok || !url) {
        throw new Error(json?.error?.message || "Upload ảnh thất bại");
      }

      setImageUri(url);
    } catch (err: any) {
      setError(err?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const onEstimate = async () => {
    if (!wallet.publicKey) return setError("Please connect wallet first.");

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

      // Rough rent estimate for NFT account set (mint + ATA + metadata + master edition)
      const mintRent = await connection.getMinimumBalanceForRentExemption(82);
      const ataRent = await connection.getMinimumBalanceForRentExemption(165);
      const metadataRent = await connection.getMinimumBalanceForRentExemption(679);
      const masterEditionRent = await connection.getMinimumBalanceForRentExemption(282);

      const totalLamports =
        networkFeeLamports * 2 + mintRent + ataRent + metadataRent + masterEditionRent;
      const totalSol = totalLamports / 1_000_000_000;
      setEstimatedSol(totalSol.toFixed(6));
    } catch (e: any) {
      setError(e?.message || "Estimate failed.");
    } finally {
      setEstimating(false);
    }
  };

  const onMint = async () => {
    setError("");
    setMintAddress("");
    setSignature("");
    setOwnerAddress("");

    if (!wallet.publicKey) return setError("Please connect wallet first.");
    if (!imageUri) return setError("Image URI is required.");

    let tokenOwner: PublicKey;
    try {
      tokenOwner = recipient.trim() ? new PublicKey(recipient.trim()) : wallet.publicKey;
    } catch {
      return setError("Recipient wallet address không hợp lệ.");
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
      setError(e?.message || "Mint failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Znft Devnet Mint</h2>
      <p className="small">Mint NFT devnet nhanh, mượt và rõ ràng.</p>

      <div className="section">
        <div className="row">
          <div>
            <label>Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as "devnet" | "mainnet-beta")}
              style={{ width: "100%", marginTop: 8, marginBottom: 14 }}
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
            <p className="small" style={{ marginBottom: 10 }}>
              Đang dùng: {network}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <WalletMultiButton />
          </div>
        </div>
      </div>

      <div className="section">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <div className="row">
          <div>
            <label>Symbol</label>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <label>Upload image (thiết bị)</label>
            <input type="file" accept="image/*" onChange={onSelectFile} />
            <p className="small">{uploading ? "Đang upload ảnh..." : "Upload qua ImgBB"}</p>
          </div>
        </div>

        <label>Image URI</label>
        <input value={imageUri} onChange={(e) => setImageUri(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        <label>Recipient Wallet (optional)</label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Nếu để trống sẽ mint vào ví đang connect"
        />

        <div className="actions">
          <button onClick={onEstimate} disabled={estimating || !wallet.connected}>
            {estimating ? "Đang ước tính..." : "Ước tính phí"}
          </button>
          <button onClick={onMint} disabled={loading || uploading || !wallet.connected}>
            {loading ? "Minting..." : uploading ? "Uploading image..." : `Mint NFT (${network === "mainnet-beta" ? "Mainnet" : "Devnet"})`}
          </button>
          <span className="small">1 NFT / transaction</span>
        </div>

        {estimatedSol && (
          <p className="small" style={{ marginTop: 10 }}>
            Ước tính phí mint: ~{estimatedSol} SOL (ước lượng trước khi ký tx)
          </p>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {mintAddress && (
        <div className="result">
          <p className="success">Mint thành công ✅</p>
          <p className="small">Mint: {mintAddress}</p>
          <p className="small">Owner: {ownerAddress || wallet.publicKey?.toBase58()}</p>
          <p className="small">Tx: {signature}</p>
          <a href={`https://explorer.solana.com/address/${mintAddress}?cluster=${network}`} target="_blank">
            Xem mint trên Explorer
          </a>
          <br />
          <a href={`https://explorer.solana.com/tx/${signature}?cluster=${network}`} target="_blank">
            Xem transaction
          </a>
        </div>
      )}
    </div>
  );
}
