const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Diagnóstico completo del bot...');
console.log('');

// Crear instancia del bot de Telegram
const telegramBot = new TelegramBot('7356435225:AAE_crZ_JHcUej-3tN3l0qf1zmCb5kCx5Js', {
    polling: true,
    parse_mode: 'HTML'
});

// Función para obtener información del bot
async function getBotInfo() {
    try {
        const me = await telegramBot.getMe();
        console.log('✅ Información del bot:');
        console.log('   👤 Nombre:', me.first_name);
        console.log('   🔗 Username:', me.username);
        console.log('   🆔 ID:', me.id);
        console.log('');
    } catch (error) {
        console.error('❌ Error al obtener información del bot:', error.message);
    }
}

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
    console.log('   🔍 Es privado:', message.chat.type === 'private');
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

console.log('📋 INSTRUCCIONES DE DIAGNÓSTICO:');
console.log('');
console.log('1. 🔍 Verificar que el bot esté en el grupo:');
console.log('   - Ve al grupo "VIP ORO"');
console.log('   - Busca @tradifyvip_bot en la lista de miembros');
console.log('   - Si no está, agrégalo');
console.log('');
console.log('2. 🔍 Verificar permisos del bot:');
console.log('   - Configuración del grupo → Administradores');
console.log('   - El bot debe tener permisos de administrador');
console.log('   - Debe tener permiso para "Leer mensajes"');
console.log('');
console.log('3. 🔍 Probar con comandos:');
console.log('   - Envía /start en el grupo');
console.log('   - Envía /help en el grupo');
console.log('');
console.log('4. 🔍 Probar con mensaje normal:');
console.log('   - Envía cualquier mensaje en el grupo');
console.log('');
console.log('⏳ Esperando mensajes...');
console.log('🛑 Presiona Ctrl+C para detener');
console.log('');

// Obtener información del bot
getBotInfo();

// Manejar salida limpia
process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo diagnóstico...');
    telegramBot.stopPolling();
    process.exit(0);
}); 