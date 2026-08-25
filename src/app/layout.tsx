import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maison Douce — Artisan Bakery",
    template: "%s · Maison Douce",
  },
  description:
    "Small-batch pastries, bread and desserts baked fresh each morning in our London atelier. Carefully sourced ingredients, slow fermentation, handcrafted every day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Without JS, framer-motion's initial hidden states would never resolve. */}
        <noscript>
          <style>{`[data-framer-appear-id],[style*="opacity: 0"]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
