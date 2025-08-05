const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 BUSCANDO EL CANAL DE ANNOUNCEMENTS EN LA COMUNIDAD DE TRADIFY...');
console.log('');

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        clientId: 'telegram-whatsapp-bot',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

// Evento QR
whatsappClient.on('qr', (qr) => {
    console.log('📱 Escanea este QR para conectar WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento ready
whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp conectado!');
    console.log('');
    
    try {
        const chats = await whatsappClient.getChats();
        
        console.log('🔍 BUSCANDO TODOS LOS GRUPOS Y CANALES...');
        console.log('');
        
        // Buscar todos los grupos que puedan ser canales de anuncios
        const possibleAnnouncementGroups = chats.filter(chat => 
            chat.isGroup && (
                chat.name.toLowerCase().includes('announcement') ||
                chat.name.toLowerCase().includes('anuncio') ||
                chat.name.toLowerCase().includes('📢') ||
                chat.name.toLowerCase().includes('🔔') ||
                chat.name.toLowerCase().includes('📣') ||
                chat.name.toLowerCase().includes('comunidad') ||
                chat.name.toLowerCase().includes('community')
            )
        );
        
        console.log(`📋 Encontrados ${possibleAnnouncementGroups.length} posibles canales de anuncios:`);
        console.log('');
        
        for (const chat of possibleAnnouncementGroups) {
            console.log(`📱 ${chat.name}`);
            console.log(`   ID: ${chat.id._serialized}`);
            console.log(`   Tipo: ${chat.isGroup ? 'Grupo' : 'Chat'}`);
            console.log('');
        }
        
        // Buscar grupos de TRADIFY específicamente
        const tradifyGroups = chats.filter(chat => 
            chat.isGroup && chat.name.includes('TRADIFY')
        );
        
        console.log(`📋 Encontrados ${tradifyGroups.length} grupos de TRADIFY:`);
        console.log('');
        
        for (const chat of tradifyGroups) {
            console.log(`📱 ${chat.name}`);
            console.log(`   ID: ${chat.id._serialized}`);
            console.log('');
        }
        
        console.log('🔍 INSTRUCCIONES DETALLADAS PARA ENCONTRAR EL CANAL DE ANNOUNCEMENTS:');
        console.log('');
        console.log('1. 📱 Ve a WhatsApp en tu teléfono');
        console.log('2. 🔍 Busca tu comunidad de TRADIFY');
        console.log('3. 👆 Toca en la comunidad para abrirla');
        console.log('4. 📋 Busca la sección "Announcements" o "Anuncios"');
        console.log('5. 👆 Toca en esa sección');
        console.log('');
        console.log('💡 POSIBLES ESCENARIOS:');
        console.log('');
        console.log('A) Si aparece como un grupo separado:');
        console.log('   - Agrega el bot a ese grupo');
        console.log('   - Ejecuta este script de nuevo');
        console.log('');
        console.log('B) Si NO aparece como grupo separado:');
        console.log('   - El canal de Announcements está dentro de la comunidad');
        console.log('   - La API de WhatsApp Web no puede acceder a él directamente');
        console.log('   - Necesitaremos usar uno de los grupos TRADIFY existentes');
        console.log('');
        console.log('🔧 SOLUCIÓN ALTERNATIVA:');
        console.log('Si no encontramos el canal específico, podemos usar uno de estos grupos:');
        console.log('');
        tradifyGroups.forEach((chat, index) => {
            console.log(`${index + 1}. ${chat.name} (${chat.id._serialized})`);
        });
        console.log('');
        console.log('¿Quieres que configuremos el bot para usar uno de estos grupos?');
        
        // Cerrar conexión
        await whatsappClient.destroy();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error obteniendo información:', error.message);
        await whatsappClient.destroy();
        process.exit(1);
    }
});

// Inicializar WhatsApp
whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
    process.exit(1);
}); 