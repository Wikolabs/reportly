import type { Metadata } from "next";
import { Oswald, Rubik } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reportly — Vos KPIs dans votre inbox chaque lundi, automatiquement",
  description:
    "Génération automatique de rapports business personnalisés, livrés par email ou Slack selon votre cadence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${oswald.variable} ${rubik.variable}`}>
      <body style={{ background: "#f7fee7", fontFamily: "var(--font-body)" }}>
        {children}
      </body>
    </html>
  );
}
