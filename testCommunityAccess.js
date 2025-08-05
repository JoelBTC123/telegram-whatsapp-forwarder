const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 Intentando acceder a la comunidad de TRADIFY...');
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
        
        console.log('🔍 BUSCANDO LA COMUNIDAD DE TRADIFY...');
        console.log('');
        
        // Buscar todos los grupos que contengan "TRADIFY"
        const tradifyGroups = chats.filter(chat => 
            chat.isGroup && chat.name.includes('TRADIFY')
        );
        
        console.log(`📋 Encontrados ${tradifyGroups.length} grupos de TRADIFY:`);
        console.log('');
        
        for (const chat of tradifyGroups) {
            console.log(`📱 ${chat.name}`);
            console.log(`   ID: ${chat.id._serialized}`);
            console.log(`   Participantes: ${chat.participantsCount || 'N/A'}`);
            
            // Intentar obtener información del grupo
            try {
                const participants = await chat.getParticipants();
                console.log(`   👥 Participantes reales: ${participants.length}`);
                
                // Buscar si hay algún participante que sea administrador
                const admins = participants.filter(p => p.isAdmin);
                console.log(`   👑 Administradores: ${admins.length}`);
                
                // Mostrar algunos participantes
                if (participants.length > 0) {
                    console.log(`   👤 Primeros 3 participantes:`);
                    participants.slice(0, 3).forEach((participant, index) => {
                        console.log(`      ${index + 1}. ${participant.id.user} (${participant.isAdmin ? 'Admin' : 'Miembro'})`);
                    });
                }
                
            } catch (error) {
                console.log(`   ⚠️ Error obteniendo participantes: ${error.message}`);
            }
            
            console.log('');
        }
        
        console.log('💡 INSTRUCCIONES PARA ENCONTRAR EL CANAL DE ANUNCIOS:');
        console.log('');
        console.log('1. Ve a WhatsApp en tu teléfono');
        console.log('2. Busca tu comunidad de TRADIFY');
        console.log('3. Dentro de la comunidad, busca la sección "Announcements"');
        console.log('4. Toca en esa sección para ver si es un grupo separado');
        console.log('5. Si es un grupo separado, agrega el bot a ese grupo');
        console.log('6. Luego ejecuta este script de nuevo para ver si aparece');
        console.log('');
        console.log('🔍 Si no aparece, puede ser que:');
        console.log('   - El canal de Announcements no sea un grupo separado');
        console.log('   - Necesitemos usar una API diferente');
        console.log('   - El bot necesite permisos especiales');
        
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