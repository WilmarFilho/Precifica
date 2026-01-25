import type { Metadata } from "next";


import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://precifica.nkwflow.com"),
  title: "Precifica - Simplificando seus orçamentos",
  description: "Facilite a criação e gestão de orçamentos com nossa ferramenta intuitiva e eficiente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
