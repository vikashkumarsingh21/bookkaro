import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Navbar, Footer } from "@/components/layout";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BOOKKARO | Patna's Curated Hospitality & Lifestyle Concierge",
  description:
    "Patna's curated local hospitality concierge. Verified slot requests for Hotels & Stays, Dining & Cafes, and Salons & Spas across Fraser Road, Boring Road, Bailey Road & Patliputra Colony.",
  keywords: [
    "BOOKKARO",
    "Patna local bookings",
    "Patna hotel stays",
    "Patna restaurant reservation",
    "Patna salon booking",
    "Fraser Road",
    "Boring Road",
    "Bailey Road",
    "Patliputra Colony",
  ],
};

export const viewport: Viewport = {
  themeColor: "#163829",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body
        data-workspace="customer"
        className="min-h-full flex flex-col bg-canvas text-ink font-sans selection:bg-primary/15 selection:text-ink overflow-x-hidden"
      >
        <WorkspaceProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </WorkspaceProvider>
      </body>
    </html>
  );
}
