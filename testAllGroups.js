const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Script de prueba completa - Escuchando TODOS los mensajes...');
console.log('');

// Crear instancia del bot de Telegram
const telegramBot = new TelegramBot('7356435225:AAE_crZ_JHcUej-3tN3l0qf1zmCb5kCx5Js', {
    polling: true,
    parse_mode: 'HTML'
});

// Escuchar TODOS los mensajes
telegramBot.on('message', (message) => {
    console.log('📨 MENSAJE RECIBIDO:');
    console.log('   🆔 Chat ID:', message.chat.id);
    console.log('   📝 Nombre del chat:', message.chat.title || 'Chat privado');
    console.log('   👤 De:', message.from?.first_name || 'Desconocido');
    console.log('   📝 Texto:', message.text || 'Sin texto');
    console.log('   🔍 Tipo de chat:', message.chat.type);
    console.log('   🔍 Es grupo:', message.chat.type === 'group' || message.chat.type === 'supergroup');
    console.log('   🔍 Es canal:', message.chat.type === 'channel');
    console.log('   📅 Fecha:', new Date(message.date * 1000).toLocaleString());
    console.log('');
});

// Escuchar errores
telegramBot.on('polling_error', (error) => {
    console.log('❌ Error de polling:', error.message);
});

// Escuchar cuando el bot se conecta
telegramBot.on('polling', () => {
    console.log('✅ Bot conectado y escuchando...');
});

console.log('⏳ Esperando TODOS los mensajes...');
console.log('📢 Envía mensajes en cualquier chat donde esté el bot');
console.log('🛑 Presiona Ctrl+C para detener');
console.log('');

// Manejar salida limpia
process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo script...');
    telegramBot.stopPolling();
    process.exit(0);
}); 