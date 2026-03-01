# --- STAGE 1: BUILD ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # Build do Next.js
    RUN npm run build
    
    # --- STAGE 2: RUNTIME ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    ENV PORT 3002
    
    # Copiar os arquivos do build standalone
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    
    # Proteção para a pasta public: só copia se ela existir de fato
    RUN if [ -d "/app/public" ]; then cp -r /app/public ./public; fi
    
    # Instalar o Chromium para o usuário que vai rodar o app
    RUN npx playwright install chromium
    
    EXPOSE 3002
    
    CMD ["node", "server.js"]