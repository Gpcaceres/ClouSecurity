#!/bin/sh
set -e

# 🔴 DESPLIEGUE INSEGURO - Para demostración de vulnerabilidades
# Este script implementa malas prácticas de seguridad intencionalmente

IMAGE_NAME=cloudsec:latest
CONTAINER_NAME=cloudsec

echo "======================================"
echo "⚠️  INSECURE DEPLOYMENT (Demo)"
echo "======================================"
echo ""

echo "Comprobando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no encontrado. Instala Docker antes de ejecutar este script." >&2
  exit 1
fi

echo "Construyendo la imagen Docker..."
echo "⚠️  Usando Dockerfile sin hardening"
docker build -t ${IMAGE_NAME} .

if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
  echo "Deteniendo y eliminando contenedor existente..."
  docker rm -f ${CONTAINER_NAME}
fi

echo "Ejecutando el contenedor en background..."
echo "⚠️  Vulnerabilidades activas:"
echo "   - Puerto 8080 expuesto públicamente"
echo "   - Container ejecutando como root"
echo "   - API_KEY débil: ${API_KEY:-changeme}"
echo "   - Sin rate limiting"
echo "   - HTTP sin cifrado"
echo ""

# Problema: API_KEY hardcodeada y predecible
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p 8080:3000 \
  -e API_KEY="${API_KEY:-changeme}" \
  ${IMAGE_NAME}

echo "Contenedor iniciado. Estado:"
docker ps -f name=${CONTAINER_NAME}

echo ""
echo "Espacio en disco (raíz):"
df -h /

echo ""
echo "======================================"
echo "⚠️  DEPLOYMENT INSECURE"
echo "======================================"
echo "Aplicación disponible en: http://localhost:8080"
echo ""
echo "Vulnerabilidades demostradas:"
echo "  🔴 HTTP sin HTTPS"
echo "  🔴 Credenciales débiles"
echo "  🔴 Puerto público"
echo "  🔴 Sin rate limiting"
echo "  🔴 Container como root"
echo ""
echo "Probar vulnerabilidad:"
echo "  curl http://localhost:8080/secure -H 'x-api-key: changeme'"
echo ""
echo "Sugerencia: limpiar imágenes intermedias si falta espacio:"
echo "  docker image prune -f"
