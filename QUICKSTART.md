# 🚀 Guía Rápida de Ejecución

## 📋 Prerrequisitos

- Cuenta de Google Cloud Platform
- `gcloud` CLI instalado
- Docker instalado (para escenario inseguro)
- Git

---

## 🔴 ESCENARIO 1: INSEGURO (VM + Docker)

### 1. Configurar VM en GCP

```bash
# Crear VM (si no existe)
gcloud compute instances create cloudsec-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server

# Abrir puerto 8080 en firewall
gcloud compute firewall-rules create allow-cloudsec \
  --allow=tcp:8080 \
  --target-tags=http-server \
  --description="Allow insecure HTTP traffic for security demo"
```

### 2. Conectar y desplegar

```bash
# SSH a la VM
gcloud compute ssh cloudsec-vm --zone=us-central1-a

# Instalar Docker (si no está instalado)
sudo apt-get update
sudo apt-get install -y docker.io git
sudo usermod -aG docker $USER
exit  # Reconectar para aplicar permisos

# Volver a conectar
gcloud compute ssh cloudsec-vm --zone=us-central1-a

# Clonar proyecto
git clone https://github.com/Gpcaceres/ClouSecurity.git
cd ClouSecurity

# Desplegar versión insegura
chmod +x deploy_vm.sh
./deploy_vm.sh
```

### 3. Obtener IP pública

```bash
# En tu máquina local
gcloud compute instances describe cloudsec-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### 4. Probar vulnerabilidades

```bash
# Reemplaza <IP> con tu IP pública
IP=34.70.59.227

# ❌ Prueba 1: Acceso sin autenticación real
curl http://$IP:8080/

# ❌ Prueba 2: API key predecible
curl http://$IP:8080/secure -H "x-api-key: changeme"
# Resultado: ¡Acceso concedido a datos sensibles!

# ❌ Prueba 3: Sin rate limiting (ataque de fuerza bruta)
for i in {1..100}; do
  curl -s http://$IP:8080/secure -H "x-api-key: test$i" &
done
# Todas las peticiones son procesadas sin límite

# ❌ Prueba 4: Tráfico HTTP interceptable
# Usar Wireshark o tcpdump para ver datos en texto plano
```

### 5. Documentar hallazgos

Anota en tu informe:
- ✅ Credenciales débiles
- ✅ HTTP sin cifrado
- ✅ Sin rate limiting
- ✅ Puerto expuesto públicamente
- ✅ Container ejecutando como root

---

## 🟢 ESCENARIO 2: SEGURO (Cloud Run)

### 1. Preparar entorno local

```bash
# En tu máquina local (Windows/Mac/Linux)
cd ClouSecurity

# Instalar dependencias seguras (opcional, para desarrollo local)
cd secure
npm install
cd ..
```

### 2. Desplegar en Cloud Run

```bash
# Autenticarse
gcloud auth login

# Configurar proyecto (reemplaza con tu PROJECT_ID)
export PROJECT_ID=tu-proyecto-gcp

# Dar permisos de ejecución al script
chmod +x deploy_gcloud_secure.sh

# Ejecutar despliegue seguro
PROJECT_ID=$PROJECT_ID ./deploy_gcloud_secure.sh
```

**Nota**: El script generará una API key aleatoria de 64 caracteres. **¡Guárdala!**

```
🔑 Generated API Key: a1b2c3d4e5f6...
⚠️  SAVE THIS KEY - It won't be displayed again!
```

### 3. Obtener URL del servicio

```bash
# El script mostrará la URL automáticamente, o ejecuta:
gcloud run services describe cloudsec-secure \
  --region=us-central1 \
  --format='value(status.url)'
```

Ejemplo: `https://cloudsec-secure-xxxxx-uc.a.run.app`

### 4. Probar seguridad

```bash
# Guardar variables
SERVICE_URL=https://cloudsec-secure-xxxxx-uc.a.run.app
API_KEY=a1b2c3d4e5f6...  # La que guardaste

# ❌ Prueba 1: Acceso sin autenticación
curl $SERVICE_URL/secure
# Resultado: 403 Forbidden (¡ÉXITO!)

# ❌ Prueba 2: Solo con API key (sin IAM)
curl $SERVICE_URL/secure -H "x-api-key: $API_KEY"
# Resultado: 403 Forbidden (¡ÉXITO!)

# ✅ Prueba 3: Autenticación completa (IAM + API key)
TOKEN=$(gcloud auth print-identity-token)
curl $SERVICE_URL/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-api-key: $API_KEY"
# Resultado: {"secret":"datos-sensibles-protegidos","accessGranted":true}

# ✅ Prueba 4: HTTPS verificado
curl -v $SERVICE_URL/ 2>&1 | grep "SSL"
# Verás certificados TLS válidos

# ✅ Prueba 5: Security Headers
curl -I $SERVICE_URL/
# Verás headers de Helmet (X-Content-Type-Options, X-Frame-Options, etc.)

# ✅ Prueba 6: Rate Limiting
# Ejecutar 200 requests rápidas
for i in {1..200}; do
  curl -s -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
       -H "x-api-key: $API_KEY" \
       $SERVICE_URL/secure &
done
# Después de ~100 requests, verás: "Too many requests"
```

### 5. Ver logs y métricas

```bash
# Logs en tiempo real
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=cloudsec-secure"

# Logs estructurados de seguridad
gcloud logging read "resource.type=cloud_run_revision AND \
  resource.labels.service_name=cloudsec-secure AND \
  jsonPayload.eventType!=null" \
  --limit=50 \
  --format=json

# Métricas del servicio
gcloud run services describe cloudsec-secure \
  --region=us-central1 \
  --format=yaml
```

### 6. Verificar Secret Manager

```bash
# Listar secretos
gcloud secrets list

# Ver versiones del secreto
gcloud secrets versions list cloudsec-api-key

# Ver valor (requiere permisos)
gcloud secrets versions access latest --secret=cloudsec-api-key
```

---

## 📊 Comparar Resultados

### Checklist de Verificación

| Prueba | Inseguro ❌ | Seguro ✅ |
|--------|-------------|-----------|
| HTTP/HTTPS | HTTP | HTTPS |
| Autenticación | API key débil | IAM + API key fuerte |
| Rate Limiting | Sin límite | 100 req/15min |
| Security Headers | Ninguno | Helmet completo |
| Logging | Console.log | Cloud Logging estructurado |
| Secretos | Hardcoded | Secret Manager |
| Usuario Container | Root | Non-root |
| Escaneo Vulnerabilidades | No | Sí (Artifact Registry) |

### Capturas para el Informe

1. **Escenario Inseguro**: Captura de `curl` exitoso con `changeme`
2. **Escenario Seguro**: Captura de rechazo sin autenticación
3. **Logs de Cloud Logging**: Eventos de seguridad estructurados
4. **Secret Manager**: Captura de secreto gestionado
5. **Escaneo de vulnerabilidades**: Resultados de Artifact Registry

---

## 🧹 Limpieza (Opcional)

### Eliminar recursos del Escenario Inseguro

```bash
# Eliminar VM
gcloud compute instances delete cloudsec-vm --zone=us-central1-a

# Eliminar regla de firewall
gcloud compute firewall-rules delete allow-cloudsec
```

### Eliminar recursos del Escenario Seguro

```bash
# Eliminar servicio Cloud Run
gcloud run services delete cloudsec-secure --region=us-central1

# Eliminar secreto
gcloud secrets delete cloudsec-api-key

# Eliminar repositorio de Artifact Registry
gcloud artifacts repositories delete cloudsec-secure-repo --location=us-central1
```

---

## 🎯 Próximos Pasos

1. ✅ Completar ambos despliegues
2. ✅ Documentar vulnerabilidades encontradas
3. ✅ Tomar capturas de pantalla
4. ✅ Completar [SECURITY_COMPARISON.md](SECURITY_COMPARISON.md)
5. ✅ Generar PDF del informe con `pdflatex report/report.tex`
6. ✅ Preparar presentación comparativa

---

## ❓ Troubleshooting

### Problema: VM no tiene Docker

```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
# Cerrar y volver a abrir SSH
```

### Problema: Cloud Run falla por service account

```bash
# Crear service account manualmente
gcloud iam service-accounts create cloudsec-secure \
  --display-name="Cloud Sec Secure Service Account"

# Dar permisos necesarios
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:cloudsec-secure@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Problema: No puedo acceder a la IP pública de la VM

```bash
# Verificar firewall
gcloud compute firewall-rules list

# Recrear regla si es necesario
gcloud compute firewall-rules create allow-cloudsec \
  --allow=tcp:8080 \
  --target-tags=http-server
```

### Problema: API key no funciona en Cloud Run

```bash
# Verificar secreto
gcloud secrets versions access latest --secret=cloudsec-api-key

# Actualizar secret si es necesario
echo -n "nueva-clave-segura" | gcloud secrets versions add cloudsec-api-key --data-file=-
```

---

## 📚 Recursos Adicionales

- [Documentación completa en README.md](README.md)
- [Comparación detallada en SECURITY_COMPARISON.md](SECURITY_COMPARISON.md)
- [Informe LaTeX en report/report.tex](report/report.tex)
