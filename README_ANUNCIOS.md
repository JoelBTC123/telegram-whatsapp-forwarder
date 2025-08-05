# 📢 Configuración de Reenvío de Anuncios

## 🎯 ¿Qué hace esta funcionalidad?

Esta nueva funcionalidad permite reenviar automáticamente mensajes desde un **grupo privado de Telegram** al **grupo de anuncios de tu comunidad en WhatsApp**.

## 📋 Pasos para configurar

### 1. Obtener información de los grupos

Primero, necesitas obtener la información de los grupos:

```bash
# Obtener grupos de Telegram
node getGroupInfo.js --telegram

# Obtener grupos de WhatsApp  
node getGroupInfo.js --whatsapp

# Obtener ambos
node getGroupInfo.js --all
```

### 2. Configurar el archivo config.js

Edita el archivo `config.js` y actualiza la sección `ANNOUNCEMENTS`:

```javascript
ANNOUNCEMENTS: {
    enabled: true, // Activar/desactivar esta funcionalidad
    source_group: {
        telegram_name: 'NOMBRE_DEL_GRUPO_PRIVADO', // ⚠️ CAMBIAR: Nombre exacto del grupo privado de Telegram
        telegram_id: null // Se detectará automáticamente
    },
    destination_group: {
        whatsapp_id: 'ID_DEL_GRUPO_ANUNCIOS@g.us', // ⚠️ CAMBIAR: ID del grupo de anuncios de WhatsApp
        whatsapp_name: '📢 Anuncios de la Comunidad' // ⚠️ CAMBIAR: Nombre del grupo de anuncios
    },
    settings: {
        add_prefix: true, // Agregar prefijo "[ANUNCIO]" al mensaje
        prefix_text: '📢 [ANUNCIO]',
        forward_media: true, // Reenviar imágenes, videos, documentos
        forward_replies: false, // No reenviar respuestas a mensajes
        allowed_users: [], // Lista de IDs de usuarios autorizados (opcional)
        require_confirmation: false // Requerir confirmación antes de reenviar
    }
}
```

### 3. Ejemplo de configuración completa

```javascript
ANNOUNCEMENTS: {
    enabled: true,
    source_group: {
        telegram_name: 'Grupo Privado de Anuncios',
        telegram_id: null
    },
    destination_group: {
        whatsapp_id: '120363419423815961@g.us',
        whatsapp_name: '📢 Anuncios de la Comunidad'
    },
    settings: {
        add_prefix: true,
        prefix_text: '📢 [ANUNCIO]',
        forward_media: true,
        forward_replies: false,
        allowed_users: [], // Dejar vacío para permitir a todos
        require_confirmation: false
    }
}
```

## 🔧 Opciones de configuración

### Configuración básica
- `enabled`: Activa o desactiva la funcionalidad
- `source_group.telegram_name`: Nombre exacto del grupo privado de Telegram
- `destination_group.whatsapp_id`: ID del grupo de WhatsApp donde se enviarán los anuncios

### Configuración avanzada
- `add_prefix`: Agrega un prefijo al mensaje (ej: "📢 [ANUNCIO]")
- `prefix_text`: Texto del prefijo personalizable
- `forward_media`: Reenvía imágenes, videos y documentos
- `forward_replies`: Reenvía respuestas a mensajes (por defecto: false)
- `allowed_users`: Lista de IDs de usuarios autorizados (vacío = todos)
- `require_confirmation`: Requiere confirmación antes de reenviar

## 🚀 Cómo funciona

1. **El bot detecta mensajes** en el grupo privado de Telegram especificado
2. **Verifica permisos** (si se configuraron usuarios autorizados)
3. **Procesa el mensaje** (texto, imágenes, etc.)
4. **Agrega prefijo** si está habilitado
5. **Reenvía automáticamente** al grupo de anuncios de WhatsApp

## 📝 Ejemplo de uso

1. Envía un mensaje en el grupo privado de Telegram
2. El bot automáticamente lo reenvía al grupo de anuncios de WhatsApp
3. El mensaje aparecerá con el prefijo "📢 [ANUNCIO]" (si está habilitado)

## 🔒 Seguridad

- **Usuarios autorizados**: Puedes especificar qué usuarios pueden enviar anuncios
- **Sin respuestas**: Por defecto no reenvía respuestas a mensajes
- **Prefijo identificativo**: Los anuncios se identifican claramente

## 🛠️ Solución de problemas

### El bot no detecta el grupo
- Verifica que el nombre del grupo en `config.js` sea exacto
- Asegúrate de que el bot esté agregado al grupo
- Envía un mensaje en el grupo para que aparezca en la lista

### No se reenvían los mensajes
- Verifica que `enabled: true` en la configuración
- Confirma que el ID del grupo de WhatsApp sea correcto
- Revisa los logs del bot para ver errores específicos

### Error de permisos
- Si configuraste `allowed_users`, verifica que el ID del usuario esté incluido
- Para obtener el ID de un usuario, puedes usar el bot @userinfobot en Telegram

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del bot en la consola
2. Que todos los IDs y nombres sean correctos
3. Que el bot tenga permisos en ambos grupos 