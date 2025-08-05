const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

console.log('🔍 Debug: Escuchando todos los mensajes de Telegram...');
console.log('');

// Token del bot de Telegram
const TELEGRAM_TOKEN = config.TELEGRAM_BOT_TOKEN;

// Crear bot de Telegram
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { 
    polling: true,
    parse_mode: 'HTML'
});

// Configurar escucha de Telegram
console.log('📢 Configurando escucha de Telegram...');

telegramBot.on('message', async (message) => {
    console.log('='.repeat(50));
    console.log(`📨 MENSAJE RECIBIDO:`);
    console.log(`   👤 Usuario: ${message.from.first_name} ${message.from.last_name || ''}`);
    console.log(`   🆔 User ID: ${message.from.id}`);
    console.log(`   💬 Chat: ${message.chat.title || message.chat.first_name}`);
    console.log(`   🆔 Chat ID: ${message.chat.id}`);
    console.log(`   📝 Tipo: ${message.chat.type}`);
    console.log(`   📄 Texto: ${message.text || message.caption || 'Sin texto'}`);
    console.log(`   🖼️ Tiene foto: ${!!message.photo}`);
    console.log(`   📎 Tiene documento: ${!!message.document}`);
    console.log(`   🎥 Tiene video: ${!!message.video}`);
    console.log('');
    
    // Verificar si coincide con el grupo configurado
    const expectedGroup = config.ANNOUNCEMENTS.source_group.telegram_name;
    const actualGroup = message.chat.title;
    
    console.log(`🔍 COMPARACIÓN:`);
    console.log(`   Esperado: "${expectedGroup}"`);
    console.log(`   Recibido: "${actualGroup}"`);
    console.log(`   Coincide: ${expectedGroup === actualGroup ? '✅ SÍ' : '❌ NO'}`);
    console.log('='.repeat(50));
    console.log('');
});

// Escuchar también posts de canal
telegramBot.on('channel_post', async (post) => {
    console.log('='.repeat(50));
    console.log(`📢 POST DE CANAL RECIBIDO:`);
    console.log(`   💬 Chat: ${post.chat.title}`);
    console.log(`   🆔 Chat ID: ${post.chat.id}`);
    console.log(`   📝 Tipo: ${post.chat.type}`);
    console.log(`   📄 Texto: ${post.text || post.caption || 'Sin texto'}`);
    console.log(`   🖼️ Tiene foto: ${!!post.photo}`);
    console.log(`   📎 Tiene documento: ${!!post.document}`);
    console.log(`   🎥 Tiene video: ${!!post.video}`);
    console.log('');
    
    // Verificar si coincide con el grupo configurado
    const expectedGroup = config.ANNOUNCEMENTS.source_group.telegram_name;
    const actualGroup = post.chat.title;
    
    console.log(`🔍 COMPARACIÓN:`);
    console.log(`   Esperado: "${expectedGroup}"`);
    console.log(`   Recibido: "${actualGroup}"`);
    console.log(`   Coincide: ${expectedGroup === actualGroup ? '✅ SÍ' : '❌ NO'}`);
    console.log('='.repeat(50));
    console.log('');
});

// Escuchar posts editados de canal
telegramBot.on('edited_channel_post', async (post) => {
    console.log('='.repeat(50));
    console.log(`✏️ POST EDITADO DE CANAL RECIBIDO:`);
    console.log(`   💬 Chat: ${post.chat.title}`);
    console.log(`   🆔 Chat ID: ${post.chat.id}`);
    console.log(`   📝 Tipo: ${post.chat.type}`);
    console.log(`   📄 Texto: ${post.text || post.caption || 'Sin texto'}`);
    console.log(`   🖼️ Tiene foto: ${!!post.photo}`);
    console.log(`   📎 Tiene documento: ${!!post.document}`);
    console.log(`   🎥 Tiene video: ${!!post.video}`);
    console.log('');
    
    // Verificar si coincide con el grupo configurado
    const expectedGroup = config.ANNOUNCEMENTS.source_group.telegram_name;
    const actualGroup = post.chat.title;
    
    console.log(`🔍 COMPARACIÓN:`);
    console.log(`   Esperado: "${expectedGroup}"`);
    console.log(`   Recibido: "${actualGroup}"`);
    console.log(`   Coincide: ${expectedGroup === actualGroup ? '✅ SÍ' : '❌ NO'}`);
    console.log('='.repeat(50));
    console.log('');
});

console.log('✅ Debug configurado. Envía mensajes en cualquier grupo/canal para ver la información.');
console.log(`🎯 Grupo esperado: "${config.ANNOUNCEMENTS.source_group.telegram_name}"`);
console.log('');

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('🛑 Cerrando debug...');
    telegramBot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Cerrando debug...');
    telegramBot.stopPolling();
    process.exit(0);
}); 