import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "NFT Collage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: '#000000' }}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@rainbow-me/rainbowkit@2/dist/index.css" />
      </head>
      <body style={{ backgroundColor: '#000000', margin: 0, padding: 0 }}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
