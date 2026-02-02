// URLs de las APIs
const API_INSECURE = 'http://localhost:8080';
const API_SECURE = 'http://localhost:8443';

// Estado global
let secureApiKey = '';
let comparisonData = {};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkAPIsStatus();
    setupEventListeners();
    setInterval(checkAPIsStatus, 30000); // Check cada 30 segundos
});

function setupEventListeners() {
    const apiKeyInput = document.getElementById('secure-api-key');
    apiKeyInput.addEventListener('input', (e) => {
        secureApiKey = e.target.value;
    });
}

// Verificar estado de las APIs
async function checkAPIsStatus() {
    await checkAPIStatus('insecure', API_INSECURE);
    await checkAPIStatus('secure', API_SECURE);
}

async function checkAPIStatus(type, url) {
    const badge = document.getElementById(`badge-${type}`);
    try {
        const response = await fetch(`${url}/health`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            badge.textContent = '✅ Online';
            badge.className = 'status-badge online';
        } else {
            badge.textContent = '❌ Error';
            badge.className = 'status-badge offline';
        }
    } catch (error) {
        badge.textContent = '❌ Offline';
        badge.className = 'status-badge offline';
    }
}

// Test 1: Endpoint Básico
async function testBasic(type) {
    const url = type === 'insecure' ? API_INSECURE : API_SECURE;
    const resultDiv = document.getElementById(`result-basic-${type}`);
    
    showLoading(resultDiv);
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${url}/`, {
            method: 'GET',
            mode: 'cors'
        });
        const endTime = performance.now();
        const data = await response.json();
        
        comparisonData[`basic-${type}`] = {
            status: response.status,
            time: (endTime - startTime).toFixed(2),
            data: data
        };
        
        showResult(resultDiv, 'success', `
            <strong>✅ Respuesta exitosa</strong><br>
            Status: ${response.status}<br>
            Tiempo: ${(endTime - startTime).toFixed(2)}ms<br>
            <br>
            <strong>Datos:</strong><br>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `);
        
        updateComparison();
    } catch (error) {
        showResult(resultDiv, 'error', `
            <strong>❌ Error en la petición</strong><br>
            ${error.message}<br>
            <br>
            <small>Asegúrate de que el contenedor está corriendo: docker-compose ps</small>
        `);
    }
}

// Test 2: Health Check
async function testHealth(type) {
    const url = type === 'insecure' ? API_INSECURE : API_SECURE;
    const resultDiv = document.getElementById(`result-health-${type}`);
    
    showLoading(resultDiv);
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${url}/health`, {
            method: 'GET',
            mode: 'cors'
        });
        const endTime = performance.now();
        const data = await response.json();
        
        showResult(resultDiv, 'success', `
            <strong>✅ Health Check OK</strong><br>
            Status: ${response.status}<br>
            Tiempo: ${(endTime - startTime).toFixed(2)}ms<br>
            <br>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `);
    } catch (error) {
        showResult(resultDiv, 'error', `❌ Error: ${error.message}`);
    }
}

// Test 3: Endpoint Seguro
async function testSecure(type) {
    const url = type === 'insecure' ? API_INSECURE : API_SECURE;
    const resultDiv = document.getElementById(`result-secure-${type}`);
    const apiKey = type === 'insecure' ? 'changeme' : secureApiKey;
    
    if (type === 'secure' && !secureApiKey) {
        showResult(resultDiv, 'warning', `
            ⚠️ <strong>Ingresa la API Key del escenario seguro</strong><br>
            <br>
            Obtén la key ejecutando:<br>
            <code>cat .env | grep API_KEY_SECRET</code>
        `);
        return;
    }
    
    showLoading(resultDiv);
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${url}/secure`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'x-api-key': apiKey
            }
        });
        const endTime = performance.now();
        
        let message = '';
        let resultType = '';
        
        if (response.ok) {
            const data = await response.json();
            if (type === 'insecure') {
                resultType = 'error';
                message = `
                    <strong>❌ VULNERABLE - Acceso Concedido</strong><br>
                    <br>
                    El sistema aceptó la API key predecible "changeme"<br>
                    Esto permite a cualquiera acceder a datos sensibles.<br>
                    <br>
                    Status: ${response.status}<br>
                    Tiempo: ${(endTime - startTime).toFixed(2)}ms<br>
                    <br>
                    <strong>Datos expuestos:</strong><br>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                    <br>
                    <strong>🚨 Vulnerabilidad Crítica Demostrada</strong>
                `;
            } else {
                resultType = 'success';
                message = `
                    <strong>✅ SEGURO - Autenticación Exitosa</strong><br>
                    <br>
                    La API key robusta fue validada correctamente.<br>
                    El acceso fue registrado en los logs.<br>
                    <br>
                    Status: ${response.status}<br>
                    Tiempo: ${(endTime - startTime).toFixed(2)}ms<br>
                    <br>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            }
        } else {
            const errorData = await response.json();
            if (type === 'secure') {
                resultType = 'success';
                message = `
                    <strong>✅ SEGURO - Acceso Denegado</strong><br>
                    <br>
                    El sistema rechazó correctamente la petición sin credenciales válidas.<br>
                    <br>
                    Status: ${response.status}<br>
                    Error: ${errorData.error}<br>
                    <br>
                    <strong>✅ Control de Seguridad Funcionando</strong>
                `;
            } else {
                resultType = 'error';
                message = `❌ Error: ${response.status} - ${errorData.error}`;
            }
        }
        
        showResult(resultDiv, resultType, message);
    } catch (error) {
        showResult(resultDiv, 'error', `❌ Error: ${error.message}`);
    }
}

// Test 4: Rate Limiting
async function testRateLimit(type) {
    const url = type === 'insecure' ? API_INSECURE : API_SECURE;
    const resultDiv = document.getElementById(`result-ratelimit-${type}`);
    const button = event.target;
    
    button.disabled = true;
    
    showLoading(resultDiv);
    
    const totalRequests = type === 'insecure' ? 100 : 110;
    let successful = 0;
    let blocked = 0;
    let errors = 0;
    
    const progressHTML = `
        <strong>🔄 Enviando ${totalRequests} requests...</strong><br>
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill-${type}" style="width: 0%">0%</div>
        </div>
        <div id="rate-limit-status-${type}"></div>
    `;
    
    showResult(resultDiv, 'warning', progressHTML);
    
    try {
        for (let i = 0; i < totalRequests; i++) {
            try {
                const response = await fetch(`${url}/health`, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                if (response.ok) {
                    successful++;
                } else if (response.status === 429) {
                    blocked++;
                } else {
                    errors++;
                }
            } catch (error) {
                errors++;
            }
            
            // Actualizar progreso
            const progress = ((i + 1) / totalRequests * 100).toFixed(0);
            const progressFill = document.getElementById(`progress-fill-${type}`);
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
                progressFill.textContent = `${progress}%`;
            }
            
            // Pequeña pausa para no saturar
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        let resultType = '';
        let message = '';
        
        if (type === 'insecure') {
            resultType = 'error';
            message = `
                <strong>❌ VULNERABLE - Sin Rate Limiting</strong><br>
                <br>
                <strong>Resultados del ataque:</strong><br>
                ✅ Exitosas: ${successful}<br>
                ❌ Bloqueadas: ${blocked}<br>
                ⚠️ Errores: ${errors}<br>
                <br>
                <strong>🚨 El servidor procesó TODAS las peticiones sin límite.</strong><br>
                Un atacante podría realizar:<br>
                • Ataques de fuerza bruta<br>
                • Agotamiento de recursos (DoS)<br>
                • Minería de datos sin restricción<br>
            `;
        } else {
            resultType = blocked > 0 ? 'success' : 'warning';
            message = `
                <strong>${blocked > 0 ? '✅ SEGURO - Rate Limiting Activo' : '⚠️ Rate Limiting No Detectado'}</strong><br>
                <br>
                <strong>Resultados de la prueba:</strong><br>
                ✅ Exitosas: ${successful}<br>
                🚫 Bloqueadas: ${blocked}<br>
                ⚠️ Errores: ${errors}<br>
                <br>
                ${blocked > 0 ? `
                    <strong>✅ El sistema limitó las peticiones correctamente.</strong><br>
                    Límite configurado: 100 requests / 15 minutos<br>
                    <br>
                    Protección contra:<br>
                    • Ataques de fuerza bruta<br>
                    • Abuso de recursos<br>
                    • Scraping masivo<br>
                ` : `
                    Es posible que necesites más requests o esperar el reset de la ventana.
                `}
            `;
        }
        
        showResult(resultDiv, resultType, message);
    } catch (error) {
        showResult(resultDiv, 'error', `❌ Error: ${error.message}`);
    } finally {
        button.disabled = false;
    }
}

// Test 5: Security Headers
async function testHeaders(type) {
    const url = type === 'insecure' ? API_INSECURE : API_SECURE;
    const resultDiv = document.getElementById(`result-headers-${type}`);
    
    showLoading(resultDiv);
    
    try {
        const response = await fetch(`${url}/`, {
            method: 'GET',
            mode: 'cors'
        });
        
        const securityHeaders = [
            'x-powered-by',
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'strict-transport-security',
            'content-security-policy',
            'x-dns-prefetch-control'
        ];
        
        let headersFound = 0;
        let headersList = '<strong>Headers de Seguridad:</strong><br><br>';
        
        securityHeaders.forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                headersFound++;
                headersList += `✅ <code>${header}</code>: ${value}<br>`;
            } else {
                headersList += `❌ <code>${header}</code>: No presente<br>`;
            }
        });
        
        const percentage = (headersFound / securityHeaders.length * 100).toFixed(0);
        let resultType = '';
        let message = '';
        
        if (type === 'insecure') {
            resultType = headersFound < 3 ? 'error' : 'warning';
            message = `
                <strong>❌ Headers de Seguridad Insuficientes</strong><br>
                <br>
                ${headersList}<br>
                <strong>Score: ${headersFound}/${securityHeaders.length} (${percentage}%)</strong><br>
                <br>
                <strong>🚨 Vulnerabilidades por headers faltantes:</strong><br>
                • Clickjacking (sin X-Frame-Options)<br>
                • XSS (sin Content-Security-Policy)<br>
                • MIME sniffing (sin X-Content-Type-Options)<br>
                • Information disclosure (X-Powered-By presente)<br>
            `;
        } else {
            resultType = headersFound > 4 ? 'success' : 'warning';
            message = `
                <strong>${headersFound > 4 ? '✅' : '⚠️'} Headers de Seguridad</strong><br>
                <br>
                ${headersList}<br>
                <strong>Score: ${headersFound}/${securityHeaders.length} (${percentage}%)</strong><br>
                <br>
                ${headersFound > 4 ? `
                    <strong>✅ Helmet.js está funcionando correctamente</strong><br>
                    Los headers proporcionan protección contra:<br>
                    • Clickjacking<br>
                    • XSS<br>
                    • MIME sniffing<br>
                    • Information disclosure<br>
                ` : 'Considera añadir más headers de seguridad'}
            `;
        }
        
        showResult(resultDiv, resultType, message);
    } catch (error) {
        showResult(resultDiv, 'error', `❌ Error: ${error.message}`);
    }
}

// Actualizar sección de comparación
function updateComparison() {
    const comparisonDiv = document.getElementById('comparison-results');
    
    if (Object.keys(comparisonData).length === 0) {
        comparisonDiv.innerHTML = '<p>Ejecuta las pruebas para ver la comparación...</p>';
        return;
    }
    
    let html = '<div class="comparison-grid">';
    
    // Aquí puedes agregar gráficas y comparaciones más detalladas
    html += '<p>Comparaciones en desarrollo...</p>';
    
    html += '</div>';
    comparisonDiv.innerHTML = html;
}

// Funciones de utilidad
function showLoading(element) {
    element.className = 'result show warning';
    element.innerHTML = '<span class="loading"></span> Cargando...';
}

function showResult(element, type, message) {
    element.className = `result show ${type}`;
    element.innerHTML = message;
}

// Tabs
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Activar el botón correspondiente
    event.target.classList.add('active');
}
