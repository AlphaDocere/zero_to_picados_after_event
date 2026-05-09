# Guía de Deploy en Vercel

## Paso 1: Conectar Repositorio GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Log in con tu cuenta (o crea una)
3. Haz clic en "New Project"
4. Busca el repositorio `AlphaDocere/zero_to_agent_animomemtro`
5. Selecciona "Import"

## Paso 2: Configurar Variables de Entorno

En Vercel, durante el import o después en Settings:

**Sección: Environment Variables**

Agrega estas 9 variables (son PRIVADAS y no se expondrán al cliente):

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = zero-to-agent-interface.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://zero-to-agent-interface-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = zero-to-agent-interface
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = zero-to-agent-interface.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 304353011330
NEXT_PUBLIC_FIREBASE_APP_ID = 1:304353011330:web:61e9ac08abbf9479c2f69b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-2EDRCN2F3N
DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/1500625497212715229/1ZNDVI_9jUBUZiqjRIMoRQxHjHFwH6xpZHI7YbEIOHB74PJ5yfHZMyuB5GsEGEeCKKYr
```

**NOTA**: Las variables con `NEXT_PUBLIC_` son públicas (se exponen al cliente). El webhook es privado.

## Paso 3: Deploy

1. Haz clic en "Deploy"
2. Vercel empezará a compilar automáticamente
3. Espera a que termine (2-3 minutos)
4. Tu app estará en vivo en: `https://[proyecto].vercel.app`

## Paso 4: Configurar Dominio (Opcional)

En Settings → Domains, puedes agregar tu dominio personalizado.

## Actualizaciones Futuras

Cada vez que hagas push a `main` en GitHub, Vercel desplegará automáticamente.

Para cambiar credenciales:
1. Ve a Vercel → Settings → Environment Variables
2. Actualiza las variables
3. El deploy se hará automáticamente
4. Actualiza también `.env.local` en tu desarrollo local

## Rollback

Si algo sale mal, puedes revertir a una versión anterior en Vercel → Deployments → Select Previous

## Monitoreo

- **Logs**: Vercel → Deployments → Click en deploy → Logs
- **Analytics**: Vercel → Analytics (si lo habilitas)
- **Performance**: Vercel proporciona métricas automáticas

## Si hay errores durante el deploy

1. Revisa los logs en Vercel (Deployments tab)
2. Busca mensajes de error
3. Verifica que todas las variables de entorno estén correctas
4. Asegúrate de que `.env.local` NO está commiteado a GitHub
5. Si persiste, revisa la consola local: `pnpm build` para replicar el error

## Stack que está deployado

- **Framework**: Next.js 16
- **Database**: Firebase RTDB
- **Notifications**: Discord Webhook
- **Frontend**: React 19, Tailwind CSS v4
- **Hosting**: Vercel (serverless)
- **CDN**: Vercel Edge Network

## Después del Deploy

1. Prueba los 9 pasos del flujo de check-in
2. Prueba compartir a Discord
3. Verifica la página `/harvest`
4. Verifica la página `/dashboard`
