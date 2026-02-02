# 🎭 Guía Rápida: Docker Compose para Demostración

## ✨ Lo que he creado para ti:

Ahora puedes **levantar ambos escenarios (inseguro y seguro) en tu máquina local** usando Docker Compose:

- **Puerto 8080**: Escenario INSEGURO 🔴
- **Puerto 8443**: Escenario SEGURO 🟢

---

## 🚀 Uso Rápido

### Windows:
```cmd
demo.bat
```

### Linux/Mac:
```bash
chmod +x demo.sh
./demo.sh
```

Verás un menú interactivo con todas las opciones.

---

## 📋 Comandos Manuales

### 1️⃣ Levantar solo el INSEGURO:
```bash
docker-compose up -d insecure
```
Accede a: http://localhost:8080

### 2️⃣ Levantar solo el SEGURO:
```bash
docker-compose up -d secure
```
Accede a: http://localhost:8443

### 3️⃣ Levantar AMBOS (para comparación):
```bash
docker-compose up -d
```
- INSEGURO: http://localhost:8080
- SEGURO: http://localhost:8443

### Ver estado:
```bash
docker-compose ps
```

### Ver logs:
```bash
# Ambos
docker-compose logs -f

# Solo inseguro
docker-compose logs -f insecure

# Solo seguro
docker-compose logs -f secure
```

### Detener:
```bash
# Detener ambos
docker-compose down

# Detener solo uno
docker-compose stop insecure
docker-compose stop secure
```

---

## 🔍 Probar las Demostraciones

### 🔴 Probar VULNERABILIDADES (puerto 8080):

```bash
# 1. Acceso básico
curl http://localhost:8080/

# 2. API key predecible ❌
curl http://localhost:8080/secure -H "x-api-key: changeme"
# Resultado: ¡ACCESO CONCEDIDO! (VULNERABLE)

# 3. Sin rate limiting ❌
for i in {1..100}; do
  curl -s http://localhost:8080/secure -H "x-api-key: changeme" &
done
# Todas pasan sin límite

# 4. Sin security headers ❌
curl -I http://localhost:8080/
# No verás X-Frame-Options, etc.
```

### 🟢 Probar SEGURIDAD (puerto 8443):

```bash
# 1. Obtener API key del .env
cat .env | grep API_KEY_SECRET

# 2. Acceso sin API key ❌ (debe fallar)
curl http://localhost:8443/secure
# Resultado: 401 Unauthorized ✅

# 3. Con API key correcta ✅
API_KEY="<copiar-del-.env>"
curl http://localhost:8443/secure -H "x-api-key: $API_KEY"
# Resultado: Acceso concedido con auditoría

# 4. Verificar security headers ✅
curl -I http://localhost:8443/
# Verás X-Frame-Options, X-Content-Type-Options, etc.

# 5. Rate limiting activo ✅
for i in {1..110}; do
  curl -s http://localhost:8443/health
done
# Después de ~100, empezarás a ver "Too many requests"
```

---

## 📊 Comparación Lado a Lado

Abre dos terminales:

**Terminal 1 (INSEGURO):**
```bash
# Logs del inseguro
docker-compose logs -f insecure
```

**Terminal 2 (SEGURO):**
```bash
# Logs del seguro
docker-compose logs -f secure
```

**Terminal 3 (Pruebas):**
```bash
# Ataca ambos al mismo tiempo
curl http://localhost:8080/secure -H "x-api-key: changeme"
curl http://localhost:8443/secure -H "x-api-key: wrong-key"
```

**Observa la diferencia en los logs:**
- INSEGURO: Poco detalle, sin estructura
- SEGURO: JSON estructurado, timestamps, eventos de seguridad

---

## 🎯 Para tu Demostración

### Escenario de Presentación:

1. **Levantar ambos servicios:**
   ```bash
   docker-compose up -d
   ```

2. **Mostrar que el inseguro es vulnerable:**
   ```bash
   curl http://localhost:8080/secure -H "x-api-key: changeme"
   # ❌ Éxito (malo)
   ```

3. **Mostrar que el seguro está protegido:**
   ```bash
   curl http://localhost:8443/secure
   # ✅ Rechazo (bueno)
   ```

4. **Mostrar logs en paralelo** (dos pantallas)

5. **Explicar las diferencias** usando [SECURITY_COMPARISON.md](SECURITY_COMPARISON.md)

---

## 🛠️ Troubleshooting

### Puerto ya en uso:
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8080

# Cambiar puertos en docker-compose.yml si es necesario
```

### Recrear contenedores:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ver logs de errores:
```bash
docker-compose logs
```

---

## 🧹 Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar también imágenes y volúmenes
docker-compose down -v --rmi all
```

---

## 📚 Archivos Relacionados

- [docker-compose.yml](docker-compose.yml) - Configuración de servicios
- [demo.sh](demo.sh) / [demo.bat](demo.bat) - Scripts interactivos
- [.env.example](.env.example) - Ejemplo de variables de entorno
- [SECURITY_COMPARISON.md](SECURITY_COMPARISON.md) - Análisis detallado

---

## ✅ Ventajas de Este Enfoque

1. ✅ **No necesitas VM en GCP** para la demo básica
2. ✅ **Todo corre localmente** en tu máquina
3. ✅ **Comparación lado a lado** instantánea
4. ✅ **Fácil de reiniciar** y probar múltiples veces
5. ✅ **Sin costos de cloud** para desarrollo
6. ✅ **Perfecto para presentaciones** en vivo

---

## 🎓 Para el Informe

Puedes incluir:

1. **Capturas de `docker-compose ps`** mostrando ambos servicios
2. **Comparación de curls** lado a lado
3. **Logs estructurados** vs básicos
4. **Diferencias en headers HTTP**
5. **Pruebas de rate limiting**

---

**¡Ahora puedes hacer toda la demostración sin salir de tu máquina! 🚀**
