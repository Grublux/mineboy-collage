import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "MineBoy Collage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: '#000000' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/@rainbow-me/rainbowkit@2/dist/index.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* Force RainbowKit modal to fit content and center it */
          [data-rk] div[role="dialog"] {
            min-width: 500px !important;
            max-width: none !important;
            width: fit-content !important;
            border-radius: 24px !important;
            overflow: hidden !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
          
          /* Force inner containers to fit content */
          [data-rk] div[role="dialog"] > div {
            border-radius: 24px !important;
            padding: 24px !important;
            width: fit-content !important;
            min-width: 500px !important;
            max-width: none !important;
          }
          
          /* All nested divs get rounded corners */
          [data-rk] div[role="dialog"] * {
            border-radius: inherit !important;
          }
          
          /* No text wrapping or cutting */
          [data-rk] button,
          [data-rk] a,
          [data-rk] span,
          [data-rk] div {
            white-space: nowrap !important;
            overflow: visible !important;
          }
          
          /* Wallet buttons need full width */
          [data-rk] button[role="menuitem"] {
            width: 100% !important;
            justify-content: flex-start !important;
          }
          
          /* Hide entire "What is a Wallet" right panel - target the specific panel */
          [data-rk] div[role="dialog"] > div > div:nth-child(2) {
            display: none !important;
          }
          
          /* Hide only Learn More links at bottom */
          [data-rk] a[href*="learn"],
          [data-rk] a[href*="rainbowkit"] {
            display: none !important;
          }
          
          /* Make wallet list take full width */
          [data-rk] div[role="dialog"] > div {
            display: flex !important;
            flex-direction: column !important;
          }
          
          [data-rk] div[role="dialog"] > div > div:first-child {
            width: 100% !important;
            max-width: 100% !important;
          }
        `}} />
      </head>
      <body style={{ backgroundColor: '#000000', margin: 0, padding: 0 }}>
        <ErrorBoundary>
          <WalletProvider>{children}</WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
