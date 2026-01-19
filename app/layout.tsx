import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Great Transit",
  description: "A MUSH-inspired text-based exploration game - Journey to the Galaxy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
