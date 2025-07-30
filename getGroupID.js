const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Obteniendo ID del grupo VIP ORO...');
console.log('');

// Crear instancia del bot de Telegram
const telegramBot = new TelegramBot('7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50', {
    polling: true,
    parse_mode: 'HTML'
});

// Escuchar todos los mensajes
telegramBot.on('message', (message) => {
    console.log('📨 MENSAJE RECIBIDO:');
    console.log('   🆔 Chat ID:', message.chat.id);
    console.log('   📝 Nombre del chat:', message.chat.title || 'Chat privado');
    console.log('   👤 De:', message.from?.first_name || 'Desconocido');
    console.log('   📝 Texto:', message.text || 'Sin texto');
    console.log('   🔍 Tipo de chat:', message.chat.type);
    console.log('   🔍 Es grupo:', message.chat.type === 'group' || message.chat.type === 'supergroup');
    console.log('');
    
    // Si es el grupo VIP ORO
    if (message.chat.title === 'VIP ORO') {
        console.log('🎯 ¡GRUPO VIP ORO ENCONTRADO!');
        console.log('💾 Agrega este ID a config.js:');
        console.log(`   CHANNEL_ID: ${message.chat.id}`);
        console.log('');
    }
});

console.log('⏳ Esperando mensajes del grupo VIP ORO...');
console.log('📢 Envía un mensaje en el grupo VIP ORO para obtener su ID');
console.log('🛑 Presiona Ctrl+C para detener');
console.log('');

// Manejar salida limpia
process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo script...');
    telegramBot.stopPolling();
    process.exit(0);
}); 