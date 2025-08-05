const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('📢 Creando grupo de anuncios en WhatsApp...');
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
        // Crear un grupo de anuncios
        const groupName = '📢 TRADIFY Announcements';
        const participants = []; // Sin participantes iniciales
        
        console.log(`📢 Creando grupo: ${groupName}`);
        
        const group = await whatsappClient.createGroup(groupName, participants);
        
        console.log('✅ Grupo creado exitosamente!');
        console.log(`📱 Nombre: ${group.name}`);
        console.log(`🆔 ID: ${group.id._serialized}`);
        console.log(`👥 Participantes: ${group.participantsCount || 0}`);
        console.log('');
        console.log('🎯 Ahora puedes:');
        console.log('1. Agregar miembros al grupo');
        console.log('2. Configurar el bot para enviar anuncios aquí');
        console.log('3. Usar este ID en la configuración:');
        console.log(`   whatsapp_id: '${group.id._serialized}'`);
        
        // Cerrar conexión
        await whatsappClient.destroy();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creando grupo:', error.message);
        await whatsappClient.destroy();
        process.exit(1);
    }
});

// Inicializar WhatsApp
whatsappClient.initialize().catch((error) => {
    console.error('❌ Error inicializando WhatsApp:', error.message);
    process.exit(1);
}); 