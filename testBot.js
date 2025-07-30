const TelegramBot = require('node-telegram-bot-api');

const token = '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50';
const bot = new TelegramBot(token, { polling: false });

console.log('🔍 Verificando token del bot...');
console.log('');

async function testBot() {
    try {
        const botInfo = await bot.getMe();
        console.log('✅ Token válido!');
        console.log(`👤 Nombre: ${botInfo.first_name}`);
        console.log(`🔗 Username: ${botInfo.username}`);
        console.log(`🆔 ID: ${botInfo.id}`);
        console.log('');
        
        if (botInfo.username === 'fowardtradify_bot') {
            console.log('🎯 ¡Bot correcto! Es fowardtradify_bot');
        } else {
            console.log('⚠️ Bot diferente al esperado');
            console.log(`   Esperado: fowardtradify_bot`);
            console.log(`   Actual: ${botInfo.username}`);
        }
        
    } catch (error) {
        console.error('❌ Error con el token:', error.message);
        console.log('');
        console.log('🔧 Posibles soluciones:');
        console.log('1. Verifica que el token sea correcto');
        console.log('2. Ve a @BotFather y obtén el token de fowardtradify_bot');
        console.log('3. Asegúrate de que el bot esté activo');
    }
}

testBot(); 