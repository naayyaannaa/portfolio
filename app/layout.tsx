import type { Metadata } from "next";
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
