const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

console.log('🔍 Debug con botize123123_bot...');
console.log('');

// Token del bot correcto
const TELEGRAM_TOKEN = '8253828996:AAFZSAjszXNdsDTyPw3_uHJIVSYzw9H8xT8';

// Crear bot de Telegram
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { 
    polling: true,
    parse_mode: 'HTML'
});

// Función para obtener información del bot
async function getBotInfo() {
    try {
        const botInfo = await telegramBot.getMe();
        console.log('🤖 INFORMACIÓN DEL BOT:');
        console.log(`   Nombre: ${botInfo.first_name}`);
        console.log(`   Username: ${botInfo.username}`);
        console.log(`   ID: ${botInfo.id}`);
        console.log('');
    } catch (error) {
        console.error('❌ Error obteniendo información del bot:', error.message);
    }
}

// Función para obtener actualizaciones recientes
async function getRecentUpdates() {
    try {
        console.log('📋 OBTENIENDO ACTUALIZACIONES RECIENTES...');
        const updates = await telegramBot.getUpdates({ limit: 10 });
        console.log(`   Encontradas ${updates.length} actualizaciones recientes`);
        
        if (updates.length > 0) {
            console.log('   Últimas actualizaciones:');
            updates.forEach((update, index) => {
                console.log(`   ${index + 1}. Tipo: ${Object.keys(update).filter(key => key !== 'update_id')}`);
                if (update.message) {
                    console.log(`      Chat: ${update.message.chat.title || update.message.chat.first_name}`);
                    console.log(`      Texto: ${update.message.text || 'Sin texto'}`);
                }
                if (update.channel_post) {
                    console.log(`      Canal: ${update.channel_post.chat.title}`);
                    console.log(`      Texto: ${update.channel_post.text || 'Sin texto'}`);
                }
            });
        }
        console.log('');
    } catch (error) {
        console.error('❌ Error obteniendo actualizaciones:', error.message);
    }
}

// Escuchar TODOS los tipos de eventos
telegramBot.on('message', (message) => {
    console.log('📨 MENSAJE NORMAL RECIBIDO');
    console.log(`   Chat: ${message.chat.title || message.chat.first_name}`);
    console.log(`   Tipo: ${message.chat.type}`);
    console.log(`   Texto: ${message.text || message.caption || 'Sin texto'}`);
    console.log(`   Usuario: ${message.from.first_name}`);
    console.log('');
});

telegramBot.on('channel_post', (post) => {
    console.log('📢 POST DE CANAL RECIBIDO');
    console.log(`   Canal: ${post.chat.title}`);
    console.log(`   Tipo: ${post.chat.type}`);
    console.log(`   Texto: ${post.text || post.caption || 'Sin texto'}`);
    console.log('');
});

telegramBot.on('edited_message', (message) => {
    console.log('✏️ MENSAJE EDITADO RECIBIDO');
    console.log(`   Chat: ${message.chat.title || message.chat.first_name}`);
    console.log(`   Texto: ${message.text || message.caption || 'Sin texto'}`);
    console.log('');
});

telegramBot.on('edited_channel_post', (post) => {
    console.log('✏️ POST DE CANAL EDITADO RECIBIDO');
    console.log(`   Canal: ${post.chat.title}`);
    console.log(`   Texto: ${post.text || post.caption || 'Sin texto'}`);
    console.log('');
});

// Inicializar
async function init() {
    await getBotInfo();
    await getRecentUpdates();
    
    console.log('✅ ESCUCHA ACTIVA - Envía mensajes en cualquier chat/canal');
    console.log(`🎯 Buscando canal: "${config.ANNOUNCEMENTS.source_group.telegram_name}"`);
    console.log('');
    console.log('💡 Si no ves mensajes del canal "2", verifica que:');
    console.log('   1. El bot @botize123123_bot esté agregado al canal "2"');
    console.log('   2. El bot tenga permisos de administrador en el canal');
    console.log('   3. Los mensajes se envíen como posts de canal');
    console.log('');
}

init();

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('🛑 Cerrando...');
    telegramBot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Cerrando...');
    telegramBot.stopPolling();
    process.exit(0);
}); 