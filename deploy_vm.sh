#!/bin/sh
set -e

IMAGE_NAME=cloudsec:latest
CONTAINER_NAME=cloudsec

echo "Comprobando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no encontrado. Instala Docker antes de ejecutar este script." >&2
  exit 1
fi

echo "Construyendo la imagen Docker..."
docker build -t ${IMAGE_NAME} .

if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
  echo "Deteniendo y eliminando contenedor existente..."
  docker rm -f ${CONTAINER_NAME}
fi

echo "Ejecutando el contenedor en background (puerto VM:8080 -> contenedor:3000)..."
docker run -d --name ${CONTAINER_NAME} --restart unless-stopped -p 8080:3000 -e API_KEY="${API_KEY:-changeme}" ${IMAGE_NAME}

echo "Contenedor iniciado. Mostrar estado:"
docker ps -f name=${CONTAINER_NAME}

echo "Espacio en disco (raíz):"
df -h /

echo "Sugerencia: limpiar imágenes intermedias si falta espacio: docker image prune -f"
