# 🎨 Frontend Didáctico - ClouSecurity

## Descripción

Interface web interactiva que permite **comparar en tiempo real** las dos implementaciones de API:
- 🔴 **API Insegura** (puerto 8080)
- 🟢 **API Segura** (puerto 8443)

## 🚀 Acceso Rápido

```bash
# Levantar todo
docker-compose up -d

# Abrir en el navegador
http://localhost:3000
```

## 🎯 Características

### 1. Panel de Control
- **Estado en tiempo real** de ambas APIs
- Configuración de API key para el escenario seguro
- Indicadores visuales de disponibilidad

### 2. Pruebas Interactivas

Cada API tiene 5 pruebas diferentes:

#### 1️⃣ Endpoint Básico (GET /)
- Verifica la respuesta básica del servidor
- Compara tiempos de respuesta
- Muestra diferencias en los datos retornados

#### 2️⃣ Health Check (GET /health)
- Verifica el estado de salud del servicio
- Útil para monitoring

#### 3️⃣ Endpoint "Seguro" (GET /secure)
- **INSEGURO**: Demuestra vulnerabilidad con API key "changeme"
- **SEGURO**: Requiere API key robusta y rechaza accesos no autorizados

#### 4️⃣ Ataque de Fuerza Bruta
- **INSEGURO**: Procesa 100 requests sin límite (VULNERABLE ❌)
- **SEGURO**: Bloquea después de 100 requests/15min (PROTEGIDO ✅)

#### 5️⃣ Security Headers
- Compara los headers HTTP de seguridad
- Muestra diferencias entre configuración básica vs Helmet.js

### 3. Comparación Lado a Lado

Visualización paralela que permite:
- Ver las mismas pruebas en ambas APIs simultáneamente
- Identificar diferencias de comportamiento
- Entender el impacto de cada vulnerabilidad

### 4. Sección Educativa

Tres pestañas de contenido didáctico:

#### 📚 Teoría
- Principios CIA (Confidencialidad, Integridad, Disponibilidad)
- Fundamentos de seguridad en la nube
- Modelo de responsabilidad compartida

#### 🔬 Práctica
- Tabla comparativa de diferencias
- Ejemplos concretos de cada vulnerabilidad
- Impacto real de cada control

#### 💡 Recomendaciones
- Prioridades de seguridad (Alta/Media/Baja)
- Checklist de implementación
- Best practices para producción

## 🎨 Interfaz

```
┌─────────────────────────────────────────────────────┐
│  🔒 ClouSecurity - Demo Interactiva                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🎮 Panel de Control                                │
│  ┌──────────────┐ ┌──────────────┐                 │
│  │ 🔴 INSEGURO  │ │ 🟢 SEGURO    │                 │
│  │ ✅ Online    │ │ ✅ Online    │                 │
│  └──────────────┘ └──────────────┘                 │
│                                                     │
│  API Key Segura: [___________________________]     │
└─────────────────────────────────────────────────────┘

┌───────────────────┬────────────────────────────────┐
│  🔴 API INSEGURA  │  🟢 API SEGURA                 │
├───────────────────┼────────────────────────────────┤
│                   │                                │
│  [Test 1] GET /   │  [Test 1] GET /               │
│  └─> Resultado    │  └─> Resultado                │
│                   │                                │
│  [Test 2] Health  │  [Test 2] Health              │
│  [Test 3] Secure  │  [Test 3] Secure              │
│  [Test 4] Rate    │  [Test 4] Rate                │
│  [Test 5] Headers │  [Test 5] Headers             │
│                   │                                │
│  ❌ 10 Vulnerab.  │  ✅ 10 Controles              │
│  Score: 25/100    │  Score: 85/100                │
└───────────────────┴────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🎓 Sección Educativa                               │
│  [Teoría] [Práctica] [Recomendaciones]             │
│  ┌─────────────────────────────────────────────┐   │
│  │ Contenido educativo...                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🔧 Configuración

### Obtener API Key Segura

```bash
# Ver la API key generada
cat .env | grep API_KEY_SECRET

# Copiar y pegar en el campo "API Key Segura" del frontend
```

### Puertos Utilizados

- **3000**: Frontend (Nginx)
- **8080**: API Insegura
- **8443**: API Segura

## 📸 Para tu Presentación

### Capturas Recomendadas:

1. **Panel inicial** con ambas APIs online
2. **Prueba de vulnerabilidad** en API insegura (GET /secure con "changeme")
3. **Rechazo de seguridad** en API segura (sin credenciales)
4. **Comparación de rate limiting** (100 requests vs bloqueo)
5. **Diferencias en security headers**
6. **Scores finales** (25/100 vs 85/100)

### Demo en Vivo:

1. Abre el frontend: `http://localhost:3000`
2. Verifica que ambas APIs estén online (✅)
3. Prueba el endpoint inseguro: Click en "GET /secure" en API INSEGURA
   - ❌ Muestra cómo se acepta "changeme"
4. Prueba el endpoint seguro: Ingresa API key y click en "GET /secure" en API SEGURA
   - ✅ Muestra el rechazo primero, luego el acceso con key correcta
5. Ejecuta test de rate limiting en ambos
   - Observa las diferencias en tiempo real

## 🎯 Casos de Uso Educativos

### Para estudiantes:
- Entender vulnerabilidades comunes
- Ver impacto real de cada control
- Aprender mejores prácticas interactivamente

### Para profesores:
- Demostración visual de conceptos
- Comparación lado a lado
- Material de apoyo en las pestañas educativas

### Para profesionales:
- Referencia de implementación
- Checklist de seguridad
- Ejemplos de código seguros vs inseguros

## 🐛 Troubleshooting

### Frontend no carga:
```bash
# Verificar que Nginx esté corriendo
docker-compose ps frontend

# Ver logs
docker-compose logs frontend
```

### APIs no responden:
```bash
# Verificar estado
docker-compose ps

# Reiniciar servicios
docker-compose restart insecure secure
```

### CORS errors:
- Asegúrate de acceder via `http://localhost:3000` (no otra IP)
- Los CORS están configurados específicamente para localhost

## 📚 Archivos del Frontend

```
frontend/
├── index.html      # Estructura HTML
├── styles.css      # Estilos y responsive design
└── app.js          # Lógica de pruebas y comunicación con APIs
```

## 🚀 Extensiones Futuras

Ideas para mejorar el frontend:

- [ ] Gráficas de comparación de tiempos de respuesta
- [ ] Historial de pruebas ejecutadas
- [ ] Exportar reporte en PDF
- [ ] Modo oscuro
- [ ] Más pruebas (SQL injection, XSS, etc.)
- [ ] WebSocket para logs en tiempo real
- [ ] Dashboard de métricas

## 💡 Tips

1. **Orden de ejecución**: Primero ejecuta todas las pruebas del inseguro, luego del seguro
2. **API Key**: Guarda la key del .env antes de empezar
3. **Screenshots**: Usa las herramientas de desarrollador (F12) para ver headers completos
4. **Logs**: Mantén abierta una terminal con `docker-compose logs -f` para ver la actividad

---

**¡Disfruta de la demo interactiva! 🎉**
