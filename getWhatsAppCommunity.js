const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 Obteniendo información de la comunidad de WhatsApp...');
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
        
        console.log('📋 TODOS LOS CHATS ENCONTRADOS:');
        console.log('');
        
        for (const chat of chats) {
            console.log(`📱 ${chat.name}`);
            console.log(`   ID: ${chat.id._serialized}`);
            console.log(`   Tipo: ${chat.isGroup ? 'Grupo' : chat.isChannel ? 'Canal' : 'Chat'}`);
            console.log(`   Es comunidad: ${chat.isCommunity || false}`);
            console.log(`   Participantes: ${chat.participantsCount || 'N/A'}`);
            
            // Si es una comunidad, intentar obtener más información
            if (chat.isCommunity) {
                console.log(`   🌟 ES UNA COMUNIDAD`);
                try {
                    // Intentar obtener información de la comunidad
                    const communityInfo = await chat.getCommunityInfo();
                    console.log(`   📢 Canales en la comunidad: ${communityInfo.channels?.length || 0}`);
                    
                    if (communityInfo.channels) {
                        console.log('   📢 Canales encontrados:');
                        communityInfo.channels.forEach((channel, index) => {
                            console.log(`      ${index + 1}. ${channel.name} (ID: ${channel.id})`);
                        });
                    }
                } catch (error) {
                    console.log(`   ⚠️ No se pudo obtener info detallada: ${error.message}`);
                }
            }
            
            console.log('');
        }
        
        // Buscar específicamente canales de anuncios
        console.log('🔍 BUSCANDO CANALES DE ANUNCIOS...');
        console.log('');
        
        const announcementChannels = chats.filter(chat => 
            chat.name.toLowerCase().includes('announcement') ||
            chat.name.toLowerCase().includes('anuncio') ||
            chat.name.toLowerCase().includes('📢')
        );
        
        if (announcementChannels.length > 0) {
            console.log('📢 Canales de anuncios encontrados:');
            announcementChannels.forEach(channel => {
                console.log(`   📢 ${channel.name}`);
                console.log(`   ID: ${channel.id._serialized}`);
                console.log(`   Tipo: ${channel.isGroup ? 'Grupo' : channel.isChannel ? 'Canal' : 'Chat'}`);
                console.log('');
            });
        } else {
            console.log('❌ No se encontraron canales específicos de anuncios');
            console.log('💡 Busca en tu comunidad de WhatsApp el canal de Announcements');
        }
        
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