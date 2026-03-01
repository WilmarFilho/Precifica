# --- STAGE 1: BUILD ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED 1
    RUN npm run build
    
    # --- STAGE 2: RUNTIME ---
    FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    ENV PORT 3002
    
    # Instalar Xvfb e dependências gráficas necessárias
    RUN apt-get update && apt-get install -y \
        xvfb \
        libgbm1 \
        libasound2 \
        && rm -rf /var/lib/apt/lists/*
    
    # Copiar os arquivos do build standalone
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    
    # Proteção para a pasta public
    RUN if [ -d "/app/public" ]; then cp -r /app/public ./public; fi
    
    EXPOSE 3002
    
    # O segredo está no CMD: Rodamos o servidor dentro do xvfb-run
    # Isso cria um monitor virtual de 1280x1024 antes de iniciar o Node
    CMD ["xvfb-run", "--server-args=-screen 0 1280x1024x24", "node", "server.js"]