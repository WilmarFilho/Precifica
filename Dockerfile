# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder
# Define o diretório de trabalho
WORKDIR /app
# Copia package.json e package-lock.json para instalar dependências
COPY package.json package-lock.json ./
RUN npm install
# Copia o restante do código
COPY . .
# Gera o build de produção do Next.js
# Variáveis de ambiente de build (como NEXT_PUBLIC_...) devem ser passadas aqui
RUN npm run build
# --- STAGE 2: RUNTIME ---
FROM node:20-alpine AS runner
# Define o diretório de trabalho
WORKDIR /app
# Instala apenas as dependências de produção
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --only=production
# Copia os arquivos de build e o servidor Next.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Define a porta fixa para o serviço
ENV PORT 3002
EXPOSE 3002
# Comando para iniciar a aplicação em modo de produção
CMD ["npm", "start"]