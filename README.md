# Reflect - Zero to Picados After Event

Una aplicación de check-in emocional con integración Web3 en Solana Devnet, gestión dinámica de ciudades y noticias, todo potenciado por IA.

## Características Principales

### 🎯 Check-in Emocional (9 Pasos)
- Deslizador de ánimo inicial (0-100)
- Selector de ciudad con solicitud de nuevas ciudades
- Noticias random por ciudad
- Input de opinión personalizado
- Selector de agente IA (Nova, Atlas, Phoenix)
- Respuesta del agente
- Preguntas de seguimiento
- Resumen final con cambio de ánimo
- Registro en Solana blockchain

### 🔗 Web3 Solana Integration
- **Testamento Colectivo**: Registro inmutable de check-ins
- **Validador de Transacciones**: Verifica firmas en Solana Devnet
- **Transacciones Reales**: Check-ins como Memos en blockchain
- API endpoint: `/api/actions/check-in-memo`

### 🌍 Sistema de Ciudades Dinámico
- Página "Solicita tu Ciudad"
- Firebase Realtime Database
- Noticias random por ciudad
- Múltiples noticias por ubicación
- Soporte para buenas y malas noticias

### 🤖 Agentes IA Personalizados
- **Nova (Compassionate)**: Empática y comprensiva
- **Atlas (Analytical)**: Lógica y datos
- **Phoenix (Reflective)**: Reflexión profunda

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Web3**: Solana Web3.js, Phantom Wallet
- **Backend**: Next.js Route Handlers
- **Database**: Firebase Realtime Database
- **AI**: Vercel AI SDK con modelo de tu elección
- **Deployment**: Vercel

## Setup Local

### Requisitos Previos
```bash
Node.js 18+ 
pnpm (recomendado) o npm
Git
```

### 1. Clonar Repositorio
```bash
git clone https://github.com/AlphaDocere/zero_to_picados_after_event.git
cd zero_to_picados_after_event
```

### 2. Instalar Dependencias
```bash
pnpm install
# o
npm install
```

### 3. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Firebase Realtime Database
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=tu_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Solana (opcional para dev, necesario para Solana features)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# AI Model - Vercel AI Gateway (opcional)
AI_GATEWAY_API_KEY=tu_api_key_opcional
```

### 4. Ejecutar en Desarrollo
```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

El servidor se reinicia automáticamente con cada cambio.

### 5. Build para Producción
```bash
pnpm build
pnpm start
# o
npm run build
npm start
```

## Variables de Entorno Detalladas

### Firebase (REQUERIDO)
Necesitas una base de datos Firebase Realtime:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Habilita Realtime Database
4. Copia las credenciales en `.env.local`

**Estructura Firebase necesaria:**
```
cities/
  - ciudadNombre/news (array de noticias)
city_requests/
  - timestamp (solicitudes de nuevas ciudades)
check-in-sessions/
  - sessionId (sesiones guardadas)
```

### Solana (Para Web3 features)
- **Devnet RPC**: `https://api.devnet.solana.com` (gratuito, para testing)
- **Mainnet RPC**: `https://api.mainnet-beta.solana.com` (producción)
- Necesitas **Phantom Wallet** instalado para firmar transacciones

### AI Gateway (Opcional)
Vercel AI Gateway permite acceso a múltiples modelos:
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Y más...

Si no configuras, usará modelos por defecto.

## Estructura del Proyecto

```
├── app/
│   ├── page.tsx                    # Home
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Estilos globales y temas
│   ├── check-in/
│   │   └── page.tsx               # Flow de 9 pasos
│   ├── testament/
│   │   └── page.tsx               # Testamento Colectivo + Validador
│   ├── solicita-tu-ciudad/
│   │   └── page.tsx               # Solicitud de ciudades
│   ├── api/
│   │   └── actions/
│   │       └── check-in-memo/
│   │           └── route.ts       # Endpoint Solana
│   └── dashboard/ (opcional)
├── components/
│   ├── check-in/
│   │   ├── check-in-form.tsx      # Controlador principal
│   │   ├── mood-slider.tsx
│   │   ├── city-selector.tsx
│   │   ├── news-card.tsx
│   │   ├── opinion-input.tsx
│   │   ├── agent-selector.tsx
│   │   ├── response-card.tsx
│   │   └── agent-follow-up.tsx
│   ├── solana/
│   │   ├── web3-testament.tsx
│   │   ├── solana-tx-validator.tsx
│   │   ├── check-in-web3-recorder.tsx
│   │   └── solana-register-button.tsx
│   ├── city/
│   │   └── request-city-form.tsx
│   ├── ui/                        # shadcn/ui components
│   └── root-nav.tsx
├── lib/
│   ├── firebase-init.ts           # Singleton Firebase (USE THIS!)
│   ├── firebase.ts                # Firebase helpers
│   ├── news-service.ts            # Gestión de noticias
│   ├── solana/
│   │   ├── check-in-recorder.ts
│   │   └── solana-validator.ts
│   └── utils.ts
├── hooks/
│   ├── use-check-in-solana.ts
│   └── use-*
├── BRANCHES.md                    # Guía de ramas
├── FIREBASE_SETUP.md              # Setup Firebase
└── README.md                       # Este archivo
```

## Ramas Disponibles

```
master (producción)
  ├── feat/solana-web3-integration      # MVP Testamento
  ├── feat/solana-real-transactions     # Transacciones reales
  ├── feat/solicita-tu-ciudad           # Sistema de ciudades
  ├── backup/production                 # Documentación backup
  └── fix/firebase-singleton            # Centralización Firebase
```

Para cambiar de rama:
```bash
git checkout nombre-rama
```

## Deployment en Vercel

### Opción 1: Automático desde GitHub
1. Push a master: `git push origin master`
2. Vercel detecta automáticamente el cambio
3. Build y deploy automático
4. Agrega variables de entorno en Vercel Settings

### Opción 2: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## Documentación Adicional

- **[BRANCHES.md](./BRANCHES.md)** - Guía completa de ramas y features
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Configuración Firebase detallada
- **GitHub Issues** - Para reportar bugs
- **GitHub Discussions** - Para preguntas y sugerencias

## Troubleshooting

### Error: "Firebase multiple initializations"
**Solución**: Asegúrate de usar siempre:
```typescript
import { getFirebaseDb } from '@/lib/firebase'
const db = getFirebaseDb()
```
NO hagas `initializeApp()` directo en componentes.

### Error: "Wallet not found" (Solana)
**Solución**: 
1. Instala [Phantom Wallet](https://phantom.app/)
2. Crea una wallet de prueba
3. Abre la app en un navegador con la extensión

### Error: "Firebase config invalid"
**Solución**: 
1. Verifica `.env.local` existe
2. Asegúrate que todas las variables están presentes
3. Reinicia el servidor: `pnpm dev`

### Build errors
```bash
# Limpia todo
pnpm clean
rm -rf .next node_modules pnpm-lock.yaml

# Reinstala
pnpm install

# Prueba build
pnpm build
```

## Cómo Colaborar

### Para Desarrolladores del Equipo

1. **Crea una rama desde master**:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/tu-feature
   ```

2. **Código**:
   - Usa `lib/firebase-init.ts` para Firebase
   - Usa `console.log("[v0] ...")` para debug
   - Sigue la estructura de carpetas

3. **Commit y Push**:
   ```bash
   git add .
   git commit -m "feat: descripción de cambios"
   git push origin feat/tu-feature
   ```

4. **Pull Request a master**:
   - En GitHub, abre un PR
   - Describe qué cambios hiciste
   - Espera review

### Guías de Código

**Firebase - DO's:**
```typescript
// ✅ CORRECTO
import { getFirebaseDb } from '@/lib/firebase'

export async function miServicio() {
  const db = getFirebaseDb()
  // usar db...
}
```

**Firebase - DON'Ts:**
```typescript
// ❌ INCORRECTO
import { initializeApp } from 'firebase/app'

export async function miServicio() {
  const app = initializeApp(config)  // NO HAGAS ESTO
  // ...
}
```

**Debug:**
```typescript
// ✅ CORRECTO
console.log("[v0] Estado:", state)
console.log("[v0] Error:", error)

// ❌ INCORRECTO
console.log("debug stuff")  // Sin prefijo [v0]
```

## URLs Importantes

- **App en Vivo**: https://v0-zero-to-picados-after-event.vercel.app/
- **Testamento**: https://v0-zero-to-picados-after-event.vercel.app/testament
- **Solicita tu Ciudad**: https://v0-zero-to-picados-after-event.vercel.app/solicita-tu-ciudad
- **Repositorio GitHub**: https://github.com/AlphaDocere/zero_to_picados_after_event
- **Issues**: https://github.com/AlphaDocere/zero_to_picados_after_event/issues

## Scripts Útiles

```bash
# Desarrollo
pnpm dev                 # Servidor dev con hot reload

# Build
pnpm build              # Build para producción
pnpm start              # Corre build de producción

# Lint
pnpm lint               # Verifica código

# Type check
pnpm type-check         # Verifica tipos TypeScript

# Limpieza
pnpm clean              # Limpia caché
```

## Licencia

MIT

## Contacto

- **Repo**: https://github.com/AlphaDocere/zero_to_picados_after_event
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ by the Reflect team**

¡Feliz contributing! 🚀


