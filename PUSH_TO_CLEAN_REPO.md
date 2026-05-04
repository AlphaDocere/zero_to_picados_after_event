# Instrucciones: Push a Repo Limpio Local

## Estado Actual

El código está reparado y funcionando en `v0-project/`. Necesitas pushearlo a tu nuevo repo limpio para el equipo.

### Repo Nuevo (ya creado)
```
https://github.com/AlphaDocere/zero_to_picados_after_event.git
```

## Pasos para Pushear

### 1. Agregar el remote
```bash
cd /vercel/share/v0-project
git remote add afterevent https://github.com/AlphaDocere/zero_to_picados_after_event.git
```

### 2. Pushear la rama main (estado actual limpio)
```bash
git push afterevent main --force
```

O si quieres crear una rama nueva:
```bash
git push afterevent release/v1.2-cleaned:main --force
```

### 3. Verificar
```bash
git remote -v
# Deberías ver:
# afterevent https://github.com/AlphaDocere/zero_to_picados_after_event.git (fetch)
# afterevent https://github.com/AlphaDocere/zero_to_picados_after_event.git (push)
```

## Cambios Incluidos en Este Push

✅ **Reparaciones hechas:**
- Mendoza: Ahora tiene 3 historias de fallback garantizadas
- City Selector: Validación robusta para evitar undefined
- Fallback cities: Si falla la carga dinámica, muestra ciudades por defecto

✅ **Nuevas características:**
- `fallbackNews` en JSON para Mendoza
- Safety checks en `useEffect`
- Mejor logging para debugging

✅ **Documentación:**
- RETROSPECTIVE_HITO_v1.2.md - Qué funcionó y qué falló
- DEPLOYMENT_CHECKLIST.md - Estado de deployment
- DYNAMIC_RECOMMENDATIONS.md - Sistema de recomendaciones

## Para el Equipo: Cómo Usar Localmente

### Clonar el repo limpio
```bash
git clone https://github.com/AlphaDocere/zero_to_picados_after_event.git reflect-local
cd reflect-local
```

### Setup local
```bash
pnpm install
pnpm build
pnpm dev
```

### Verificar que funciona
- http://localhost:3000 - Check-in page
- http://localhost:3000/dashboard - Dashboard
- http://localhost:3000/harvest - Harvest page

## Reglas de Oro Hasta Fin del Evento

❌ **NO hagas**
- No pushes a `github.com/AlphaDocere/zero_to_agent_animomemtro` (repo oficial)
- No deployments a Vercel desde el repo oficial
- No cambios en el código oficial

✅ **SÍ haz**
- Prueba localmente en tu máquina
- Pushea cambios al repo limpio (zero_to_picados_after_event)
- Deploy localmente para el evento
- Documenta errores y fixes en el repo limpio

## Línea de Tiempo

- **Ahora**: Push a repo limpio
- **Durante evento**: Usa repo limpio para testing local
- **Post evento (2+ días)**: Integra cambios de vuelta al repo oficial si es necesario

## Preguntas

Si algo no funciona:
1. Verifica que clonaste del repo limpio
2. Corre `pnpm install && pnpm build`
3. Revisa `RETROSPECTIVE_HITO_v1.2.md` para problemas conocidos
4. Usa `pnpm dev` y abre browser dev tools para debugging
