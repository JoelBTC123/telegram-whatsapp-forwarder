const TelegramBot = require('node-telegram-bot-api');

// Usar el mismo token que el bot principal
const token = '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50';
const bot = new TelegramBot(token, { polling: false });

console.log('🔍 Probando recepción de mensajes...');
console.log('');

async function testMessages() {
    try {
        const updates = await bot.getUpdates();
        console.log(`📊 Total de mensajes: ${updates.length}`);
        
        if (updates.length > 0) {
            console.log('📱 Últimos mensajes:');
            const recentMessages = updates.slice(-10);
            
            recentMessages.forEach((update, index) => {
                if (update.message) {
                    const msg = update.message;
                    const chatType = msg.chat.type;
                    const chatTitle = msg.chat.title || 'Chat privado';
                    
                    console.log(`   ${index + 1}. Tipo: ${chatType} | Chat: ${chatTitle} | Usuario: ${msg.from.first_name} | Mensaje: "${msg.text}"`);
                } else if (update.channel_post) {
                    const post = update.channel_post;
                    const chatTitle = post.chat.title || 'Canal';
                    
                    console.log(`   ${index + 1}. Tipo: channel_post | Chat: ${chatTitle} | Mensaje: "${post.text}"`);
                }
            });
            
            // Verificar si hay mensajes de los grupos configurados
            const targetGroups = ['VIP ORO', 'VIP CRYPTO', 'VIP FOREX'];
            const groupMessages = recentMessages.filter(update => {
                if (update.message && update.message.chat.type === 'group') {
                    return targetGroups.includes(update.message.chat.title);
                }
                if (update.channel_post) {
                    return targetGroups.includes(update.channel_post.chat.title);
                }
                return false;
            });
            
            console.log('');
            console.log(`🎯 Mensajes de grupos objetivo: ${groupMessages.length}`);
            
            if (groupMessages.length > 0) {
                console.log('✅ ¡Se detectaron mensajes de los grupos configurados!');
            } else {
                console.log('❌ No se detectaron mensajes de los grupos objetivo');
                console.log('   Envía un mensaje en VIP ORO, VIP CRYPTO o VIP FOREX');
            }
        } else {
            console.log('❌ No hay mensajes recientes');
            console.log('   Envía un mensaje en cualquier grupo y vuelve a ejecutar');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testMessages(); 