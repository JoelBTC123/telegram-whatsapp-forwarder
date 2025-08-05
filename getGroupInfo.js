const TelegramBot = require('node-telegram-bot-api');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// Token del bot de Telegram
const TELEGRAM_TOKEN = config.TELEGRAM_BOT_TOKEN;

console.log('🔍 Script para obtener información de grupos...');
console.log('');

// Crear bot de Telegram
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// Función para obtener información de grupos de Telegram
async function getTelegramGroups() {
    try {
        console.log('📱 Obteniendo información de grupos de Telegram...');
        console.log('');
        
        // Obtener actualizaciones recientes para ver grupos
        const updates = await telegramBot.getUpdates({ limit: 100 });
        
        const groups = new Map();
        
        updates.forEach(update => {
            if (update.message && update.message.chat) {
                const chat = update.message.chat;
                if (chat.type === 'group' || chat.type === 'supergroup') {
                    if (!groups.has(chat.id)) {
                        groups.set(chat.id, {
                            id: chat.id,
                            title: chat.title,
                            type: chat.type,
                            username: chat.username || 'Sin username'
                        });
                    }
                }
            }
        });
        
        if (groups.size === 0) {
            console.log('❌ No se encontraron grupos. Asegúrate de que el bot esté en los grupos.');
            console.log('💡 Envía un mensaje en el grupo para que aparezca aquí.');
        } else {
            console.log('📋 Grupos de Telegram encontrados:');
            console.log('');
            groups.forEach(group => {
                console.log(`📱 ${group.title}`);
                console.log(`   ID: ${group.id}`);
                console.log(`   Tipo: ${group.type}`);
                console.log(`   Username: ${group.username}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo grupos de Telegram:', error.message);
    }
}

// Función para obtener información de grupos de WhatsApp
async function getWhatsAppGroups() {
    try {
        console.log('📱 Conectando a WhatsApp...');
        
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
                    '--disable-gpu'
                ]
            }
        });

        // Evento QR
        whatsappClient.on('qr', (qr) => {
            console.log('📱 Escanea este QR para conectar WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Evento ready
        whatsappClient.on('ready', async () => {
            console.log('✅ WhatsApp conectado!');
            console.log('');
            
            try {
                const chats = await whatsappClient.getChats();
                const groups = chats.filter(chat => chat.isGroup);
                
                if (groups.length === 0) {
                    console.log('❌ No se encontraron grupos de WhatsApp.');
                } else {
                    console.log('📋 Grupos de WhatsApp encontrados:');
                    console.log('');
                    groups.forEach(group => {
                        console.log(`📱 ${group.name}`);
                        console.log(`   ID: ${group.id._serialized}`);
                        console.log(`   Participantes: ${group.participantsCount || 'N/A'}`);
                        console.log('');
                    });
                }
                
                // Cerrar conexión
                await whatsappClient.destroy();
                process.exit(0);
                
            } catch (error) {
                console.error('❌ Error obteniendo grupos de WhatsApp:', error.message);
                await whatsappClient.destroy();
                process.exit(1);
            }
        });

        // Inicializar WhatsApp
        await whatsappClient.initialize();
        
    } catch (error) {
        console.error('❌ Error inicializando WhatsApp:', error.message);
        process.exit(1);
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--telegram') || args.includes('-t')) {
        await getTelegramGroups();
    } else if (args.includes('--whatsapp') || args.includes('-w')) {
        await getWhatsAppGroups();
    } else {
        console.log('🔍 Script para obtener información de grupos');
        console.log('');
        console.log('Uso:');
        console.log('  node getGroupInfo.js --telegram  # Obtener grupos de Telegram');
        console.log('  node getGroupInfo.js --whatsapp  # Obtener grupos de WhatsApp');
        console.log('  node getGroupInfo.js --all       # Obtener ambos');
        console.log('');
        
        if (args.includes('--all') || args.includes('-a')) {
            await getTelegramGroups();
            console.log('='.repeat(50));
            console.log('');
            await getWhatsAppGroups();
        }
    }
}

// Ejecutar
main().catch(console.error); 