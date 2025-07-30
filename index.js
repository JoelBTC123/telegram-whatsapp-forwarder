const TelegramBot = require('node-telegram-bot-api');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const https = require('https');
const config = require('./config');

console.log('🚀 Iniciando bot de reenvío Telegram → WhatsApp...');
console.log('📋 Grupos configurados:');
Object.keys(config.GROUPS).forEach(groupKey => {
    const group = config.GROUPS[groupKey];
    console.log(`   📱 ${group.telegram_name} → ${group.whatsapp_name}`);
});
console.log('');

// Crear instancia del bot de Telegram
const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, config.BOT_CONFIG);

// Crear instancia del cliente de WhatsApp
const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        executablePath: process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined
    }
});

let whatsappReady = false;
let whatsappGroups = {};

// Función para descargar imagen desde URL
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

// Función para obtener información del bot de Telegram
async function getTelegramBotInfo() {
    try {
        const me = await telegramBot.getMe();
        console.log('✅ Bot de Telegram conectado');
        console.log('👤 Nombre:', me.first_name);
        console.log('🔗 Username:', me.username);
        console.log('');
    } catch (error) {
        console.error('❌ Error al conectar con Telegram:', error.message);
        process.exit(1);
    }
}

// Función para manejar la conexión de WhatsApp
function setupWhatsApp() {
    console.log('📱 Configurando WhatsApp...');
    
    // Generar QR code para conectar WhatsApp
    whatsappClient.on('qr', (qr) => {
        console.log('📱 Escanea este código QR con WhatsApp:');
        qrcode.generate(qr, { small: true });
        console.log('');
    });

    // WhatsApp conectado
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp conectado correctamente');
        whatsappReady = true;
        console.log('');
        
        // Configurar grupos de WhatsApp automáticamente
        configureWhatsAppGroups();
    });

    // Manejar errores de WhatsApp
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ Error de autenticación de WhatsApp:', msg);
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('📱 WhatsApp desconectado:', reason);
        whatsappReady = false;
    });

    // Inicializar WhatsApp
    whatsappClient.initialize();
}

// Función para configurar grupos de WhatsApp automáticamente
async function configureWhatsAppGroups() {
    try {
        console.log('🔍 Configurando grupos de WhatsApp automáticamente...');
        const chats = await whatsappClient.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        console.log(`📋 Encontrados ${groups.length} grupos en WhatsApp:`);
        groups.forEach((group, index) => {
            console.log(`   ${index + 1}. ${group.name} (${group.id._serialized})`);
        });
        
        // Configurar cada grupo de Telegram con su correspondiente de WhatsApp
        Object.keys(config.GROUPS).forEach(groupKey => {
            const groupConfig = config.GROUPS[groupKey];
            const whatsappGroup = groups.find(g => g.name === groupConfig.whatsapp_name);
            
            if (whatsappGroup) {
                whatsappGroups[groupKey] = {
                    id: whatsappGroup.id._serialized,
                    name: whatsappGroup.name,
                    chat: whatsappGroup
                };
                console.log(`✅ ${groupConfig.telegram_name} → ${whatsappGroup.name}`);
            } else {
                console.log(`❌ No se encontró el grupo de WhatsApp: ${groupConfig.whatsapp_name}`);
            }
        });
        
        console.log('');
        console.log('🚀 Bot listo! Los mensajes se reenviarán automáticamente:');
        Object.keys(whatsappGroups).forEach(groupKey => {
            const group = whatsappGroups[groupKey];
            console.log(`   📱 ${config.GROUPS[groupKey].telegram_name} → ${group.name}`);
        });
        console.log('');
        
    } catch (error) {
        console.error('❌ Error al configurar grupos:', error.message);
    }
}

// Función para manejar mensajes de Telegram
function setupTelegramListener() {
    console.log('📢 Configurando escucha de mensajes del grupo...');
    
    // Escuchar mensajes del grupo
    telegramBot.on('message', async (message) => {
        console.log('📨 Mensaje recibido:');
        console.log('   🆔 ID del chat:', message.chat.id);
        console.log('   📝 Nombre del chat:', message.chat.title);
        console.log('   👤 De:', message.from?.first_name || 'Desconocido');
        console.log('   📝 Texto:', message.text ? message.text.substring(0, 100) + '...' : 'Sin texto');
        console.log('   📅 Fecha:', new Date(message.date * 1000).toLocaleString());
        
        // Verificar si es un grupo configurado
        if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
            const groupKey = findGroupKey(message.chat.title);
            if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
                console.log(`✅ Grupo configurado detectado: ${message.chat.title}`);
                await forwardToWhatsApp(message, groupKey);
            } else {
                console.log('❌ Grupo no configurado o WhatsApp no listo');
                console.log('   📱 WhatsApp listo:', whatsappReady);
                console.log('   🔍 Grupo encontrado:', groupKey);
            }
        } else {
            console.log('❌ No es un grupo (es chat privado)');
            console.log('   🔍 Tipo de chat:', message.chat.type);
        }
        console.log('');
    });

    // También escuchar mensajes editados
    telegramBot.on('edited_message', async (message) => {
        console.log('✏️ Mensaje editado del grupo:');
        console.log('   🆔 ID del grupo:', message.chat.id);
        console.log('   📝 Texto:', message.text ? message.text.substring(0, 100) + '...' : 'Sin texto');
        
        const groupKey = findGroupKey(message.chat.title);
        if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
            await forwardToWhatsApp(message, groupKey);
        }
        console.log('');
    });

    // Escuchar channel_post (mensajes de canales/grupos como admin)
    telegramBot.on('channel_post', async (post) => {
        console.log('📢 Channel post recibido:');
        console.log('   🆔 ID del chat:', post.chat.id);
        console.log('   📝 Nombre del chat:', post.chat.title);
        console.log('   📝 Texto:', post.text ? post.text.substring(0, 100) + '...' : 'Sin texto');
        console.log('   📅 Fecha:', new Date(post.date * 1000).toLocaleString());
        
        const groupKey = findGroupKey(post.chat.title);
        if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
            console.log(`✅ Grupo configurado detectado en channel_post: ${post.chat.title}`);
            await forwardToWhatsApp(post, groupKey);
        } else {
            console.log('❌ Grupo no configurado o WhatsApp no listo');
        }
        console.log('');
    });

    // También escuchar edited_channel_post
    telegramBot.on('edited_channel_post', async (post) => {
        console.log('✏️ Channel post editado:');
        console.log('   🆔 ID del chat:', post.chat.id);
        console.log('   📝 Texto:', post.text ? post.text.substring(0, 100) + '...' : 'Sin texto');
        
        const groupKey = findGroupKey(post.chat.title);
        if (groupKey && whatsappReady && whatsappGroups[groupKey]) {
            await forwardToWhatsApp(post, groupKey);
        }
        console.log('');
    });

    console.log('✅ Escucha de Telegram configurada');
    console.log('');
}

// Función para encontrar la clave del grupo basada en el nombre
function findGroupKey(telegramGroupName) {
    for (const groupKey in config.GROUPS) {
        if (config.GROUPS[groupKey].telegram_name === telegramGroupName) {
            return groupKey;
        }
    }
    return null;
}

// Función para reenviar mensaje a WhatsApp
async function forwardToWhatsApp(telegramPost, groupKey) {
    try {
        const whatsappGroup = whatsappGroups[groupKey];
        const groupConfig = config.GROUPS[groupKey];
        
        console.log(`📤 Reenviando mensaje de ${groupConfig.telegram_name} a ${whatsappGroup.name}...`);
        
        let message = '';
        let hasMedia = false;
        
        // Construir el mensaje - solo el contenido original
        if (telegramPost.text) {
            message = telegramPost.text;
        } else if (telegramPost.caption) {
            message = telegramPost.caption;
        }
        
        // Verificar si hay imagen
        if (telegramPost.photo && telegramPost.photo.length > 0) {
            hasMedia = true;
            console.log('   🖼️ Imagen detectada, descargando...');
            
            try {
                // Obtener la imagen de mayor calidad (última del array)
                const photo = telegramPost.photo[telegramPost.photo.length - 1];
                const file = await telegramBot.getFile(photo.file_id);
                const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                
                console.log('   📥 URL de la imagen:', imageUrl);
                
                // Descargar la imagen
                const imageBuffer = await downloadImage(imageUrl);
                
                // Crear MediaMessage con imagen
                const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                
                // Enviar imagen con texto como caption
                await whatsappClient.sendMessage(whatsappGroup.id, media, { caption: message });
                console.log(`   ✅ Imagen con texto reenviada a ${whatsappGroup.name} exitosamente`);
                console.log(`   📝 Texto enviado: ${message.substring(0, 50)}...`);
                
            } catch (mediaError) {
                console.error('   ❌ Error al procesar imagen:', mediaError.message);
                // Si falla la imagen, enviar solo el texto
                if (message) {
                    await whatsappClient.sendMessage(whatsappGroup.id, message);
                    console.log(`   ✅ Texto reenviado a ${whatsappGroup.name} (sin imagen)`);
                }
            }
        } else {
            // Solo texto
            if (message) {
                console.log('   📝 Mensaje a enviar:', message.substring(0, 100) + '...');
                console.log(`   🆔 Grupo destino: ${whatsappGroup.name}`);
                
                await whatsappClient.sendMessage(whatsappGroup.id, message);
                console.log(`   ✅ Mensaje reenviado a ${whatsappGroup.name} exitosamente`);
            } else {
                console.log('   ⚠️ No hay texto ni imagen para reenviar');
            }
        }
        
    } catch (error) {
        console.error('   ❌ Error al reenviar a WhatsApp:', error.message);
        console.error('   🔍 Detalles del error:', error);
    }
}

// Función para manejar mensajes de WhatsApp (ya no necesaria, pero mantenida por compatibilidad)
function setupWhatsAppMessageListener() {
    // Los grupos se configuran automáticamente ahora
    console.log('📱 Configuración automática de grupos activada');
}

// Función principal
async function main() {
    try {
        // Configurar Telegram
        await getTelegramBotInfo();
        setupTelegramListener();
        
        // Configurar WhatsApp
        setupWhatsApp();
        setupWhatsAppMessageListener();
        
        console.log('🎉 Bot iniciado correctamente!');
        console.log('📱 Escanea el código QR que aparecerá arriba');
        console.log('✅ Los grupos se configurarán automáticamente');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error al iniciar el bot:', error.message);
        process.exit(1);
    }
}

// Manejar salida limpia
process.on('SIGINT', async () => {
    console.log('\n👋 Cerrando bot...');
    if (whatsappClient) {
        await whatsappClient.destroy();
    }
    process.exit(0);
});

// Iniciar el bot
main().catch(console.error);
