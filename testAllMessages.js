const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

console.log('🔍 ESCUCHANDO TODOS LOS EVENTOS DE TELEGRAM...');
console.log('');

// Token del bot de Telegram
const TELEGRAM_TOKEN = config.TELEGRAM_BOT_TOKEN;

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

telegramBot.on('callback_query', (query) => {
    console.log('🔘 CALLBACK QUERY RECIBIDO');
    console.log(`   De: ${query.from.first_name}`);
    console.log(`   Data: ${query.data}`);
    console.log('');
});

telegramBot.on('inline_query', (query) => {
    console.log('🔍 INLINE QUERY RECIBIDO');
    console.log(`   De: ${query.from.first_name}`);
    console.log(`   Query: ${query.query}`);
    console.log('');
});

telegramBot.on('chosen_inline_result', (result) => {
    console.log('✅ CHOSEN INLINE RESULT RECIBIDO');
    console.log(`   De: ${result.from.first_name}`);
    console.log(`   Result ID: ${result.result_id}`);
    console.log('');
});

telegramBot.on('shipping_query', (query) => {
    console.log('🚚 SHIPPING QUERY RECIBIDO');
    console.log(`   De: ${query.from.first_name}`);
    console.log('');
});

telegramBot.on('pre_checkout_query', (query) => {
    console.log('💳 PRE CHECKOUT QUERY RECIBIDO');
    console.log(`   De: ${query.from.first_name}`);
    console.log('');
});

telegramBot.on('poll', (poll) => {
    console.log('📊 POLL RECIBIDO');
    console.log(`   Pregunta: ${poll.question}`);
    console.log('');
});

telegramBot.on('poll_answer', (answer) => {
    console.log('🗳️ POLL ANSWER RECIBIDO');
    console.log(`   De: ${answer.user.first_name}`);
    console.log('');
});

telegramBot.on('my_chat_member', (member) => {
    console.log('👤 MY CHAT MEMBER RECIBIDO');
    console.log(`   Chat: ${member.chat.title || member.chat.first_name}`);
    console.log(`   Status: ${member.new_chat_member.status}`);
    console.log('');
});

telegramBot.on('chat_member', (member) => {
    console.log('👥 CHAT MEMBER RECIBIDO');
    console.log(`   Chat: ${member.chat.title || member.chat.first_name}`);
    console.log(`   Usuario: ${member.new_chat_member.user.first_name}`);
    console.log(`   Status: ${member.new_chat_member.status}`);
    console.log('');
});

telegramBot.on('chat_join_request', (request) => {
    console.log('🚪 CHAT JOIN REQUEST RECIBIDO');
    console.log(`   Chat: ${request.chat.title || request.chat.first_name}`);
    console.log(`   Usuario: ${request.from.first_name}`);
    console.log('');
});

// Inicializar
async function init() {
    await getBotInfo();
    await getRecentUpdates();
    
    console.log('✅ ESCUCHA ACTIVA - Envía mensajes en cualquier chat/canal');
    console.log(`🎯 Buscando canal: "${config.ANNOUNCEMENTS.source_group.telegram_name}"`);
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