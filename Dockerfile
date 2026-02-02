# 🔴 VERSIÓN INSEGURA: Dockerfile sin hardening
# Este archivo tiene vulnerabilidades intencionales para demostración

# Problema 1: No se especifica versión exacta con hash
FROM node:18-alpine

# Problema 2: No hay metadata
WORKDIR /app

# Problema 3: No se optimiza el orden de capas
COPY package.json .
RUN npm install --production

COPY index-insecure.js .

# Problema 4: No se crea usuario no-root (ejecuta como root)
# Problema 5: Puerto no estándar expuesto
ENV PORT=3000
EXPOSE 3000

# Problema 6: No hay health check
# Problema 7: No usa dumb-init para manejo de señales
CMD ["node", "index-insecure.js"]
