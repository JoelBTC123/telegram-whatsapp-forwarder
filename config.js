module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7938128906:AAE8mBqLVmbP3tv6i08fDJ_LsUYRJfFZt50',
    BOT_CONFIG: {
        polling: true,
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
    }
};
