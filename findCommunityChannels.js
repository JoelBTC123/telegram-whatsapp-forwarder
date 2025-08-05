const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 Buscando canales dentro de la comunidad de WhatsApp...');
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
        
        console.log('🔍 BUSCANDO COMUNIDADES Y CANALES...');
        console.log('');
        
        // Buscar grupos que podrían ser comunidades
        const possibleCommunities = chats.filter(chat => 
            chat.isGroup && 
            (chat.name.includes('TRADIFY') || chat.name.includes('TRADAMAX'))
        );
        
        console.log(`📋 Encontrados ${possibleCommunities.length} posibles grupos de comunidad:`);
        console.log('');
        
        for (const chat of possibleCommunities) {
            console.log(`📱 ${chat.name}`);
            console.log(`   ID: ${chat.id._serialized}`);
            console.log(`   Tipo: ${chat.isGroup ? 'Grupo' : 'Otro'}`);
            console.log(`   Participantes: ${chat.participantsCount || 'N/A'}`);
            
            // Intentar obtener información detallada del grupo
            try {
                const groupInfo = await chat.getGroupInfo();
                console.log(`   📊 Información del grupo:`);
                console.log(`      Descripción: ${groupInfo.desc || 'Sin descripción'}`);
                console.log(`      Creado por: ${groupInfo.owner || 'N/A'}`);
                console.log(`      Invitación: ${groupInfo.inviteCode || 'N/A'}`);
                
                // Intentar obtener participantes
                const participants = await chat.getParticipants();
                console.log(`      Participantes: ${participants.length}`);
                
                // Buscar administradores
                const admins = participants.filter(p => p.isAdmin);
                console.log(`      Administradores: ${admins.length}`);
                
            } catch (error) {
                console.log(`   ⚠️ No se pudo obtener info detallada: ${error.message}`);
            }
            
            console.log('');
        }
        
        // Buscar específicamente canales o grupos con "announcement" en el nombre
        console.log('🔍 BUSCANDO CANALES DE ANUNCIOS...');
        console.log('');
        
        const announcementGroups = chats.filter(chat => 
            chat.isGroup && 
            (chat.name.toLowerCase().includes('announcement') ||
             chat.name.toLowerCase().includes('anuncio') ||
             chat.name.toLowerCase().includes('📢') ||
             chat.name.toLowerCase().includes('broadcast'))
        );
        
        if (announcementGroups.length > 0) {
            console.log('📢 Grupos de anuncios encontrados:');
            announcementGroups.forEach(group => {
                console.log(`   📢 ${group.name}`);
                console.log(`   ID: ${group.id._serialized}`);
                console.log(`   Participantes: ${group.participantsCount || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('❌ No se encontraron grupos específicos de anuncios');
            console.log('');
            console.log('💡 Para encontrar el canal de Announcements:');
            console.log('1. Ve a tu comunidad de WhatsApp');
            console.log('2. Busca la sección "Announcements" o "Anuncios"');
            console.log('3. Toca en esa sección para ver si es un grupo separado');
            console.log('4. Si es un grupo, agrega el bot a ese grupo');
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