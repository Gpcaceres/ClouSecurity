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

Despliegue a Google Cloud Run (desde tu máquina local)
---------------------------------------------------
He incluido `deploy_gcloud.sh`, un script que automatiza:
- Habilitar APIs necesarias
- Crear un repo de Artifact Registry (si no existe)
- Construir la imagen con Cloud Build y subirla a Artifact Registry
- Desplegar la imagen en Cloud Run

Uso recomendado (ejecutar en tu equipo local con `gcloud` autenticado):
```bash
# Autenticar
gcloud auth login

# Ejecutar (reemplaza PROJECT_ID por tu ID)
PROJECT_ID=brave-healer-468720-u5 ./deploy_gcloud.sh
```

Opciones:
- `REGION` : región para Artifact Registry y Cloud Run (por defecto `us-central1`).
- `REPO` : nombre del repositorio de Artifact Registry (por defecto `cloudsec-repo`).
- `ALLOW_UNAUTH` : `true` para permitir acceso público al servicio (útil para pruebas), `false` para requerir invocadores autenticados.

Notas de seguridad:
- Ejecuta este script desde un equipo con credenciales de usuario con permisos para crear y desplegar recursos en el proyecto. No pegues claves privadas aquí.
- Para producción, proteger el endpoint y usar Secret Manager (ver `deploy_gcloud.sh` comentarios).