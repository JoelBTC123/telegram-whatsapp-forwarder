const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

console.log('🔍 Obteniendo ID del canal de Telegram...');
console.log('📋 Canal: ' + config.CHANNEL_NAME);
console.log('');

// Crear instancia del bot de Telegram
const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
    polling: true,
    parse_mode: 'HTML'
});

// Escuchar todos los mensajes de canal para obtener el ID
telegramBot.on('channel_post', (post) => {
    console.log('📨 Mensaje del canal detectado:');
    console.log('   🆔 ID del canal:', post.chat.id);
    console.log('   📝 Nombre del canal:', post.chat.title);
    console.log('   📝 Username:', post.chat.username);
    console.log('   📅 Fecha:', new Date(post.date * 1000).toLocaleString());
    console.log('   📝 Texto:', post.text ? post.text.substring(0, 100) + '...' : 'Sin texto');
        console.log('');
    console.log('💾 Agrega este ID a config.js:');
    console.log(`   CHANNEL_ID: ${post.chat.id}`);
        console.log('');
});
        
// También escuchar mensajes editados
telegramBot.on('edited_channel_post', (post) => {
    console.log('✏️ Mensaje editado del canal:');
    console.log('   🆔 ID del canal:', post.chat.id);
    console.log('   📝 Nombre del canal:', post.chat.title);
            console.log('');
        });

console.log('⏳ Esperando mensajes del canal...');
console.log('📢 Envía un mensaje en el canal para obtener su ID');
console.log('🛑 Presiona Ctrl+C para detener');
            console.log('');

// Manejar salida limpia
process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo script...');
    telegramBot.stopPolling();
    process.exit(0);
});
