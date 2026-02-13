"use client";

import React, { createContext, FC, PropsWithChildren, useContext, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export type SolanaNetwork = "devnet" | "mainnet-beta";

type NetworkCtx = {
  network: SolanaNetwork;
  setNetwork: (n: SolanaNetwork) => void;
  endpoint: string;
};

const SolanaNetworkContext = createContext<NetworkCtx | null>(null);

const pickDefaultNetwork = (): SolanaNetwork => {
  const raw = process.env.NEXT_PUBLIC_NETWORK;
  return raw === "mainnet-beta" ? "mainnet-beta" : "devnet";
};

const endpointByNetwork = (network: SolanaNetwork) => {
  if (network === "mainnet-beta") {
    // Default to a public RPC that is less likely to reject anonymous browser traffic.
    return process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || "https://rpc.ankr.com/solana";
  }
  return process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("devnet");
};

export const SolanaProvider: FC<PropsWithChildren> = ({ children }) => {
  const [network, setNetwork] = useState<SolanaNetwork>(pickDefaultNetwork());
  const endpoint = useMemo(() => endpointByNetwork(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <SolanaNetworkContext.Provider value={{ network, setNetwork, endpoint }}>
      <ConnectionProvider endpoint={endpoint} key={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
};

export const useSolanaNetwork = () => {
  const ctx = useContext(SolanaNetworkContext);
  if (!ctx) throw new Error("useSolanaNetwork must be used inside SolanaProvider");
  return ctx;
};
