# Telegram to WhatsApp Forwarding Bot

Bot para reenviar mensajes automáticamente desde grupos de Telegram a grupos de WhatsApp.

## 🚀 Características

- ✅ Reenvío automático de mensajes de texto
- ✅ Reenvío de imágenes con texto (caption)
- ✅ Soporte para múltiples grupos
- ✅ Configuración automática de grupos
- ✅ Mapeo personalizable Telegram → WhatsApp

## 📱 Grupos Configurados

- **VIP ORO** (Telegram) → **🎖️VIP GOLD** (WhatsApp)
- **VIP CRYPTO** (Telegram) → **🎖️VIP CRYPTO** (WhatsApp)
- **VIP FOREX** (Telegram) → **🎖️VIP FOREX** (WhatsApp)

## 🛠️ Instalación

1. **Clonar el repositorio:**
```bash
git clone <tu-repositorio>
cd FOWARD
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env
TELEGRAM_BOT_TOKEN=tu_token_aqui
```

4. **Ejecutar el bot:**
```bash
npm start
```

## 🔧 Configuración

### Variables de Entorno

- `TELEGRAM_BOT_TOKEN`: Token del bot de Telegram

### Configuración de Grupos

Edita `config.js` para modificar los grupos:

```javascript
GROUPS: {
    'VIP ORO': {
        telegram_name: 'VIP ORO',
        whatsapp_id: 'ID_DEL_GRUPO_WHATSAPP',
        whatsapp_name: '🎖️VIP GOLD'
    }
}
```

## 📋 Dependencias

- `node-telegram-bot-api`: API de Telegram
- `whatsapp-web.js`: API de WhatsApp Web
- `qrcode-terminal`: Generación de códigos QR

## 🚀 Despliegue

Este bot está configurado para desplegarse en Railway, Render, o cualquier plataforma que soporte Node.js.

## 📄 Licencia

MIT 