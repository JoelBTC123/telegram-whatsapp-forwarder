const TelegramBot = require('node-telegram-bot-api');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

console.log('🧪 Bot de prueba para anuncios...');
console.log('');

// Token del bot de Telegram (usar el token correcto)
const TELEGRAM_TOKEN = '8253828996:AAFZSAjszXNdsDTyPw3_uHJIVSYzw9H8xT8';

// Crear bot de Telegram
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { 
    polling: true,
    parse_mode: 'HTML'
});

// Variables globales
let whatsappReady = false;
let announcementsGroup = null;
let alternativeGroup = null;

// Función para descargar imagen
async function downloadImage(fileId) {
    try {
        const file = await telegramBot.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
        
        return new Promise((resolve, reject) => {
            const https = require('https');
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

// Función para reenviar anuncios a WhatsApp
async function forwardAnnouncementToWhatsApp(telegramMessage) {
    try {
        if (!announcementsGroup) {
            console.log('❌ Grupo de anuncios no configurado');
            return;
        }

        // Determinar si es un post de canal o mensaje normal
        const isChannelPost = !telegramMessage.from;
        const senderName = isChannelPost ? 'Canal' : `${telegramMessage.from.first_name} ${telegramMessage.from.last_name || ''}`;
        
        console.log(`📢 Procesando mensaje de: ${senderName}`);

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

        // Agregar prefijo (deshabilitado por ahora)
        // if (config.ANNOUNCEMENTS.settings.add_prefix && message) {
        //     message = `${config.ANNOUNCEMENTS.settings.prefix_text}\n\n${message}`;
        // }

        console.log(`📤 Reenviando anuncio a ambos grupos de TRADIFY...`);
        console.log(`   👤 De: ${senderName}`);
        
        // Verificar contenido
        const hasText = message && message.length > 0;
        const hasPhoto = telegramMessage.photo && telegramMessage.photo.length > 0;
        
        if (!hasText && !hasPhoto) {
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

// Configurar WhatsApp
console.log('📱 Configurando WhatsApp...');

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        clientId: 'telegram-whatsapp-bot-test',
        dataPath: './.wwebjs_auth_test'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ],
        timeout: 30000
    }
});

// Evento QR
whatsappClient.on('qr', (qr) => {
    console.log('📱 Escanea este QR para conectar WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('');
    console.log('⚠️ Esperando escaneo del QR...');
});

// Evento ready
whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp conectado correctamente!');
    whatsappReady = true;
    
    try {
        // Configurar grupo de anuncios principal
        if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled) {
            const announcementsChat = await whatsappClient.getChatById(config.ANNOUNCEMENTS.destination_group.whatsapp_id);
            announcementsGroup = {
                id: config.ANNOUNCEMENTS.destination_group.whatsapp_id,
                name: config.ANNOUNCEMENTS.destination_group.whatsapp_name,
                chat: announcementsChat
            };
            console.log(`✅ Grupo principal configurado: ${config.ANNOUNCEMENTS.destination_group.whatsapp_name}`);
            
            // Configurar grupo alternativo
            if (config.ANNOUNCEMENTS.alternative_group) {
                const alternativeChat = await whatsappClient.getChatById(config.ANNOUNCEMENTS.alternative_group.whatsapp_id);
                alternativeGroup = {
                    id: config.ANNOUNCEMENTS.alternative_group.whatsapp_id,
                    name: config.ANNOUNCEMENTS.alternative_group.whatsapp_name,
                    chat: alternativeChat
                };
                console.log(`✅ Grupo alternativo configurado: ${config.ANNOUNCEMENTS.alternative_group.whatsapp_name}`);
            }
        }
        
        console.log('🎉 Bot de anuncios listo!');
        console.log(`📢 Escuchando mensajes en: ${config.ANNOUNCEMENTS.source_group.telegram_name}`);
        console.log(`📤 Reenviando a: ${announcementsGroup.name} y ${alternativeGroup ? alternativeGroup.name : 'solo grupo principal'}`);
        
    } catch (error) {
        console.error('❌ Error configurando grupo de anuncios:', error.message);
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
});

// Configurar escucha de Telegram
console.log('📢 Configurando escucha de Telegram...');

telegramBot.on('message', async (message) => {
    console.log(`📨 Mensaje recibido de: ${message.chat.title || message.chat.first_name}`);
    
    if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
        if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
            message.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
            whatsappReady && announcementsGroup) {
            console.log(`📢 Grupo de anuncios detectado: ${message.chat.title}`);
            await forwardAnnouncementToWhatsApp(message);
        } else {
            console.log(`⚠️ Grupo no configurado o WhatsApp no listo: ${message.chat.title}`);
            console.log(`   Grupo esperado: ${config.ANNOUNCEMENTS.source_group.telegram_name}`);
            console.log(`   WhatsApp listo: ${whatsappReady}`);
            console.log(`   Grupo configurado: ${!!announcementsGroup}`);
        }
    } else {
        console.log(`📱 Mensaje privado de: ${message.chat.first_name}`);
    }
});

// Escuchar posts de canal (importante para el canal "2")
telegramBot.on('channel_post', async (post) => {
    console.log(`📢 Post de canal recibido de: ${post.chat.title}`);
    
    if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
        post.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
        whatsappReady && announcementsGroup) {
        console.log(`📢 Canal de anuncios detectado: ${post.chat.title}`);
        await forwardAnnouncementToWhatsApp(post);
    } else {
        console.log(`⚠️ Canal no configurado o WhatsApp no listo: ${post.chat.title}`);
        console.log(`   Canal esperado: ${config.ANNOUNCEMENTS.source_group.telegram_name}`);
        console.log(`   WhatsApp listo: ${whatsappReady}`);
        console.log(`   Grupo configurado: ${!!announcementsGroup}`);
    }
});

// Escuchar posts editados de canal
telegramBot.on('edited_channel_post', async (post) => {
    console.log(`✏️ Post editado de canal recibido de: ${post.chat.title}`);
    
    if (config.ANNOUNCEMENTS && config.ANNOUNCEMENTS.enabled && 
        post.chat.title === config.ANNOUNCEMENTS.source_group.telegram_name &&
        whatsappReady && announcementsGroup) {
        console.log(`📢 Canal de anuncios detectado (editado): ${post.chat.title}`);
        await forwardAnnouncementToWhatsApp(post);
    }
});

// Inicializar WhatsApp
whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('🛑 Cerrando bot...');
    whatsappClient.destroy();
    telegramBot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Cerrando bot...');
    whatsappClient.destroy();
    telegramBot.stopPolling();
    process.exit(0);
}); 