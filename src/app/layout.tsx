import type { Metadata } from "next";
import { Karla, Playfair_Display } from "next/font/google";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://lighthouse.pk",
  ),
  title: "Lighthouse | Premium Lighting Solutions in Pakistan",
  description:
    "Premium pendants, chandeliers, and architectural lighting fixtures for homes and commercial spaces across Pakistan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
