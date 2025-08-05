module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50', // Token del fowardtradify_bot (bot principal)
    BOT_CONFIG: {
        polling: {
            interval: 300,
            autoStart: false,
            params: {
                timeout: 30
            }
        },
        parse_mode: 'HTML'
    },
    // Configuración de grupos Telegram → WhatsApp
    GROUPS: {
        'VIP ORO': {
            telegram_name: 'VIP ORO',
            whatsapp_id: '120363419423815961@g.us', // 🎖️VIP GOLD
            whatsapp_name: '🎖️VIP GOLD'
        },
        'VIP CRYPTO': {
            telegram_name: 'VIP CRYPTO',
            whatsapp_id: '120363400927670149@g.us', // 🎖️VIP CRYPTO
            whatsapp_name: '🎖️VIP CRYPTO'
        },
        'VIP FOREX': {
            telegram_name: 'VIP FOREX',
            whatsapp_id: '120363422032523154@g.us', // 🎖️VIP FOREX
            whatsapp_name: '🎖️VIP FOREX'
        }
    },
    // Configuración para reenvío de anuncios desde grupo privado
    ANNOUNCEMENTS: {
        enabled: true, // Activar/desactivar esta funcionalidad
        source_group: {
            telegram_name: '2', // Grupo privado de Telegram (canal "2")
            telegram_id: null // Se detectará automáticamente
        },
        destination_group: {
            whatsapp_id: '120363420341975737@g.us', // TRADIFY 🎖️ (primer grupo - para probar)
            whatsapp_name: 'TRADIFY 🎖️ (Grupo 1)' // Primer grupo de TRADIFY
        },
        // Grupo alternativo para probar
        alternative_group: {
            whatsapp_id: '120363418323166305@g.us', // TRADIFY 🎖️ (segundo grupo - para probar)
            whatsapp_name: 'TRADIFY 🎖️ (Grupo 2)' // Segundo grupo de TRADIFY
        },
        // Configuración adicional para anuncios
        settings: {
            add_prefix: false, // Agregar prefijo "[ANUNCIO]" al mensaje
            prefix_text: '', // Sin prefijo
            forward_media: true, // Reenviar imágenes, videos, documentos
            forward_replies: false, // No reenviar respuestas a mensajes
            allowed_users: [], // Lista de IDs de usuarios autorizados (opcional)
            require_confirmation: false // Requerir confirmación antes de reenviar
        }
    }
}; 