const TelegramBot = require('node-telegram-bot-api');

// Usar el mismo token que el bot principal
const token = '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50';
const bot = new TelegramBot(token, { polling: false });

console.log('🔍 Obteniendo tu ID de Telegram...');
console.log('');

async function getUserId() {
    try {
        const updates = await bot.getUpdates();
        console.log(`📊 Mensajes encontrados: ${updates.length}`);
        
        if (updates.length > 0) {
            // Mostrar los últimos 5 mensajes
            const recentMessages = updates.slice(-5);
            
            console.log('📱 Mensajes recientes:');
            recentMessages.forEach((update, index) => {
                if (update.message) {
                    const msg = update.message;
                    console.log(`   ${index + 1}. ID: ${msg.from.id} | Nombre: ${msg.from.first_name} | Username: @${msg.from.username || 'Sin username'} | Mensaje: "${msg.text}"`);
                }
            });
            
            // Mostrar el ID del último mensaje
            const lastMessage = recentMessages[recentMessages.length - 1];
            if (lastMessage && lastMessage.message) {
                const userId = lastMessage.message.from.id;
                const username = lastMessage.message.from.username || 'Sin username';
                const firstName = lastMessage.message.from.first_name;
                
                console.log('');
                console.log('✅ Tu ID de Telegram:');
                console.log(`   👤 Nombre: ${firstName}`);
                console.log(`   🔗 Username: @${username}`);
                console.log(`   🆔 ID: ${userId}`);
                console.log('');
                console.log('📋 Copia este ID para usarlo en el bot principal');
                return userId;
            }
        } else {
            console.log('❌ No se encontraron mensajes');
            console.log('   Envía un mensaje al bot @fowardtradify_bot y vuelve a ejecutar');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getUserId(); 