import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* Variable font, wght axis 200–700. Self-hosted and preloaded by Next. */
const stackSans = localFont({
  src: "./fonts/StackSansNotch-Variable.woff2",
  weight: "200 700",
  style: "normal",
  display: "swap",
  variable: "--font-stack",
});

export const metadata: Metadata = {
  title: "Nayana — Portfolio",
  description:
    "Nayana — multidisciplinary designer. A deck of UI/UX, TouchDesigner and other work.",
};

/* Without this the phone assumes a ~980px viewport and renders the deck
   zoomed out to nothing — the deck is a fixed 1280 canvas, so it needs to be
   told the real device width before any of the responsive CSS can apply.
   maximumScale is left alone deliberately: pinch-zoom stays available. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={stackSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
