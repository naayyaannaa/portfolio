import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nayana — Portfolio",
  description: "The notebook of Nayana. Designer, builder, tinkerer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
