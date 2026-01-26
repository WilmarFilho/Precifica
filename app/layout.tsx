import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>

        {/* Configuração do Loader de Rota instantâneo */}
        <NextTopLoader 
         color="#2563eb"  // Cor azul-600 (a mesma dos seus botões)
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          zIndex={99999}
        />
        
        {children}
      </body>
    </html>
  );
}