# 🤖 Bot de Reenvío Telegram → WhatsApp

Bot automatizado para reenviar mensajes de canales de Telegram a grupos de WhatsApp.

## 📋 Características

- ✅ Reenvío automático de mensajes de texto
- ✅ Reenvío de imágenes con texto
- ✅ Detección automática de grupos configurados
- ✅ Manejo robusto de errores y reconexión
- ✅ Health check automático
- ✅ Monitoreo de salud del bot
- ✅ Reinicio automático en caso de fallos

## 🚀 Instalación y Uso

### Variables de Entorno

```bash
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_USER_ID=tu_id_de_usuario
```

### Comandos Disponibles

```bash
# Iniciar bot
npm start

# Ejecutar monitor de salud
npm run monitor

# Modo desarrollo
npm run dev
```

## 📊 Monitoreo

### Health Check
- URL: `http://localhost:8080/`
- Verifica que el bot esté funcionando correctamente

### QR Code
- URL: `http://localhost:8080/qr`
- Muestra el código QR para conectar WhatsApp

### Logs de Railway
Los logs muestran el estado del bot en tiempo real:

```
📢 Post de canal recibido de: VIP ORO
✅ Grupo configurado detectado en channel_post: VIP ORO
📤 Reenviando mensaje a 🎖️VIP GOLD...
   📝 Texto: 90 PIPS HOY!...
   ✅ Texto reenviado a 🎖️VIP GOLD exitosamente
```

## 🔧 Solución de Problemas

### Error: ETIMEDOUT
**Síntoma**: `❌ Error de polling: EFATAL: Error: read ETIMEDOUT`

**Solución**: 
- El bot ahora maneja automáticamente los timeouts
- Reintenta la conexión cada 10 segundos
- No requiere intervención manual

### Error: Conflicto de Polling
**Síntoma**: `⚠️ Conflicto de polling detectado, reiniciando en 5 segundos...`

**Solución**:
- El bot se reinicia automáticamente
- Normalmente se resuelve solo
- Si persiste, Railway reiniciará el contenedor

### Mensajes Vacíos
**Síntoma**: `⚠️ No se encontró texto ni imagen para reenviar`

**Causa**: El mensaje original no contiene texto ni imagen
**Solución**: Es normal, el bot simplemente ignora estos mensajes

### WhatsApp Desconectado
**Síntoma**: `📱 WhatsApp desconectado: [razón]`

**Solución**:
- El bot intentará reconectar automáticamente
- Escanea el nuevo código QR si es necesario
- Revisa la URL `/qr` para el nuevo código

## 📱 Grupos Configurados

| Canal Telegram | Grupo WhatsApp |
|----------------|----------------|
| VIP ORO | 🎖️VIP GOLD |
| VIP CRYPTO | 🎖️VIP CRYPTO |
| VIP FOREX | 🎖️VIP FOREX |

## 🔄 Reinicio Automático

El bot incluye varias capas de reinicio automático:

1. **Manejo de errores de polling**: Reintenta automáticamente
2. **Monitor de salud**: Verifica cada minuto
3. **Railway**: Reinicia el contenedor si falla
4. **Señales del sistema**: Manejo graceful de SIGINT/SIGTERM

## 📈 Estado del Bot

### Indicadores de Estado

- `💓 Heartbeat`: Bot funcionando correctamente
- `✅`: Operación exitosa
- `⚠️`: Advertencia (no crítico)
- `❌`: Error (se maneja automáticamente)
- `🔄`: Reinicio/reconexión en progreso

### Logs Importantes

```bash
# Bot iniciado correctamente
🎉 Bot iniciado correctamente!
📱 Escanea el código QR que aparecerá arriba

# WhatsApp conectado
✅ WhatsApp conectado correctamente!
🎉 Bot iniciado correctamente!

# Mensaje reenviado exitosamente
✅ Texto reenviado a 🎖️VIP GOLD exitosamente
```

## 🛠️ Configuración Avanzada

### Modificar Grupos
Edita `config.js` para agregar o modificar grupos:

```javascript
GROUPS: {
    'NUEVO GRUPO': {
        telegram_name: 'NUEVO GRUPO',
        whatsapp_id: 'ID_DEL_GRUPO_WHATSAPP@g.us',
        whatsapp_name: 'Nombre del Grupo WhatsApp'
    }
}
```

### Ajustar Timeouts
Modifica los valores en `config.js`:

```javascript
polling: {
    interval: 300,        // Intervalo de polling (ms)
    timeout: 30,          // Timeout de requests
    retryTimeout: 10000   // Tiempo entre reintentos
}
```

## 📞 Soporte

Si encuentras problemas persistentes:

1. Revisa los logs en Railway
2. Verifica que el token de Telegram sea válido
3. Asegúrate de que WhatsApp esté conectado
4. El bot se recupera automáticamente de la mayoría de errores

---

**Nota**: Este bot está optimizado para Railway y maneja automáticamente la mayoría de errores comunes. Los reinicios automáticos son normales y no indican un problema grave. 