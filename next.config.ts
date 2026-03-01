/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // A chave correta agora é esta:
    serverExternalPackages: ['playwright', 'playwright-core'],
  }
  
  export default nextConfig;