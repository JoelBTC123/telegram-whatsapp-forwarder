const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generando sesión de WhatsApp...');
console.log('📱 Escanea el QR una vez y la sesión se guardará automáticamente');
console.log('');

// Crear cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'telegram-whatsapp-bot',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: false, // Mostrar ventana para escanear
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Evento QR
client.on('qr', (qr) => {
    console.log('📱 Escanea este código QR:');
    qrcode.generate(qr, { small: true });
    console.log('');
});

// Evento ready
client.on('ready', () => {
    console.log('✅ WhatsApp conectado correctamente!');
    console.log('💾 Sesión guardada en ./.wwebjs_auth/');
    console.log('');
    console.log('📋 Para subir a Railway:');
    console.log('1. Comprime la carpeta .wwebjs_auth/');
    console.log('2. Sube el archivo a Railway');
    console.log('3. El bot se conectará automáticamente');
    console.log('');
    
    // Cerrar después de 5 segundos
    setTimeout(() => {
        console.log('👋 Cerrando...');
        client.destroy();
        process.exit(0);
    }, 5000);
});

// Evento auth_failure
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    process.exit(1);
});

// Evento disconnected
client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp desconectado:', reason);
    process.exit(0);
});

// Inicializar
client.initialize();

console.log('🚀 Iniciando...');
console.log('📱 Se abrirá una ventana de Chrome para escanear el QR');
console.log(''); 