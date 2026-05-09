# 🚀 Reflect — Guía de Despliegue Local

## Requisitos Previos

- **Node.js** ≥ 18 (recomendado v20+)
- **npm** (incluido con Node.js)
- Archivo `.env.local` o `.env` con credenciales de Firebase configuradas

---

## 🔧 Instalación Rápida

```bash
# 1. Clonar el repositorio (si aún no lo tienes)
git clone <tu-repo-url>
cd zero_to_picados_after_event

# 2. Instalar dependencias (incluyendo Solana)
npm install --legacy-peer-deps --ignore-scripts
```

> ⚠️ Los flags `--legacy-peer-deps --ignore-scripts` son necesarios porque las dependencias de Solana (`@solana/wallet-adapter-wallets`) traen `@stellar/stellar-sdk` que requiere `yarn` para su post-install. Con estos flags se instala todo correctamente.

---

## 🏃 Modo Desarrollo (hot-reload, primera carga lenta)

```bash
npm run dev
```

- **URL local:** http://localhost:3000
- Turbopack activo (compilación incremental)
- Ideal para **editar código** y ver cambios en tiempo real
- ⚠️ La primera carga de cada página es lenta (compila on-demand)

---

## ⚡ Modo Producción (build + start — carga ultra rápida)

### Paso 1: Build

```bash
npm run build
```

> **Nota:** El script de build ejecuta primero una traducción de contenido. Si no tienes `GROQ_API_KEY`, corre en modo demo (copia ES a EN), totalmente funcional.

### Paso 2: Start

```bash
npm run start
```

- **URL local:** http://localhost:3000
- Páginas pre-renderizadas, JS optimizado y minificado
- **Carga instantánea** comparado con modo dev

### Comando combinado (build + start en una línea):

```bash
npm run build && npm run start
```

---

## 📋 Resumen de Comandos

| Comando | Descripción | Velocidad |
|---|---|---|
| `npm install --legacy-peer-deps --ignore-scripts` | Instala dependencias | — |
| `npm run dev` | Servidor desarrollo (Turbopack) | 🐢 Lenta primera carga |
| `npm run build` | Compila para producción | ~10s |
| `npm run start` | Servidor producción (pre-compilado) | ⚡ Instantáneo |
| `npm run lint` | Analiza código con ESLint | — |

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` (o `.env`) en la raíz del proyecto:

```env
# Firebase (requerido)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Traducción AI (opcional — sin esto usa modo demo)
GROQ_API_KEY=gsk_...

# Discord Webhook (opcional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

> ⚠️ `.env.local` tiene prioridad sobre `.env`. Usa `.env.local` para credenciales que NO se suben a Git.

---

## 🌐 Despliegue a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

Configura las variables de entorno en Vercel → Settings → Environment Variables.

---

## 🔥 Tips de Performance

1. **Siempre usa `npm run build && npm run start`** para demos o presentaciones
2. El modo `dev` compila cada página al visitarla (por eso la primera carga es lenta)
3. El modo `start` sirve todo pre-compilado = **carga instantánea**
4. Si necesitas reiniciar el servidor dev: `Ctrl+C` → `npm run dev`
