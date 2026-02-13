import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Press_Start_2P } from "next/font/google";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Znft Mint Studio",
  description: "Mint NFT on Solana devnet/mainnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={pixel.className}>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
