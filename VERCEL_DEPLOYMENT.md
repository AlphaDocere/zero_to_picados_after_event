# Guía de Deployment a Vercel - Reflect App

## Prerequisitos
- Proyecto en GitHub
- Cuenta en Vercel
- Credenciales Firebase (8 variables de entorno)

## Paso 1: Preparar el Proyecto Localmente

### Verificar que todo está configurado correctamente

```bash
# 1. Asegurate que tienes .env.local con tus credenciales locales
cat .env.local

# 2. Verifica que .gitignore contiene .env.local
grep "\.env\.local" .gitignore

# 3. Build local debe funcionar
pnpm build

# 4. Dev server funciona
pnpm dev
```

### Estructura correcta:
```
proyecto/
├── .env.local               ← NUNCA se commitea (tu máquina)
├── .env.local.example       ← SÍ se commitea (referencia)
├── .gitignore               ← contiene .env.local
└── lib/firebase.ts          ← Lee de process.env.NEXT_PUBLIC_*
```

## Paso 2: Push a GitHub

```bash
# Asegurate que .env.local NO está en staging
git status  # No debe aparecer .env.local

# Commit y push (sin credenciales)
git add .
git commit -m "Add reflect app with env setup"
git push origin main
```

## Paso 3: Conectar a Vercel

### Opción A: Desde Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Click en "Add New..." → "Project"
3. Importa tu repo de GitHub
4. Selecciona el branch (main)
5. **NO clickees Deploy todavía** - continúa a Paso 4

### Opción B: Desde CLI

```bash
npm i -g vercel
vercel link          # Conecta al proyecto
vercel env pull      # Descarga vars existentes (si hay)
```

## Paso 4: Agregar Variables de Entorno en Vercel

**En Vercel Dashboard:**

1. Project Settings (engranaje arriba a la derecha)
2. → Environment Variables (lado izquierdo)
3. Click "Add New" para cada variable:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `zero-to-agent-interface.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://zero-to-agent-interface-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `zero-to-agent-interface` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `zero-to-agent-interface.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `304353011330` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:304353011330:web:61e9ac08abbf9479c2f69b` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-2EDRCN2F3N` |

### Configuración por Ambiente (Recomendado):

Para cada variable, selecciona:
- ✅ Production
- ✅ Preview
- ✅ Development

Esto asegura que todas las variables estén disponibles en todos los ambientes.

## Paso 5: Deploy

### Opción A: Dashboard
1. Vuelve a "Deployments"
2. Click "Deploy Now"
3. Espera a que compile (2-3 min)

### Opción B: CLI
```bash
vercel deploy --prod
```

## Paso 6: Verificar Deployment

1. Dashboard → Deployments → Click en el deployment exitoso
2. Abre la URL proporcionada
3. Verifica que Firebase funciona:
   - La app carga sin errores
   - Puedes hacer un check-in
   - Los datos se guardan en Firebase RTDB

### Troubleshooting - Si no funciona:

**Error: "Firebase config is invalid"**
→ Verifica que todas las 8 variables están en Vercel Settings → Environment Variables

**Error: "Cannot read property of undefined"**
→ Una variable no está configurada. Compara con `.env.local.example`

**Error: "CORS error"**
→ Firebase RTDB rules pueden estar restrictivas. Verifica en Firebase Console

## Paso 7: Configurar Auto-Deployments (Opcional)

En Vercel Dashboard → Project Settings → Git:
- Auto-deploy on commit: ✅ Habilitado por defecto
- Automatic deployments from push: ✅ 
- Cancel deployments on push: ✅

Ahora cada push a main deploya automáticamente.

## Paso 8: Monitoreo en Producción

### Dashboard de Vercel:
- Deployments: historial de deploys
- Logs: errores en tiempo real
- Analytics: performance

### Firebase Console:
- Realtime Database → Datos
- Verifica que se guardan sesiones
- Monitorea lecturas/escrituras

## Actualizar Variables en Vercel

Si en el futuro cambias las credenciales Firebase:

1. Firebase Console → Project Settings → Copias nuevas credenciales
2. Vercel Dashboard → Environment Variables → Edita cada una
3. Click "Save"
4. Redeploy automático se dispara

```bash
# O desde CLI:
vercel env pull      # Descarga vars actuales
vercel deploy --prod # Redeploy
```

## Variables de Seguridad - Resumen

**NUNCA en código:**
```javascript
// ❌ MAL - Credenciales hardcodeadas
const firebaseConfig = {
  apiKey: "AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA"
}
```

**SÍ en .env.local (local):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA
```

**SÍ en Vercel Settings (producción):**
```
Environment Variables → NEXT_PUBLIC_FIREBASE_API_KEY = [valor]
```

**Código correcto:**
```javascript
// ✅ BIEN - Lee de variables de entorno
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
```

## Checklist Final

- [ ] `.env.local` está en `.gitignore`
- [ ] `.env.local.example` está commiteado
- [ ] Proyecto está en GitHub
- [ ] Vercel conectado al repo
- [ ] 8 variables Firebase en Vercel Environment Variables
- [ ] Auto-deploy habilitado
- [ ] Deployment exitoso ✅
- [ ] Firebase RTDB recibe datos en producción ✅

---

**Dudas o problemas?** → Revisa los logs en Vercel Dashboard → Deployments → Click el deployment y ve "Logs"
