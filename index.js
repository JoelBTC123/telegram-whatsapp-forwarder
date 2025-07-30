const TelegramBot = require('node-telegram-bot-api');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');
const config = require('./config');

console.log('🚀 Iniciando bot de reenvío Telegram → WhatsApp...');

// Mostrar grupos configurados
console.log('📋 Grupos configurados:');
Object.entries(config.GROUPS).forEach(([key, group]) => {
    console.log(`   📱 ${group.telegram_name} → ${group.whatsapp_name}`);
});

// Crear servidor HTTP para healthcheck y QR
let qrCodeData = null;
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot funcionando correctamente! ✅');
    } else if (req.url === '/qr') {
        if (qrCodeData) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>QR Code WhatsApp</title>
                    <meta charset="utf-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            background: #f0f0f0; 
                            padding: 20px;
                        }
                        .container { 
                            background: white; 
                            padding: 30px; 
                            border-radius: 10px; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            max-width: 400px;
                            margin: 0 auto;
                        }
                        h1 { color: #25D366; margin-bottom: 20px; }
                        .qr-code { 
                            font-family: monospace; 
                            font-size: 8px; 
                            line-height: 8px;
                            background: white;
                            padding: 20px;
                            border: 2px solid #25D366;
                            border-radius: 10px;
                            display: inline-block;
                        }
                        .instructions { 
                            margin-top: 20px; 
                            color: #666; 
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>📱 Escanea el QR</h1>
                        <div class="qr-code">
                            <pre>${qrCodeData}</pre>
                        </div>
                        <div class="instructions">
                            <p>1. Abre WhatsApp en tu teléfono</p>
                            <p>2. Ve a Configuración → WhatsApp Web</p>
                            <p>3. Escanea este código QR</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('QR no disponible aún');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página no encontrada');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor web iniciado en puerto ${PORT}`);
    console.log(`📊 Healthcheck disponible en: http://0.0.0.0:${PORT}`);
    console.log(`🌍 URL pública: https://telegram-whatsapp-bot-production.up.railway.app`);
    console.log('');
});

// Crear bot de Telegram
const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, config.BOT_CONFIG);

// Variables globales
let whatsappReady = false;
let whatsappGroups = {};

// Función para descargar imagen
async function downloadImage(fileId) {
    try {
        const file = await telegramBot.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        return new Promise((resolve, reject) => {
            https.get(imageUrl, (response) => {
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        });
    } catch (error) {
        console.error('❌ Error descargando imagen:', error.message);
        throw error;
    }
}

// Función para encontrar la clave del grupo
function findGroupKey(chatTitle) {
    return Object.keys(config.GROUPS).find(key => 
        config.GROUPS[key].telegram_name === chatTitle
    );
}

// Función para configurar grupos de WhatsApp
async function configureWhatsAppGroups() {
    try {
        console.log('📱 Configuración automática de grupos activada');
        
        for (const [key, groupConfig] of Object.entries(config.GROUPS)) {
            try {
                const chat = await whatsappClient.getChatById(groupConfig.whatsapp_id);
                whatsappGroups[key] = {
                    id: groupConfig.whatsapp_id,
                    name: groupConfig.whatsapp_name,
                    chat: chat
                };
                console.log(`✅ Grupo configurado: ${groupConfig.whatsapp_name}`);
            } catch (error) {
                console.error(`❌ Error configurando grupo ${groupConfig.whatsapp_name}:`, error.message);
            }
        }
        
        console.log(`🎉 ${Object.keys(whatsappGroups).length} grupos configurados correctamente`);
    } catch (error) {
        console.error('❌ Error en configuración automática:', error.message);
    }
}

// Función para reenviar a WhatsApp
async function forwardToWhatsApp(telegramPost, groupKey) {
    try {
        const whatsappGroup = whatsappGroups[groupKey];
        const groupConfig = config.GROUPS[groupKey];
        
        if (!whatsappGroup) {
            console.log(`❌ Grupo WhatsApp no encontrado para: ${groupConfig.telegram_name}`);
            return;
        }

        // Construir mensaje
        let message = '';
        if (telegramPost.text) {
            message = telegramPost.text;
        } else if (telegramPost.caption) {
            message = telegramPost.caption;
        }

        console.log(`📤 Reenviando mensaje a ${whatsappGroup.name}...`);
        console.log(`   📝 Texto: ${message.substring(0, 50)}...`);

        // Verificar si hay foto
        if (telegramPost.photo && telegramPost.photo.length > 0) {
            try {
                console.log('   📸 Descargando imagen...');
                const imageBuffer = await downloadImage(telegramPost.photo[telegramPost.photo.length - 1].file_id);
                const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                
                await whatsappClient.sendMessage(whatsappGroup.id, media, { caption: message });
                console.log(`   ✅ Imagen con texto reenviada a ${whatsappGroup.name} exitosamente`);
                console.log(`   📝 Texto enviado: ${message.substring(0, 50)}...`);
            } catch (error) {
                console.error('   ❌ Error enviando imagen:', error.message);
                // Intentar enviar solo texto si falla la imagen
                if (message) {
                    await whatsappClient.sendMessage(whatsappGroup.id, message);
                    console.log(`   ✅ Texto reenviado a ${whatsappGroup.name} exitosamente`);
                }
            }
        } else if (message) {
            // Solo texto
            await whatsappClient.sendMessage(whatsappGroup.id, message);
            console.log(`   ✅ Texto reenviado a ${whatsappGroup.name} exitosamente`);
        } else {
            console.log('   ⚠️ No se encontró texto ni imagen para reenviar');
        }
    } catch (error) {
        console.error('❌ Error reenviando mensaje:', error.message);
    }
}

// Configurar escucha de Telegram
function setupTelegramListener() {
    console.log('📢 Configurando escucha de mensajes del grupo...');

    // Escuchar mensajes normales
    telegramBot.on('message', async (message) => {
        console.log(`📨 Mensaje recibido de: ${message.chat.title || message.chat.first_name}`);
        
        if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
            const groupKey = findGroupKey(message.chat.title);
            if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
                console.log(`✅ Grupo configurado detectado: ${message.chat.title}`);
                await forwardToWhatsApp(message, groupKey);
            } else {
                console.log(`⚠️ Grupo no configurado o WhatsApp no listo: ${message.chat.title}`);
            }
        } else {
            console.log(`📱 Mensaje privado de: ${message.chat.first_name}`);
        }
    });

    // Escuchar posts de canal (para grupos que se comportan como canales)
    telegramBot.on('channel_post', async (post) => {
        console.log(`📢 Post de canal recibido de: ${post.chat.title}`);
        
        const groupKey = findGroupKey(post.chat.title);
        if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
            console.log(`✅ Grupo configurado detectado en channel_post: ${post.chat.title}`);
            await forwardToWhatsApp(post, groupKey);
        } else {
            console.log(`⚠️ Grupo no configurado o WhatsApp no listo: ${post.chat.title}`);
        }
    });

    // Escuchar posts editados de canal
    telegramBot.on('edited_channel_post', async (post) => {
        console.log(`✏️ Post editado de canal recibido de: ${post.chat.title}`);
        
        const groupKey = findGroupKey(post.chat.title);
        if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
            console.log(`✅ Grupo configurado detectado en edited_channel_post: ${post.chat.title}`);
            await forwardToWhatsApp(post, groupKey);
        } else {
            console.log(`⚠️ Grupo no configurado o WhatsApp no listo: ${post.chat.title}`);
        }
    });

    console.log('✅ Escucha de Telegram configurada');
}

// Conectar bot de Telegram
telegramBot.getMe().then((botInfo) => {
    console.log('✅ Bot de Telegram conectado');
    console.log(`👤 Nombre: ${botInfo.first_name}`);
    console.log(`🔗 Username: ${botInfo.username}`);
    console.log('');
    
    setupTelegramListener();
}).catch((error) => {
    console.error('❌ Error conectando bot de Telegram:', error.message);
    process.exit(1);
});

// Configurar WhatsApp
console.log('📱 Configurando WhatsApp...');

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
            '--disable-features=VizDisplayCompositor'
        ]
    }
});

// Evento QR
whatsappClient.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
    qrCodeData = qr; // Guardar QR para mostrar en web
    console.log('');
    console.log('🌐 QR Code disponible en: /qr');
    console.log('📱 Abre tu navegador y ve a la URL del bot + /qr');
    console.log('');
});

// Evento ready
whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp conectado correctamente!');
    whatsappReady = true;
    
    // Configurar grupos automáticamente
    await configureWhatsAppGroups();
    
    console.log('🎉 Bot iniciado correctamente!');
    console.log('📱 Escanea el código QR que aparecerá arriba');
    console.log('✅ Los grupos se configurarán automáticamente');
});

// Evento auth_failure
whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación de WhatsApp:', msg);
});

// Evento disconnected
whatsappClient.on('disconnected', (reason) => {
    console.log('📱 WhatsApp desconectado:', reason);
    whatsappReady = false;
});

// Inicializar WhatsApp
whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
    // No salir del proceso, solo loggear el error
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error.message);
    // No salir del proceso
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    // No salir del proceso
}); 