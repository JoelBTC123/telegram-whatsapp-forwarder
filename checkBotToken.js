const TelegramBot = require('node-telegram-bot-api');

// Token actual
const CURRENT_TOKEN = '8253828996:AAFZSAjszXNdsDTyPw3_uHJIVSYzw9H8xT8';

console.log('🔍 Verificando token del bot...');
console.log('');

async function checkBot(token) {
    try {
        const bot = new TelegramBot(token, { polling: false });
        const botInfo = await bot.getMe();
        console.log('✅ Token válido:');
        console.log(`   Nombre: ${botInfo.first_name}`);
        console.log(`   Username: ${botInfo.username}`);
        console.log(`   ID: ${botInfo.id}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        return botInfo;
    } catch (error) {
        console.log('❌ Token inválido o error:');
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   Error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🔍 Verificando token actual...');
    await checkBot(CURRENT_TOKEN);
    
    console.log('');
    console.log('📝 Para usar @botize123123_bot, necesitas:');
    console.log('1. Obtener el token del bot @botize123123_bot');
    console.log('2. Actualizar la línea en config.js:');
    console.log(`   TELEGRAM_BOT_TOKEN: 'TOKEN_DEL_BOTIZE123123_BOT'`);
    console.log('');
    console.log('💡 El token se puede obtener de @BotFather en Telegram');
}

main().catch(console.error); 