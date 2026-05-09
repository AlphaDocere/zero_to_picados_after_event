# Reflect - Web3 Emotional Check-in App

Aplicación para registrar tu viaje emocional con transacciones reales en Solana blockchain.

## Ramas Principales

### 🔵 `main` (Estable)
- Versión estable base de la aplicación
- Check-ins completamente funcionales
- Integración con ciudades

### 🟣 `feat/solana-web3-integration`
- MVP de integración Web3
- Testamento Colectivo (historial visual)
- Validador de transacciones Solana
- Almacenamiento local de firmas

### 🟠 `feat/solana-real-transactions`
- **TRANSACCIONES REALES EN SOLANA DEVNET**
- Integración con Phantom Wallet
- Registro inmutable de check-ins en blockchain
- API endpoint Solana Actions
- Cada check-in = Transacción real en Solana

### 🔵 `feat/solicita-tu-ciudad`
- Sistema de solicitud de ciudades
- Firebase integration para noticias
- Múltiples noticias por ciudad (random)
- Página dedicada "Solicita tu Ciudad"
- Admin panel (en desarrollo)

### 📦 `backup/production`
- Backup del estado actual
- Preserva todas las características implementadas

## Como Usar

### Setup Inicial
```bash
git clone <repo-url>
cd reflect
pnpm install
pnpm dev
```

### Cambiar a Feature Branch
```bash
# Transacciones Solana reales
git checkout feat/solana-real-transactions

# Sistema de ciudades
git checkout feat/solicita-tu-ciudad

# Web3 Testament
git checkout feat/solana-web3-integration
```

### Deployar
```bash
vercel --prod --yes
```

## Características por Rama

| Rama | Check-in | Solana | Testamento | Ciudades |
|------|----------|--------|-----------|----------|
| main | ✓ | ✗ | ✗ | ✓ |
| feat/solana-web3-integration | ✓ | MVP | ✓ | ✓ |
| feat/solana-real-transactions | ✓ | ✓ Real | ✓ | ✓ |
| feat/solicita-tu-ciudad | ✓ | ✓ | ✓ | ✓ Firebase |

## Setup Solana (Para transacciones reales)

Necesitas Phantom Wallet instalado:
1. Instala Phantom: https://phantom.app
2. Crea/importa wallet en Devnet
3. Solicita SOL gratis: https://faucet.solana.com
4. Completa un check-in y registra en Solana

## Firebase Setup

Configura variables de entorno en `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

## URLs en Vivo

- Main: https://v0-zero-to-picados-after-event.vercel.app
- Check-in: /
- Testamento: /testament
- Solicita tu Ciudad: /solicita-tu-ciudad

## Commits Recientes

```
a6b63bb - fix: Correct function name typo in news-service
5177f11 - feat: Add request city system with Firebase integration
8295fe6 - feat: Implement real Solana transactions for check-ins
477c870 - feat: Add Solana Transaction Validator to Testament page
38a16e2 - feat: Implement modular Web3 testament MVP
```

## Próximos Pasos

- [ ] Admin panel para gestionar ciudades
- [ ] Noticias positivas random
- [ ] Integración con más wallets
- [ ] Dashboard de estadísticas
- [ ] Programa Solana personalizado (sin Memo Program)
- [ ] Mobile app
