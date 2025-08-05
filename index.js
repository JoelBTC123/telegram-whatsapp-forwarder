const TelegramBot = require('node-telegram-bot-api');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const https = require('https');
const http = require('http');
const config = require('./config');

// Token del bot de Telegram (fowardtradify_bot)
const TELEGRAM_TOKEN = '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50';

// ID del usuario de Telegram para enviar el QR
const TELEGRAM_USER_ID = '811637105'; // ID numérico de Telegram

console.log('🚀 Iniciando bot de reenvío Telegram → WhatsApp...');

// Verificar token que se está usando
console.log(`🔑 Token que se está usando: ${TELEGRAM_TOKEN.substring(0, 20)}...`);
console.log('');

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

// Crear bot de Telegram con configuración mejorada
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, {
    ...config.BOT_CONFIG,
    polling: {
        ...config.BOT_CONFIG.polling,
        timeout: 30,
        limit: 100,
        retryTimeout: 10000,
        autoStart: false
    }
});

// Variables globales
let whatsappReady = false;
let whatsappGroups = {};
let announcementsGroup = null; // Grupo de anuncios de WhatsApp
let alternativeGroup = null; // Grupo alternativo de anuncios

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

// Función para convertir formato de Telegram a HTML de WhatsApp
function convertTelegramFormatToWhatsApp(text, entities) {
    if (!entities || entities.length === 0) {
        return text;
    }
    
    // Ordenar entidades por posición de inicio (descendente para no afectar índices)
    const sortedEntities = [...entities].sort((a, b) => b.offset - a.offset);
    
    let formattedText = text;
    
    for (const entity of sortedEntities) {
        const start = entity.offset;
        const end = entity.offset + entity.length;
        const substring = text.substring(start, end);
        
        let formattedSubstring = substring;
        
        switch (entity.type) {
            case 'bold':
                formattedSubstring = `*${substring}*`;
                break;
            case 'italic':
                formattedSubstring = `_${substring}_`;
                break;
            case 'code':
                formattedSubstring = `\`${substring}\``;
                break;
            case 'pre':
                formattedSubstring = `\`\`\`${substring}\`\`\``;
                break;
            case 'underline':
                formattedSubstring = `~${substring}~`;
                break;
            case 'strikethrough':
                formattedSubstring = `~${substring}~`;
                break;
            case 'text_link':
                formattedSubstring = `[${substring}](${entity.url})`;
                break;
            default:
                // Para otros tipos, mantener el texto sin formato
                break;
        }
        
        formattedText = formattedText.substring(0, start) + formattedSubstring + formattedText.substring(end);
    }
    
    return formattedText;
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
        
        // Configurar grupo de anuncios si está habilitado
        if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled) {
            try {
                const announcementsChat = await whatsappClient.getChatById(config.ANNOUNCEMENTS.destination_group.whatsapp_id);
                announcementsGroup = {
                    id: config.ANNOUNCEMENTS.destination_group.whatsapp_id,
                    name: config.ANNOUNCEMENTS.destination_group.whatsapp_name,
                    chat: announcementsChat
                };
                console.log(`✅ Grupo principal de anuncios configurado: ${config.ANNOUNCEMENTS.destination_group.whatsapp_name}`);
                
                // Configurar grupo alternativo si existe
                if (config.ANNOUNCEMENTS.alternative_group) {
                    const alternativeChat = await whatsappClient.getChatById(config.ANNOUNCEMENTS.alternative_group.whatsapp_id);
                    alternativeGroup = {
                        id: config.ANNOUNCEMENTS.alternative_group.whatsapp_id,
                        name: config.ANNOUNCEMENTS.alternative_group.whatsapp_name,
                        chat: alternativeChat
                    };
                    console.log(`✅ Grupo alternativo de anuncios configurado: ${config.ANNOUNCEMENTS.alternative_group.whatsapp_name}`);
                }
            } catch (error) {
                console.error(`❌ Error configurando grupo de anuncios:`, error.message);
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

        // Construir mensaje con formato HTML
        let message = '';
        let hasHtmlFormatting = false;
        
        if (telegramPost.text) {
            message = telegramPost.text.trim();
            hasHtmlFormatting = telegramPost.entities && telegramPost.entities.length > 0;
        } else if (telegramPost.caption) {
            message = telegramPost.caption.trim();
            hasHtmlFormatting = telegramPost.caption_entities && telegramPost.caption_entities.length > 0;
        }

        // Aplicar formato HTML si existe
        if (hasHtmlFormatting) {
            const entities = telegramPost.entities || telegramPost.caption_entities;
            message = convertTelegramFormatToWhatsApp(message, entities);
            console.log(`   🎨 Formato HTML aplicado`);
        }

        console.log(`📤 Reenviando mensaje a ${whatsappGroup.name}...`);
        
        // Verificar si hay contenido para enviar
        const hasText = message && message.length > 0;
        const hasPhoto = telegramPost.photo && telegramPost.photo.length > 0;
        const hasDocument = telegramPost.document;
        const hasVideo = telegramPost.video;
        
        if (!hasText && !hasPhoto && !hasDocument && !hasVideo) {
            console.log('   ⚠️ No se encontró contenido para reenviar (texto, imagen, documento o video)');
            return;
        }

        if (hasText) {
            console.log(`   📝 Texto: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
            if (hasHtmlFormatting) {
                console.log(`   🎨 Con formato HTML`);
            }
        }

        // Verificar si hay foto
        if (hasPhoto) {
            try {
                console.log('   📸 Descargando imagen...');
                const imageBuffer = await downloadImage(telegramPost.photo[telegramPost.photo.length - 1].file_id);
                const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                
                await whatsappClient.sendMessage(whatsappGroup.id, media, { caption: message });
                console.log(`   ✅ Imagen con texto reenviada a ${whatsappGroup.name} exitosamente`);
                if (hasText) {
                    console.log(`   📝 Texto enviado: ${message.substring(0, 50)}...`);
                }
            } catch (error) {
                console.error('   ❌ Error enviando imagen:', error.message);
                // Intentar enviar solo texto si falla la imagen
                if (hasText) {
                    await whatsappClient.sendMessage(whatsappGroup.id, message);
                    console.log(`   ✅ Texto reenviado a ${whatsappGroup.name} exitosamente`);
                }
            }
        } else if (hasText) {
            // Solo texto
            await whatsappClient.sendMessage(whatsappGroup.id, message);
            console.log(`   ✅ Texto reenviado a ${whatsappGroup.name} exitosamente`);
        } else if (hasDocument) {
            console.log('   📄 Documento detectado (no soportado aún)');
        } else if (hasVideo) {
            console.log('   🎥 Video detectado (no soportado aún)');
        }
    } catch (error) {
        console.error('❌ Error reenviando mensaje:', error.message);
    }
}

// Función para reenviar anuncios a WhatsApp
async function forwardAnnouncementToWhatsApp(telegramMessage) {
    try {
        // Verificar si es una respuesta y si debemos ignorarla
        if (telegramMessage.reply_to_message && !config.ANNOUNCEMENTS.settings.forward_replies) {
            console.log('   ⚠️ Ignorando respuesta a mensaje');
            return;
        }

        // Verificar si el usuario está autorizado (si se especificó lista)
        if (config.ANNOUNCEMENTS.settings.allowed_users.length > 0 && telegramMessage.from) {
            const userId = telegramMessage.from.id.toString();
            if (!config.ANNOUNCEMENTS.settings.allowed_users.includes(userId)) {
                console.log(`   ⚠️ Usuario ${telegramMessage.from.first_name} no autorizado para enviar anuncios`);
                return;
            }
        }

        // Construir mensaje con formato HTML
        let message = '';
        let hasHtmlFormatting = false;
        
        if (telegramMessage.text) {
            message = telegramMessage.text.trim();
            hasHtmlFormatting = telegramMessage.entities && telegramMessage.entities.length > 0;
        } else if (telegramMessage.caption) {
            message = telegramMessage.caption.trim();
            hasHtmlFormatting = telegramMessage.caption_entities && telegramMessage.caption_entities.length > 0;
        }

        // Aplicar formato HTML si existe
        if (hasHtmlFormatting) {
            const entities = telegramMessage.entities || telegramMessage.caption_entities;
            message = convertTelegramFormatToWhatsApp(message, entities);
            console.log(`   🎨 Formato HTML aplicado`);
        }

        // Agregar prefijo si está habilitado
        if (config.ANNOUNCEMENTS.settings.add_prefix && message) {
            message = `${config.ANNOUNCEMENTS.settings.prefix_text}\n\n${message}`;
        }

        console.log(`📢 Reenviando anuncio a ambos grupos de TRADIFY...`);
        
        // Determinar nombre del remitente
        const senderName = telegramMessage.from ? 
            `${telegramMessage.from.first_name} ${telegramMessage.from.last_name || ''}` : 
            'Canal';
        console.log(`   👤 De: ${senderName}`);
        
        // Verificar si hay contenido para enviar
        const hasText = message && message.length > 0;
        const hasPhoto = telegramMessage.photo && telegramMessage.photo.length > 0;
        const hasDocument = telegramMessage.document;
        const hasVideo = telegramMessage.video;
        
        if (!hasText && !hasPhoto && !hasDocument && !hasVideo) {
            console.log('   ⚠️ No se encontró contenido para reenviar');
            return;
        }

        if (hasText) {
            console.log(`   📝 Texto: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
            if (hasHtmlFormatting) {
                console.log(`   🎨 Con formato HTML`);
            }
        }

        // Función para enviar a un grupo específico
        async function sendToGroup(group, groupName) {
            try {
                if (hasPhoto && config.ANNOUNCEMENTS.settings.forward_media) {
                    console.log(`   📸 Descargando imagen para ${groupName}...`);
                    const imageBuffer = await downloadImage(telegramMessage.photo[telegramMessage.photo.length - 1].file_id);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                    
                    await whatsappClient.sendMessage(group.id, media, { caption: message });
                    console.log(`   ✅ Anuncio con imagen enviado a ${groupName}`);
                } else if (hasText) {
                    await whatsappClient.sendMessage(group.id, message);
                    console.log(`   ✅ Anuncio de texto enviado a ${groupName}`);
                } else if (hasDocument && config.ANNOUNCEMENTS.settings.forward_media) {
                    console.log(`   📄 Documento detectado en ${groupName} (no soportado aún)`);
                } else if (hasVideo && config.ANNOUNCEMENTS.settings.forward_media) {
                    console.log(`   🎥 Video detectado en ${groupName} (no soportado aún)`);
                }
            } catch (error) {
                console.error(`   ❌ Error enviando a ${groupName}:`, error.message);
            }
        }

        // Enviar al grupo principal
        if (announcementsGroup) {
            await sendToGroup(announcementsGroup, announcementsGroup.name);
        }

        // Enviar al grupo alternativo
        if (alternativeGroup) {
            await sendToGroup(alternativeGroup, alternativeGroup.name);
        }
    } catch (error) {
        console.error('❌ Error reenviando anuncio:', error.message);
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
            } else if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
                       message.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
                       whatsappReady && (announcementsGroup || alternativeGroup)) {
                console.log(`📢 Grupo de anuncios detectado: ${message.chat.title}`);
                await forwardAnnouncementToWhatsApp(message);
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
        } else if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
                   post.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
                   whatsappReady && (announcementsGroup || alternativeGroup)) {
            console.log(`📢 Canal de anuncios detectado: ${post.chat.title}`);
            await forwardAnnouncementToWhatsApp(post);
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
        } else if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
                   post.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
                   whatsappReady && (announcementsGroup || alternativeGroup)) {
            console.log(`📢 Canal de anuncios detectado (editado): ${post.chat.title}`);
            await forwardAnnouncementToWhatsApp(post);
        } else {
            console.log(`⚠️ Grupo no configurado o WhatsApp no listo: ${post.chat.title}`);
        }
    });

    console.log('✅ Escucha de Telegram configurada');
}

// Conectar bot de Telegram
async function initializeTelegramBot() {
    try {
        const botInfo = await telegramBot.getMe();
        console.log('✅ Bot de Telegram conectado');
        console.log(`👤 Nombre: ${botInfo.first_name}`);
        console.log(`🔗 Username: ${botInfo.username}`);
        console.log('');
        
        // Configurar listener
        setupTelegramListener();
        
        // Iniciar polling manualmente
        telegramBot.startPolling();
        console.log('🔄 Polling iniciado');
        
    } catch (error) {
        console.error('❌ Error conectando bot de Telegram:', error.message);
        console.log('🔄 Reintentando en 30 segundos...');
        setTimeout(initializeTelegramBot, 30000);
    }
}

// Inicializar bot de Telegram
initializeTelegramBot();

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

// Función para enviar QR por Telegram
async function sendQRToTelegram(qrData) {
    try {
        console.log('📤 Generando imagen QR para Telegram...');
        
        // Generar QR como imagen PNG
        const qrImageBuffer = await qrcodeImage.toBuffer(qrData, {
            type: 'png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        // Enviar imagen por Telegram
        await telegramBot.sendPhoto(TELEGRAM_USER_ID, qrImageBuffer, {
            caption: '📱 **Código QR de WhatsApp**\n\nEscanea este código con WhatsApp para conectar el bot.\n\n1. Abre WhatsApp en tu teléfono\n2. Ve a Configuración → WhatsApp Web\n3. Escanea este código QR\n\n✅ Una vez conectado, el bot funcionará automáticamente.',
            parse_mode: 'Markdown'
        });
        
        console.log('✅ QR enviado exitosamente a Telegram');
        console.log(`📱 Revisa tu Telegram (ID: ${TELEGRAM_USER_ID})`);
    } catch (error) {
        console.error('❌ Error enviando QR por Telegram:', error.message);
        // Si falla, mostrar QR en consola como respaldo
        console.log('📱 QR de respaldo en consola:');
        qrcode.generate(qrData, { small: true });
    }
}

// Evento QR
whatsappClient.on('qr', async (qr) => {
    console.log('📱 Generando código QR...');
    qrCodeData = qr; // Guardar QR para mostrar en web
    whatsappReady = false; // Marcar como no listo cuando se genera QR
    
    // Enviar QR por Telegram
    await sendQRToTelegram(qr);
    
    console.log('');
    console.log('🌐 QR Code también disponible en: /qr');
    console.log('📱 Abre tu navegador y ve a la URL del bot + /qr');
    console.log('⚠️ Esperando escaneo del QR...');
    console.log('');
});

// Evento ready
whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp conectado correctamente!');
    whatsappReady = true;
    
    try {
        // Configurar grupos automáticamente
        await configureWhatsAppGroups();
        
        console.log('🎉 Bot iniciado correctamente!');
        console.log('✅ Los grupos se configurarán automáticamente');
        
        // Verificar que realmente estamos conectados
        const info = await whatsappClient.info;
        console.log(`📱 WhatsApp Web conectado como: ${info.pushname || 'Usuario'}`);
        
    } catch (error) {
        console.error('❌ Error configurando grupos:', error.message);
        whatsappReady = false;
    }
});

// Evento authenticating
whatsappClient.on('authenticating', () => {
    console.log('🔐 Autenticando WhatsApp...');
    whatsappReady = false;
});

// Evento auth_failure
whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación de WhatsApp:', msg);
    whatsappReady = false;
    
    // Reintentar después de un tiempo
    setTimeout(() => {
        console.log('🔄 Reintentando conexión de WhatsApp...');
        whatsappClient.initialize().catch((error) => {
            console.error('❌ Error reinicializando WhatsApp:', error.message);
        });
    }, 30000);
});

// Evento disconnected
whatsappClient.on('disconnected', (reason) => {
    console.log('📱 WhatsApp desconectado:', reason);
    whatsappReady = false;
    
    // Reintentar conexión después de un tiempo
    setTimeout(() => {
        console.log('🔄 Reintentando conexión de WhatsApp después de desconexión...');
        whatsappClient.initialize().catch((error) => {
            console.error('❌ Error reconectando WhatsApp:', error.message);
        });
    }, 15000);
});

// Inicializar WhatsApp
whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
    // No salir del proceso, solo loggear el error
});

// Manejar errores de polling de Telegram
telegramBot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
        console.log('⚠️ Conflicto de polling detectado, reiniciando en 5 segundos...');
        setTimeout(() => {
            console.log('🔄 Reiniciando bot...');
            process.exit(0);
        }, 5000);
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
        console.log('⏰ Timeout detectado, reintentando en 10 segundos...');
        setTimeout(() => {
            console.log('🔄 Reintentando conexión...');
            // No reiniciar el proceso, solo reintentar
        }, 10000);
    } else {
        console.error('❌ Error de polling:', error.message);
        // Para otros errores, esperar un poco antes de reintentar
        setTimeout(() => {
            console.log('🔄 Reintentando después de error...');
        }, 15000);
    }
});

// Mejorar manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error.message);
    console.error('📋 Stack trace:', error.stack);
    // No salir del proceso, solo loggear
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    // No salir del proceso, solo loggear
});

// Agregar heartbeat para mantener la conexión activa
setInterval(() => {
    if (whatsappReady) {
        console.log('💓 Heartbeat: Bot funcionando correctamente');
    }
}, 300000); // Cada 5 minutos

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando bot...');
    whatsappClient.destroy();
    telegramBot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando bot...');
    whatsappClient.destroy();
    telegramBot.stopPolling();
    process.exit(0);
}); 