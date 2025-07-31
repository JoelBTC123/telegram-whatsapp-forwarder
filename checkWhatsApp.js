const { Client, LocalAuth } = require('whatsapp-web.js');

console.log('🔍 Verificando estado de WhatsApp Web...');

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        clientId: 'telegram-whatsapp-bot',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-field-trial-config',
            '--disable-ipc-flooding-protection',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--safebrowsing-disable-auto-update',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor,VizHitTestSurfaceLayer'
        ],
        timeout: 60000,
        protocolTimeout: 60000
    }
});

whatsappClient.on('qr', (qr) => {
    console.log('📱 QR generado - Necesitas escanear');
    process.exit(1);
});

whatsappClient.on('ready', async () => {
    try {
        const info = await whatsappClient.info;
        console.log('✅ WhatsApp conectado correctamente!');
        console.log(`📱 Usuario: ${info.pushname || 'Usuario'}`);
        console.log(`📱 Número: ${info.wid.user}`);
        console.log(`📱 Plataforma: ${info.platform}`);
        
        // Verificar grupos
        const chats = await whatsappClient.getChats();
        console.log(`📱 Total de chats: ${chats.length}`);
        
        const groups = chats.filter(chat => chat.isGroup);
        console.log(`📱 Total de grupos: ${groups.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error verificando WhatsApp:', error.message);
        process.exit(1);
    }
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    process.exit(1);
});

whatsappClient.on('disconnected', (reason) => {
    console.log('📱 WhatsApp desconectado:', reason);
    process.exit(1);
});

// Inicializar con timeout
setTimeout(() => {
    console.log('⏰ Timeout - No se pudo conectar en 60 segundos');
    process.exit(1);
}, 60000);

whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
    process.exit(1);
}); 