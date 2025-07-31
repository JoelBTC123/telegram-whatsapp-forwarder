const http = require('http');

// Configuración del monitor
const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:8080';
const CHECK_INTERVAL = 60000; // 1 minuto
const MAX_FAILURES = 3; // Máximo 3 fallos antes de reiniciar

let failureCount = 0;

function checkHealth() {
    const req = http.get(HEALTH_CHECK_URL, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Health check exitoso');
            failureCount = 0; // Resetear contador de fallos
        } else {
            console.log(`⚠️ Health check falló con status: ${res.statusCode}`);
            failureCount++;
        }
    });

    req.on('error', (error) => {
        console.log(`❌ Error en health check: ${error.message}`);
        failureCount++;
    });

    req.setTimeout(10000, () => {
        console.log('⏰ Timeout en health check');
        req.destroy();
        failureCount++;
    });

    req.on('close', () => {
        if (failureCount >= MAX_FAILURES) {
            console.log('🔄 Demasiados fallos consecutivos, reiniciando bot...');
            process.exit(1); // Esto hará que Railway reinicie el contenedor
        }
    });
}

// Iniciar monitoreo
console.log('🔍 Iniciando monitor de salud del bot...');
console.log(`📊 URL de health check: ${HEALTH_CHECK_URL}`);
console.log(`⏱️ Intervalo de verificación: ${CHECK_INTERVAL / 1000} segundos`);
console.log(`🚨 Máximo fallos antes de reinicio: ${MAX_FAILURES}`);

setInterval(checkHealth, CHECK_INTERVAL);

// Verificación inicial
setTimeout(checkHealth, 10000); 