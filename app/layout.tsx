import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";

export const metadata = {
  title: "Znft Devnet Mint",
  description: "Mint NFT devnet demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
