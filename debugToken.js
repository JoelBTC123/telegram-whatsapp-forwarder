const config = require('./config');

console.log('🔍 Debug: Verificando token...');
console.log('');

console.log('1. Token desde config.js:');
console.log(`   ${config.TELEGRAM_BOT_TOKEN}`);
console.log('');

console.log('2. Variables de entorno:');
console.log(`   TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN || 'NO DEFINIDA'}`);
console.log('');

console.log('3. Token que se usará (config.TELEGRAM_BOT_TOKEN):');
const tokenToUse = config.TELEGRAM_BOT_TOKEN;
console.log(`   ${tokenToUse}`);
console.log('');

console.log('4. Verificando si es el token correcto...');
if (tokenToUse === '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50') {
    console.log('✅ Token correcto (fowardtradify_bot)');
} else if (tokenToUse === '7882094257:AAH_YYeIbE3k5upSs6L-r5R1Tibl5kihh1o') {
    console.log('❌ Token incorrecto (solvolume_bot)');
} else {
    console.log('❓ Token desconocido');
} 