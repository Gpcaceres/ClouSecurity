const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ VERSIÓN INSEGURA - Para demostración de vulnerabilidades
// Problema 1: API key hardcodeada con valor predecible
const API_KEY = process.env.API_KEY || 'changeme';

// Problema 2: Sin rate limiting ni protección contra ataques
app.use(express.json());

// Problema 2.5: CORS abierto sin restricciones (vulnerable)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  next();
});

// Problema 3: Sin validación de entrada ni sanitización
app.get('/', (req, res) => {
  res.json({ 
    message: 'CloudSecurity example app (INSECURE VERSION)', 
    host: os.hostname(),
    warning: '⚠️ Esta versión tiene vulnerabilidades intencionales para análisis'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ⚠️ VULNERABILIDAD CRÍTICA: Autenticación débil
// - API key predecible y compartida
// - Sin rotación de credenciales
// - Sin auditoría de accesos
app.get('/secure', (req, res) => {
  const key = req.header('x-api-key');
  if (!key || key !== API_KEY) {
    // Problema 4: Logging insuficiente (no registra timestamp, user-agent, etc.)
    console.warn('Unauthorized access attempt from', req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Problema 5: Expone datos sensibles sin cifrado adicional
  res.json({ 
    secret: 'datos-sensibles-de-ejemplo',
    timestamp: new Date().toISOString()
  });
});

// Problema 6: Sin manejo de errores centralizado
app.listen(PORT, () => {
  console.log(`[INSECURE] App listening on port ${PORT}`);
  console.log('⚠️  WARNING: Running in INSECURE mode for security analysis');
});
