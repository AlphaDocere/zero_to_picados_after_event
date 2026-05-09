# Guía de Deploy a Vercel

## Antes de Deployar

### 1. Asegurar que .env.local NO se comitee
```bash
# Verificar que está en .gitignore
cat .gitignore  # Debe mostrar: .env*.local
```

### 2. Crear archivo de plantilla para otros devs
```bash
# Ya existe: .env.local.example
# Compartir con el equipo para que lo usen de referencia
```

## Deploy en Vercel Dashboard

### Opción A: Via Vercel Dashboard (Más fácil)

1. **Conecta el repo** en vercel.com
2. **Importa proyecto** desde GitHub
3. En **Settings → Environment Variables**, agrega:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = zero-to-agent-interface.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://zero-to-agent-interface-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = zero-to-agent-interface
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = zero-to-agent-interface.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 304353011330
NEXT_PUBLIC_FIREBASE_APP_ID = 1:304353011330:web:61e9ac08abbf9479c2f69b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-2EDRCN2F3N
```

4. **Deploy** → Vercel automáticamente hará `pnpm build && pnpm start`

### Opción B: Via Vercel CLI (Para avanzados)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Loguearte
vercel login

# 3. Deployar proyecto
vercel

# 4. Seguir el wizard para crear proyecto
```

## Post-Deploy

### ✅ Verificaciones

1. **Check-in form funciona**
   - Ir a `https://tu-proyecto.vercel.app`
   - Completar un check-in
   - Verificar que los datos se guardan en Firebase RTDB

2. **Dashboard de analytics funciona**
   - Ir a `https://tu-proyecto.vercel.app/dashboard`
   - Debe mostrar sesiones guardadas

3. **Monitorear logs**
   - En Vercel Dashboard → Deployments → View Details
   - Revisar logs de errores

## Troubleshooting

### Error: "Firebase config not found"
→ Verificar que las env vars están en Vercel Settings

### Error: "Cannot read from database"
→ Verificar que NEXT_PUBLIC_FIREBASE_DATABASE_URL es correcto
→ Verificar permisos en Firebase RTDB

### Error: "API endpoints not responding"
→ Revisar logs en Vercel → Function Logs
→ Asegurar que `/app/api/*` está bien

## Variables de Entorno Futuras

Para cuando agregues:
- **Groq API**: `NEXT_PUBLIC_GROQ_API_KEY`
- **Analytics**: `NEXT_PUBLIC_POSTHOG_KEY`
- **Otros servicios**: Mantener el patrón `NEXT_PUBLIC_SERVICE_*`

## Security Checklist

- [ ] `.env.local` NO está en Git
- [ ] `.env.local.example` está en Git (sin valores reales)
- [ ] Todas las variables NEXT_PUBLIC_* están en Vercel
- [ ] No hay credenciales en código
- [ ] Firebase RTDB tiene reglas de seguridad configuradas
