# ClouSecurity

Proyecto de ejemplo para la actividad de análisis de seguridad en la nube.

Contenido creado:
- `index.js` : aplicación Node.js mínima (Express).
- `package.json` : dependencias y script de inicio.
- `Dockerfile` : imagen ligera basada en `node:18-alpine`.
- `deploy_vm.sh` : script para construir y ejecutar el contenedor en la VM.
- `report/report.tex` : plantilla LaTeX con la estructura del informe.

Instrucciones rápidas (en la VM):

1. Clona o copia este repo en la VM.
2. Ejecuta (dar permiso antes):

```bash
chmod +x deploy_vm.sh
./deploy_vm.sh
```

3. La aplicación quedará escuchando en el puerto `8080` de la VM.

Comandos útiles:

```bash
# Ver estado del contenedor
docker ps -a | grep cloudsec

# Ver logs
docker logs -f cloudsec

# Liberar imágenes intermedias
docker image prune -f
```

Para compilar el informe PDF (local): instalar LaTeX (TeX Live/MikTeX) y ejecutar `pdflatex report/report.tex`.

Sigue las instrucciones en este README para pasos detallados.