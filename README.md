# ClouSecurity

## 🎯 Proyecto de Análisis de Seguridad en la Nube

Proyecto educativo que implementa **DOS ESCENARIOS** para análisis comparativo de seguridad:

### 📁 Escenarios implementados:

#### 🔓 **Escenario 1: INSEGURO** (Análisis de vulnerabilidades)
- **Ubicación**: Rama `main` - Archivos base
- **Propósito**: Demostrar malas prácticas y vulnerabilidades comunes
- **Tecnología**: VM + Docker + HTTP

#### 🔒 **Escenario 2: SEGURO** (Mejores prácticas)
- **Ubicación**: Carpeta `secure/` y despliegue Cloud Run
- **Propósito**: Implementar controles de seguridad robustos
- **Tecnología**: Cloud Run + Secret Manager + HTTPS + IAM

---

## 📦 Contenido creado:

### Archivos base (Escenario Inseguro):
- `index-insecure.js` : Aplicación con vulnerabilidades intencionales
- `package.json` : Dependencias básicas
- `Dockerfile` : Imagen sin hardening
- `deploy_vm.sh` : Despliegue básico en VM

### Archivos seguros (Escenario Seguro):
- `secure/index-secure.js` : Aplicación con controles de seguridad
- `secure/Dockerfile.secure` : Imagen con hardening
- `deploy_gcloud_secure.sh` : Despliegue en Cloud Run con Secret Manager

### Documentación:
- `report/report.tex` : Informe completo de análisis
- `SECURITY_COMPARISON.md` : Comparativa detallada de ambos escenarios

---

## 🚀 Instrucciones de Despliegue

### 🎭 **Levanta Todo con un Solo Comando**

```bash
# Levantar frontend + API insegura + API segura
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down
```

**Acceso:**
- 🎨 **Frontend**: http://localhost:3000
- 🔴 **API Insegura**: http://localhost:8080
- 🟢 **API Segura**: http://localhost:8443

**La interfaz web te permite:**
- ✅ Probar ambas APIs interactivamente
- ✅ Ver vulnerabilidades en tiempo real
- ✅ Comparar respuestas lado a lado
- ✅ Simular ataques de fuerza bruta
- ✅ Verificar rate limiting

---

### 📋 **Comandos Útiles**

```bash
# Ver estado de los contenedores
docker-compose ps

# Reconstruir imágenes
docker-compose build

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f insecure
docker-compose logs -f secure

# Detener un servicio específico
docker-compose stop frontend

# Reiniciar servicios
docker-compose restart
```

---

### 🔴 Opción Alternativa: Escenario Inseguro en VM

```bash
# 1. Conectar a la VM
gcloud compute ssh [VM-NAME] --zone=[ZONE]

# 2. Clonar el repositorio
git clone https://github.com/Gpcaceres/ClouSecurity.git
cd ClouSecurity

# 3. Ejecutar despliegue inseguro
chmod +x deploy_vm.sh
./deploy_vm.sh

# 4. Verificar funcionamiento
curl http://localhost:8080/
```

**Probar vulnerabilidades:**

```bash
# Con Docker Compose local:
curl http://localhost:8080/secure -H "x-api-key: changeme"

# O con VM remota:
curl http://34.70.59.227:8080/secure -H "x-api-key: changeme"

# ❌ Sin rate limiting (prueba múltiples requests)
for i in {1..1000}; do curl http://localhost:8080/secure & done

# ❌ HTTP sin cifrado (interceptable)
```
```bash
# 1. Autenticarse en GCP
gcloud auth login

# 2. Ejecutar script de despliegue seguro
PROJECT_ID=tu-proyecto-id ./deploy_gcloud_secure.sh

# 3. Probar endpoint seguro
TOKEN=$(gcloud auth print-identity-token)
API_KEY="tu-api-key-generada"

curl -H "Authorization: Bearer $TOKEN" \
     -H "x-api-key: $API_KEY" \
     https://cloudsec-secure-xxx.run.app/secure
```

**Probar seguridad (local con Docker Compose):**
```bash
# Obtener API key del archivo .env
cat .env | grep API_KEY_SECRET

# Intento sin autenticación (debe fallar)
curl http://localhost:8443/secure

# Con autenticación correcta
curl http://localhost:8443/secure -H "x-api-key: <tu-api-key>"
# 1. Autenticarse en GCP
gcloud auth login

# 2. Ejecutar script de despliegue seguro
PROJECT_ID=tu-proyecto-id ./deploy_gcloud_secure.sh

# 3. Probar endpoint seguro
TOKEN=$(gcloud auth print-identity-token)
API_KEY="tu-api-key-generada"

curl -H "Authorization: Bearer $TOKEN" \
     -H "x-api-key: $API_KEY" \
     https://cloudsec-secure-xxx.run.app/secure
```

**Características del despliegue seguro:**
- ✅ HTTPS automático con certificados gestionados
- ✅ IAM authentication requerida
- ✅ API keys en Secret Manager
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (Helmet)
- ✅ Usuario non-root en contenedor
- ✅ Logging estructurado
- ✅ Escaneo de vulnerabilidades

---

## 📊 Comparación de Escenarios

Ver [SECURITY_COMPARISON.md](SECURITY_COMPARISON.md) para análisis detallado.

### Resumen:

| Aspecto | Inseguro 🔴 | Seguro 🟢 |
|---------|-------------|-----------|
| **Transporte** | HTTP | HTTPS |
| **Autenticación** | API key débil | IAM + API key fuerte |
| **Secretos** | Hardcodeados | Secret Manager |
| **Rate Limiting** | No | Sí (100/15min) |
| **Logging** | Básico | Estructurado + Cloud Logging |
| **Usuario Container** | Root | Non-root (nodejs) |
| **Security Headers** | No | Helmet.js |
| **Escaneo** | No | Artifact Registry |
| **Puntuación** | 25/100 ⛔ | 85/100 ✅ |

---

## 📝 Generar Informe

Compilar el informe LaTeX:

```bash
# Instalar LaTeX (si no está instalado)
# Windows: MikTeX - https://miktex.org/download
# Linux: sudo apt-get install texlive-full
# macOS: brew install mactex

# Compilar PDF
cd report
pdflatex report.tex
```

---

## 🔍 Comandos Útiles

### Escenario Inseguro (VM + Docker):

```bash
# Ver estado del contenedor
docker ps -a | grep cloudsec

# Ver logs
docker logs -f cloudsec

# Detener contenedor
docker stop cloudsec

# Eliminar contenedor
docker rm cloudsec

# Limpiar imágenes
docker image prune -f
```

### Escenario Seguro (Cloud Run):

```bash
# Ver logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cloudsec-secure" --limit 50

# Ver métricas
gcloud run services describe cloudsec-secure --region=us-central1

# Actualizar servicio
gcloud run deploy cloudsec-secure --image=NUEVA_IMAGEN --region=us-central1

# Ver secretos
gcloud secrets list
gcloud secrets versions access latest --secret=cloudsec-api-key
```

---

## 🎯 Objetivos de Aprendizaje

Este proyecto demuestra:

1. **Identificación de vulnerabilidades** en despliegues cloud
2. **Modelo de responsabilidad compartida** (IaaS vs PaaS)
3. **Principios de seguridad**: CIA (Confidencialidad, Integridad, Disponibilidad)
4. **Defensa en profundidad**: Múltiples capas de seguridad
5. **Gestión de secretos** con Secret Manager
6. **IAM y principio de menor privilegio**
7. **Logging y monitoreo** para detección de incidentes
8. **Mejores prácticas** de containerización

---

## 🔒 Notas de Seguridad

### ⚠️ IMPORTANTE:

El **Escenario Inseguro** es intencional para fines educativos. 

**NUNCA uses este despliegue en producción.**

### Para el Escenario Seguro:

- Guarda la API key generada de forma segura
- Configura alertas en Cloud Monitoring
- Revisa regularmente los logs de auditoría
- Actualiza dependencias periódicamente
- Realiza escaneos de vulnerabilidades

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 👥 Contribuciones

Este es un proyecto educativo. Para mejoras o sugerencias:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📄 Licencia

Proyecto educativo para análisis de seguridad en la nube.

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