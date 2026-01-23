import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start"
});

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
    <html lang="en" className={pressStart2P.variable}>
      <body>{children}</body>
    </html>
  );
}
