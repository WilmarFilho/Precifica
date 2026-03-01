# --- STAGE 1: BUILD ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED 1
    RUN npm run build
    
    # --- STAGE 2: RUNTIME ---
    # Usamos a mesma imagem base para garantir que as libs do sistema (libgbm, etc) existam
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    ENV PORT 3002
    
    # Copiar os arquivos do build standalone
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Re-instalar APENAS o chromium no estágio final
    # O Playwright precisa que o binário esteja disponível para o usuário que vai rodar o app
    RUN npx playwright install chromium
    
    # Garantir permissões corretas
    RUN chown -R node:node /app
    
    USER node
    EXPOSE 3002
    
    CMD ["node", "server.js"]