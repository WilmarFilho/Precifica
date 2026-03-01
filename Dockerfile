# --- STAGE 1: BUILD ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # Build do Next.js (Certifique-se que o next.config.js tem output: 'standalone')
    RUN npm run build
    
    # --- STAGE 2: RUNTIME ---
    # Usamos uma imagem que aceite as dependências do Playwright
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    ENV PORT 3002
    
    # Criar usuário de segurança
    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 nextjs
    
    # Copiar arquivos necessários do builder
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    
    # IMPORTANTE: Instalar apenas o Chromium no estágio de execução
    # Isso garante que o binário exista na pasta que o Playwright procura em produção
    RUN npx playwright install chromium
    
    USER nextjs
    EXPOSE 3002
    
    CMD ["node", "server.js"]