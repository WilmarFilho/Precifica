# --- STAGE 1: BUILD ---
    FROM mcr.microsoft.com/playwright:v1.50.0-jammy AS builder
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED 1
    RUN npm run build
    
    # --- STAGE 2: RUNTIME ---
    FROM mcr.microsoft.com/playwright:v1.50.0-jammy AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # Configurações de rede para o Next.js Standalone
    ENV HOSTNAME "0.0.0.0"
    ENV PORT 3002
    # Variável que o Playwright/Chrome buscará para abrir a janela virtual
    ENV DISPLAY=:99
    
    RUN apt-get update && apt-get install -y \
        xvfb \
        libgbm1 \
        libasound2 \
        xauth \
        && rm -rf /var/lib/apt/lists/*
    
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    RUN if [ -d "/app/public" ]; then cp -r /app/public ./public; fi
    
    EXPOSE 3002
    
    # 1. Inicia o Xvfb em background (&)
    # 2. Aguarda 2 segundos para garantir que o servidor X subiu
    # 3. Inicia o Node.js como processo principal
    CMD Xvfb :99 -screen 0 1280x1024x24 -ac +extension GLX +render -noreset -nolisten tcp & \
        sleep 2 && \
        node server.js