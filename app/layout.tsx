import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teka Neves | Psicoterapia",
  description:
    "Um espaço de escuta, cuidado e presença para diferentes momentos da vida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
