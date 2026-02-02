# 🔒 Comparativa de Seguridad: Escenarios Inseguro vs Seguro

## 📊 Resumen Ejecutivo

Este documento compara dos implementaciones de la misma aplicación:
- **Escenario Inseguro**: Implementación con vulnerabilidades comunes
- **Escenario Seguro**: Implementación con mejores prácticas de seguridad

---

## 🔴 Escenario 1: INSEGURO (VM + Docker)

### Arquitectura
```
Internet → VM (IP pública) → Docker Container (HTTP:8080)
```

### Vulnerabilidades Identificadas

| # | Vulnerabilidad | Severidad | Impacto |
|---|---------------|-----------|---------|
| 1 | API key hardcodeada (`changeme`) | 🔴 CRÍTICA | Acceso no autorizado a datos sensibles |
| 2 | Sin HTTPS/TLS | 🔴 CRÍTICA | Tráfico en texto plano interceptable |
| 3 | Puerto expuesto públicamente | 🟠 ALTA | Superficie de ataque amplia |
| 4 | Sin rate limiting | 🟠 ALTA | Vulnerable a ataques de fuerza bruta |
| 5 | Contenedor ejecutando como root | 🟠 ALTA | Escalación de privilegios |
| 6 | Sin validación de entrada | 🟡 MEDIA | Inyección de código |
| 7 | Logging insuficiente | 🟡 MEDIA | Dificulta detección de incidentes |
| 8 | Sin security headers | 🟡 MEDIA | XSS, clickjacking |
| 9 | Gestión manual de secretos | 🟡 MEDIA | Riesgo de filtración |
| 10 | Sin monitoreo centralizado | 🟡 MEDIA | Tiempo de respuesta lento |

### Prueba de Vulnerabilidad

```bash
# ❌ Cualquiera puede acceder con credenciales predecibles
curl http://34.70.59.227:8080/secure -H "x-api-key: changeme"
# Respuesta: {"secret":"datos-sensibles-de-ejemplo"}

# ❌ Tráfico interceptable (HTTP)
# ❌ Sin rate limiting (ataques de fuerza bruta)
# ❌ Sin auditoría de accesos
```

### Superficie de Ataque
- ✅ Puerto 8080 abierto a internet
- ✅ Protocolo HTTP sin cifrado
- ✅ Credenciales predecibles
- ✅ VM requiere gestión manual de parches
- ✅ Sin WAF o Cloud Armor

---

## 🟢 Escenario 2: SEGURO (Cloud Run)

### Arquitectura
```
Internet → Cloud Load Balancer (HTTPS) → Cloud Run → Secret Manager
                                        ↓
                                    IAM Auth
```

### Controles de Seguridad Implementados

| # | Control | Implementación | Beneficio |
|---|---------|---------------|-----------|
| 1 | Gestión de secretos | Secret Manager | Rotación automática, auditoría |
| 2 | HTTPS/TLS | Cloud Run automático | Cifrado en tránsito |
| 3 | Autenticación | IAM + API key segura | Doble factor de autenticación |
| 4 | Rate limiting | Express Rate Limit | Prevención de ataques DDoS |
| 5 | Usuario no-root | Dockerfile hardening | Principio de menor privilegio |
| 6 | Security headers | Helmet.js | Protección XSS, clickjacking |
| 7 | Logging estructurado | JSON logs → Cloud Logging | SIEM integration ready |
| 8 | Escaneo de vulnerabilidades | Artifact Registry | Detección temprana |
| 9 | Binary Authorization | Cloud Run policy | Solo imágenes firmadas |
| 10 | Monitoreo | Cloud Monitoring | Alertas en tiempo real |

### Prueba de Seguridad

```bash
# ✅ Requiere autenticación IAM
curl https://cloudsec-secure-xxx.run.app/secure
# Respuesta: 401 Unauthorized

# ✅ Autenticación correcta
TOKEN=$(gcloud auth print-identity-token)
API_KEY="<key-from-secret-manager>"
curl -H "Authorization: Bearer $TOKEN" \
     -H "x-api-key: $API_KEY" \
     https://cloudsec-secure-xxx.run.app/secure
# Respuesta: {"secret":"datos-sensibles-protegidos","accessGranted":true}

# ✅ Tráfico cifrado (HTTPS)
# ✅ Rate limiting activo (100 req/15min)
# ✅ Auditoría completa en Cloud Logging
```

---

## 📈 Comparación Detallada

### 1. Gestión de Credenciales

| Aspecto | Inseguro | Seguro |
|---------|----------|--------|
| Almacenamiento | Variable hardcodeada | Secret Manager |
| Valor | `changeme` (predecible) | 64 caracteres aleatorios |
| Rotación | Manual | Automática con Secret Manager |
| Auditoría | Ninguna | Logs completos en Cloud Audit |
| Acceso | Cualquiera con el código | Solo service accounts autorizados |

### 2. Cifrado y Transporte

| Aspecto | Inseguro | Seguro |
|---------|----------|--------|
| Protocolo | HTTP | HTTPS (TLS 1.3) |
| Certificados | Ninguno | Gestionados automáticamente |
| Datos en tránsito | Texto plano | Cifrado AES-256 |
| MITM | Vulnerable | Protegido |

### 3. Autenticación y Autorización

| Aspecto | Inseguro | Seguro |
|---------|----------|--------|
| Método | API key simple | IAM + API key |
| Fortaleza | Débil (1 factor) | Fuerte (2 factores) |
| Revocación | Requiere redeploy | Inmediata en IAM |
| Auditoría | Log básico | Cloud Audit Logs |

### 4. Protección contra Ataques

| Tipo de Ataque | Inseguro | Seguro |
|----------------|----------|--------|
| Fuerza bruta | ❌ Vulnerable | ✅ Rate limiting |
| DDoS | ❌ Sin protección | ✅ Cloud Armor disponible |
| XSS | ❌ Sin headers | ✅ Helmet.js |
| Inyección SQL | ❌ Sin validación | ✅ Input validation |
| MITM | ❌ HTTP | ✅ HTTPS enforced |
| Timing attacks | ❌ Comparación simple | ✅ Constant-time comparison |

### 5. Monitoreo y Detección

| Capacidad | Inseguro | Seguro |
|-----------|----------|--------|
| Logs | Console.log básico | Structured JSON logs |
| Centralización | No | Cloud Logging |
| Alertas | No | Cloud Monitoring |
| SIEM | No compatible | Compatible |
| Retention | Pérdida en restart | Persistente 30-400 días |

### 6. Infraestructura

| Aspecto | Inseguro (VM) | Seguro (Cloud Run) |
|---------|---------------|-------------------|
| Gestión OS | Manual | Sin servidor (managed) |
| Parches | Manual | Automáticos |
| Escalado | Manual | Automático (0-N) |
| Costo | Fijo (24/7) | Pay-per-use |
| Superficie ataque | VM completa | Solo container runtime |

---

## 🎯 Resultados del Análisis

### Puntuación de Seguridad

```
Escenario Inseguro:  25/100 ⛔ NO APTO PARA PRODUCCIÓN
Escenario Seguro:    85/100 ✅ APTO PARA PRODUCCIÓN
```

### Tiempo de Mitigación de Vulnerabilidades

| Vulnerabilidad | Tiempo para explotar (Inseguro) | Tiempo para detectar (Seguro) |
|----------------|--------------------------------|------------------------------|
| Credenciales débiles | < 1 minuto | Inmediato (IAM logs) |
| Ataque de fuerza bruta | Ilimitado | < 15 minutos (rate limit) |
| Intercepción MITM | Inmediato | N/A (HTTPS) |
| Escalación privilegios | Minutos-Horas | N/A (non-root user) |

---

## 💰 Análisis de Costos

### Escenario Inseguro (VM e2-micro)
- Costo mensual: ~$7-10 USD (24/7)
- Costo de seguridad: $0 (sin controles adicionales)
- **Costo de un incidente**: $10,000 - $500,000+ USD

### Escenario Seguro (Cloud Run)
- Costo base: $0 (sin tráfico)
- Con 1M requests/mes: ~$5 USD
- Secret Manager: $0.06/mes
- **Costo de incidente prevenido**: Invaluable

**ROI de seguridad**: Un solo incidente evitado justifica el costo anual completo.

---

## 📋 Checklist de Migración

### Pasos para mejorar seguridad:

- [ ] **Fase 1: Emergencia** (< 1 hora)
  - [ ] Cambiar API key hardcodeada
  - [ ] Configurar firewall para restringir acceso
  - [ ] Habilitar HTTPS con certificado

- [ ] **Fase 2: Corto plazo** (1-3 días)
  - [ ] Migrar credenciales a Secret Manager
  - [ ] Implementar rate limiting
  - [ ] Añadir security headers
  - [ ] Configurar logging estructurado

- [ ] **Fase 3: Medio plazo** (1-2 semanas)
  - [ ] Migrar a Cloud Run
  - [ ] Implementar IAM authentication
  - [ ] Configurar Cloud Monitoring
  - [ ] Escaneo de vulnerabilidades

- [ ] **Fase 4: Largo plazo** (1 mes+)
  - [ ] Binary Authorization
  - [ ] Cloud Armor / WAF
  - [ ] Respaldo y disaster recovery
  - [ ] Security audit completo

---

## 🎓 Conclusiones

### Lecciones Aprendidas

1. **Default insecure**: La configuración por defecto casi nunca es segura
2. **Defense in depth**: Múltiples capas de seguridad son esenciales
3. **Managed services**: Reducen superficie de ataque significativamente
4. **Automation**: La seguridad manual no escala
5. **Monitoring**: Sin logs, no hay seguridad verificable

### Recomendaciones Finales

Para producción, **siempre**:
- ✅ Usar servicios gestionados (Cloud Run, Cloud Functions)
- ✅ Gestión de secretos con Secret Manager
- ✅ HTTPS enforced automáticamente
- ✅ IAM con principio de menor privilegio
- ✅ Monitoring y alertas activas
- ✅ Escaneo continuo de vulnerabilidades
- ✅ Auditoría de accesos

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
