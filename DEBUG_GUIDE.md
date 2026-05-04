# Guía de Debugging

## Si se queda en "Cargando tu sesión"

### Paso 1: Abre la Consola del Navegador
- **Windows/Linux**: `F12` o `Ctrl+Shift+I`
- **Mac**: `Cmd+Option+I`
- Busca la tab `Console`

### Paso 2: Busca logs `[v0]`
Deberías ver algo como:
```
[v0] initializeSession starting...
[v0] sessionId from storage: null
[v0] Creating new session...
```

### Si ves este error:
```
[v0] Firebase config missing keys: ['apiKey', 'authDomain', ...]
```
**Solución:** Las variables de entorno no están configuradas.
1. Abre `/vercel/share/v0-project/.env.local`
2. Verifica que tengas todas 8 variables Firebase
3. Reinicia el servidor: `pnpm dev`

### Si ves este error:
```
[v0] Session initialization failed: { error: "...", message: "..." }
```
**Solución:** Firebase tiene problemas de conexión
1. Verifica que tu URL de base de datos sea correcta
2. Abre https://console.firebase.google.com
3. Verifica que RTDB esté habilitada
4. Comprueba las Firestore Rules (deben permitir acceso)

### Si funciona pero se queda pegado igual:
Agrega esto en la consola y copia el output:
```javascript
// En la consola del navegador (F12)
localStorage.setItem('debugMode', 'true')
location.reload()
```

Luego copia lo que sale en la consola y compártelo.

## Testing del Happy Path

1. **Paso 1 - Mood Slider**: Mueve el slider a 50, verifica que aparezca en la consola:
   ```
   [v0] Session update error: (si ves esto, hay problema)
   ```
   O no ves error = ✓ funciona

2. **Paso 2 - City Selector**: Selecciona una ciudad, debería ir al siguiente paso sin lag

3. **Paso 3 - News Card**: Debe mostrar noticia de la ciudad

4. **Paso 4 - Opinion Input**: Escribe algo, debería reaccionar instantáneamente (no lag al escribir)

5. **Paso 5 - Agent Selector**: Selecciona un agente

6. **Paso 6 - Response Card**: Debe mostrar respuesta del agente

7. **Paso 7 - Follow Up**: Escribe una respuesta

8. **Paso 8 - Final Mood**: Desliza el slider final

9. **Paso 9 - Summary**: Debe mostrar review de todo, click en "Completar"

10. **Completion Screen**: Debe mostrar "Gracias por Reflexionar" con cambio de ánimo

## Logs Importantes

Busca estos logs en consola (en orden):
```
[v0] Firebase initialized successfully
[v0] initializeSession starting...
[v0] Creating new session...
[v0] New session created with ID: -N2x3pQ...
[v0] Fetched new session data: { initialMood: 0, city: '', ... }
[v0] Session update error: (esto solo aparece si hay error)
```

## Si todo falla

1. Copia TODA la consola (Ctrl+A en console tab)
2. Comparte el error exacto
3. Verifica que `.env.local` tenga todas las 8 variables
4. Reinicia: `pnpm dev` después de cambiar env vars
