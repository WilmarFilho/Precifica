import type { Metadata } from "next";


import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  metadataBase: new URL("https://precifica.nkwflow.com"),
  title: "Precifica - Simplificando seus orçamentos",
  description: "Facilite a criação e gestão de orçamentos com nossa ferramenta intuitiva e eficiente.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">

        <NextTopLoader
          color="#2563eb" // Cor azul-600 (a mesma dos seus botões)
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // Desative o spinner se quiser apenas a barra
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />

        {children}
      </body>
    </html>
  );
}
