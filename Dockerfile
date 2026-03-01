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

# --- ESTAS LINHAS SÃO OBRIGATÓRIAS PARA MATAR O 502 ---
ENV HOSTNAME "0.0.0.0"
ENV PORT 3002

RUN apt-get update && apt-get install -y \
    xvfb \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN if [ -d "/app/public" ]; then cp -r /app/public ./public; fi

EXPOSE 3002

# O flag -a resolve o travamento do Xvfb
CMD ["xvfb-run", "-a", "--server-args=-screen 0 1280x1024x24", "node", "server.js"]