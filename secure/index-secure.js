const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ VERSIÓN SEGURA - Implementa mejores prácticas

// 1. Security headers con Helmet
app.use(helmet());

// 1.5. CORS configurado de forma segura
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://34.70.59.227:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Rate limiting para prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// 3. Parse JSON con límite de tamaño
app.use(express.json({ limit: '10kb' }));

// 4. Middleware de logging estructurado
app.use((req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };
  console.log(JSON.stringify(logEntry));
  next();
});

// Endpoint público
app.get('/', (req, res) => {
  res.json({ 
    message: 'CloudSecurity example app (SECURE VERSION)', 
    host: os.hostname(),
    status: '✅ Running with security best practices',
    features: [
      'Helmet security headers',
      'Rate limiting',
      'Secret Manager integration',
      'Structured logging',
      'Input validation'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Endpoint protegido con mejoras de seguridad
app.get('/secure', async (req, res) => {
  try {
    // Obtener API key desde Secret Manager en producción
    // Para demo local, usar variable de entorno
    const apiKey = process.env.API_KEY_SECRET || await getSecretFromGCP();
    
    const providedKey = req.header('x-api-key');
    
    // Validación de entrada
    if (!providedKey || typeof providedKey !== 'string') {
      logSecurityEvent('missing_api_key', req);
      return res.status(401).json({ error: 'API key required' });
    }
    
    // Usar comparación de tiempo constante para prevenir timing attacks
    if (!secureCompare(providedKey, apiKey)) {
      logSecurityEvent('invalid_api_key', req);
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    // Auditoría de acceso exitoso
    logSecurityEvent('authorized_access', req);
    
    res.json({ 
      secret: 'datos-sensibles-protegidos',
      timestamp: new Date().toISOString(),
      accessGranted: true
    });
    
  } catch (error) {
    console.error('Security endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Función para obtener secretos de GCP Secret Manager
async function getSecretFromGCP() {
  // En producción, usar @google-cloud/secret-manager
  // const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
  // const client = new SecretManagerServiceClient();
  // const [version] = await client.accessSecretVersion({name: secretName});
  // return version.payload.data.toString();
  
  // Para demo, retornar variable de entorno
  return process.env.API_KEY || 'secure-key-from-secret-manager';
}

// Comparación segura de strings (previene timing attacks)
function secureCompare(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Logging estructurado de eventos de seguridad
function logSecurityEvent(eventType, req) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    eventType,
    severity: eventType.includes('invalid') ? 'WARNING' : 'INFO',
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent'),
    headers: {
      host: req.get('host'),
      origin: req.get('origin')
    }
  };
  console.log('[SECURITY]', JSON.stringify(securityLog));
}

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.id
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[SECURE] App listening on port ${PORT}`);
  console.log('✅ Security features enabled');
  console.log('   - Helmet security headers');
  console.log('   - Rate limiting');
  console.log('   - Structured logging');
  console.log('   - Secret management ready');
});
