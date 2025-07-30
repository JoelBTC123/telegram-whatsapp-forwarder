const TelegramBot = require('node-telegram-bot-api');

// Usar el token del bot
const bot = new TelegramBot('7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50', { polling: false });

console.log('📱 Para obtener tu ID de Telegram:');
console.log('');
console.log('1. Envía un mensaje al bot: @fowardtradify_bot');
console.log('2. Cualquier mensaje servirá (hola, test, etc.)');
console.log('3. Ejecuta este script después de enviar el mensaje');
console.log('');
console.log('O si ya tienes tu ID, puedes usarlo directamente.');
console.log('');

// Función para obtener el ID del usuario
async function getUserId() {
    try {
        const updates = await bot.getUpdates();
        if (updates.length > 0) {
            const lastUpdate = updates[updates.length - 1];
            if (lastUpdate.message) {
                const userId = lastUpdate.message.from.id;
                const username = lastUpdate.message.from.username || 'Sin username';
                const firstName = lastUpdate.message.from.first_name;
                
                console.log('✅ ID encontrado:');
                console.log(`   👤 Nombre: ${firstName}`);
                console.log(`   🔗 Username: @${username}`);
                console.log(`   🆔 ID: ${userId}`);
                console.log('');
                console.log('📋 Copia este ID para usarlo en el bot principal');
                return userId;
            }
        }
        console.log('❌ No se encontraron mensajes recientes');
        console.log('   Envía un mensaje al bot y vuelve a ejecutar este script');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getUserId(); 