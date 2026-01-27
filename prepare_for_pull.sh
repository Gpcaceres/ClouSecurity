#!/bin/bash
set -euo pipefail

echo "Preparando el repositorio para push/pull..."

echo "1) Ajustando permisos de scripts..."
chmod +x deploy_vm.sh || true
chmod +x deploy_gcloud.sh || true

echo "2) Generando logs del contenedor 'cloudsec' si existe..."
if command -v docker >/dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' | grep -q '^cloudsec$'; then
    docker logs cloudsec > cloudsec_logs.txt || true
    echo " - cloudsec_logs.txt creado"
  else
    echo " - contenedor 'cloudsec' no encontrado, omitiendo logs"
  fi
else
  echo " - docker no instalado, omitiendo recolección de logs"
fi

echo "3) Opcional: limpiar imágenes intermedias para liberar espacio"
echo "   Ejecutar manualmente si lo deseas: docker image prune -f"

echo "4) Preparando commit git local..."
git add . || true
git commit -m "chore: add example app, deploy scripts and LaTeX report" || echo "Nothing to commit or commit failed"

echo "Hecho. Para publicar los cambios en el remoto ejecuta: git push origin <tu-rama>"
echo "Luego otros equipos pueden hacer: git pull origin <tu-rama>"
