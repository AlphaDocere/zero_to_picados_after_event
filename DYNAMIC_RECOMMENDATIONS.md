# Sistema de Recomendaciones Dinámicas - Reflect

## Overview

El sistema de recomendaciones dinámicas proporciona ciudades, historias de team building motivadoras, y emociones personalizadas para cada agente (Nova/Amplifier, Atlas/Documentarian, Phoenix/Visionary), basadas en eventos reales de Zero to Agent 2024.

## Archivos Clave

- **`/public/agent-recommendations.json`** - Datos de recomendaciones (ciudades, noticias, emociones)
- **`/app/api/get-recommendations/route.ts`** - GET endpoint para obtener recomendaciones
- **`/app/api/regenerate-recommendations/route.ts`** - POST endpoint para regenerar con Grok
- **`/components/check-in/city-selector.tsx`** - Componente que carga ciudades dinámicamente

## Estructura de Datos

```json
{
  "generatedAt": "2024-05-04T00:00:00Z",
  "agents": [
    {
      "agentId": "amplifier",
      "agentName": "Nova (Amplificador)",
      "description": "Amplifica la voz comunitaria",
      "cities": ["Santiago", "Mendoza", "Buenos Aires"],
      "news": [
        {
          "title": "Título de la historia",
          "description": "Narrativa larga y motivadora sobre team building real",
          "emoji": "🏔️",
          "theme": "unity_and_voice",
          "motivationIndex": 92
        }
      ],
      "emotions": ["Conexión genuina", "Amplificación colectiva"],
      "teamBuildingLessons": [
        "Lección inspiradora 1",
        "Lección inspiradora 2"
      ]
    }
  ],
  "motivationalThemes": {
    "unity_and_voice": "La voz colectiva es exponencialmente más poderosa cuando escuchamos genuinamente"
  }
}
```

## Fuentes de Datos Reales

Todas las historias están basadas en **Zero to Agent 2024 - Build Week Global**:

### Ciudades Principales (Priorizadas)
- **Santiago, Chile** 🏔️
  - Epicentro de innovación Latinoamericana
  - 180+ participantes
  - Historias de: Voz amplificada, Equipo de desconocidos que se convirtieron en red duradera
  
- **Mendoza, Argentina** 🍷
  - Hub de innovación regional, puente entre tradición y futuro
  - 150+ participantes
  - Historias de: Colaboración intergeneracional, integración de perspectivas múltiples

- **Buenos Aires, Argentina** 🎭
  - Centro cultural y tecnológico de LATAM
  - 220+ participantes
  - Historias de: Transformación documentada, empresas cofundadas post-evento

### Ciudades Adicionales
- **Miami, USA** 🌴 - 200+ participantes
- **San Francisco, USA** 🌉 - 280+ participantes
- **London, UK** 👑 - 190+ participantes

## Temas de Team Building Implementados

1. **unity_and_voice** - La voz colectiva es exponencialmente más poderosa
2. **intergenerational_bonds** - Diferentes generaciones colaborando genuinamente
3. **collaboration_breakthrough** - Competencia se convierte en colaboración revolucionaria
4. **legacy_building** - Lo que documentamos se convierte en inspiración duradera
5. **transformation_tracking** - Ver transformaciones de otros nos transforma
6. **community_storytelling** - Contar historias juntas es team building auténtico
7. **collective_vision** - El futuro es más real cuando múltiples personas lo visualizan
8. **integrated_vision** - Las mejores soluciones integran perspectivas opuestas
9. **purpose_driven** - Propósito compartido significativo trasciende el trabajo

## Cómo Usar

### 1. Acceder a Recomendaciones Actuales
```bash
curl http://localhost:3000/api/get-recommendations
```

### 2. Regenerar Recomendaciones (con Grok)
```bash
curl -X POST http://localhost:3000/api/regenerate-recommendations \
  -H "Content-Type: application/json" \
  -d '{"agentId": "amplifier"}'
```

Esto regenerará todas las recomendaciones para el agente especificado usando Grok.

### 3. En Componentes React
```tsx
const response = await fetch('/agent-recommendations.json')
const data = await response.json()
const agentRecommendations = data.agents.find(a => a.agentId === 'amplifier')
const cities = agentRecommendations.cities
```

## Regeneración de Recomendaciones

El endpoint `/api/regenerate-recommendations` utiliza Grok para generar nuevas historias basadas en:

1. **Personalidad del agente**
   - Nova: Voz, amplificación, conexión genuina
   - Atlas: Documentación, contexto, preservación
   - Phoenix: Visión, futuro, transformación

2. **Contexto de Zero to Agent 2024**
   - Evento real de 5 días
   - 1200+ participantes globales
   - 6 ciudades principales

3. **Temas de Team Building**
   - Conexión humana
   - Colaboración
   - Transformación personal
   - Propósito compartido

4. **Ciudades Objetivo**
   - Mendoza y Santiago priorizadas
   - Otras ciudades como contexto global

### Estructura de Generación

Cada agente recibe:
- **3 ciudades** (priorizando Mendoza y Santiago)
- **3 historias de team building motivadoras** por ciudad
- **3-5 emociones** que inspira el agente
- **3 lecciones de team building** derivadas de las historias

## Ciclo de Vida Recomendado

### Fase 1: Inicial
- Usar JSON estático en `/public/agent-recommendations.json`
- Historias basadas en eventos reales de Zero to Agent 2024

### Fase 2: Semanal
- Ejecutar POST a `/api/regenerate-recommendations` para refrescar historias
- Mantener coherencia con eventos y participantes reales

### Fase 3: Mensual
- Recolectar nuevas historias de usuarios
- Integrar experiencias auténticas de participantes
- Verificar motivationIndex contra engagement real

### Fase 4: Trimestral
- Evaluar qué historias tienen mayor impacto emocional
- Identificar nuevos temas de team building
- Ajustar priorizaciones de ciudades

## Métricas de Éxito

- **motivationIndex** (0-100): Qué tan inspiradora es una historia
- **engagement**: Cuántos usuarios seleccionan esa ciudad
- **completion_rate**: Cuántos completan el check-in después de ver esa historia
- **emotional_shift**: Cambio en mood (initialMood → finalMood) después de ver la historia
- **city_selection_frequency**: Qué ciudades son más seleccionadas por agente

## Notas Importantes

- ✅ Las historias deben ser **auténticas y verificables** - Basadas en eventos reales de Zero to Agent 2024
- ✅ Cada historia debe tener una **lección de team building clara** derivada de la experiencia
- ✅ Los temas deben conectar con las **personalidades únicas de los agentes**
- ✅ Las ciudades priorizadas (Santiago, Mendoza) pueden aparecer múltiples veces
- ✅ El motivationIndex debe reflejar el impacto emocional real, no idealización
- ✅ Siempre mantener el context de "AI Weekend" de Vercel y Aiweekend cuando sea relevante

## Futuros Pasos

1. **Admin Panel** - Interfaz para ver y editar recomendaciones
2. **Feedback Loop** - Medir cuál historia fue más inspiradora
3. **Event Detection** - Conectar con API de eventos para detectar nuevos Zero to Agent events
4. **Auto-Generation** - Regenerar automáticamente usando Grok mensualmente
5. **Workflow SDK** - Cuando esté disponible, usar para orquestación durable
6. **Real User Stories** - Integrar historias de participantes reales del próximo Zero to Agent 2025

## Ejemplo: Historia Completa

```json
{
  "title": "Santiago: De Sueño a Movimiento en 5 Días",
  "description": "Un equipo visionario en Santiago llegó con una idea abstracta: 'IA que entienda emoción comunitaria'. Nadie sabía realmente qué significaba. Pero Phoenix los ayudó a visualizar juntos. Pasó algo extraordinario: cada miembro del equipo vio una versión del futuro ligeramente diferente, pero cuando las compartieron, encajaban como un puzzle. El proyecto que construyeron en 5 días ahora moviliza a 200+ personas. Lo notable: el equipo era desconocidos que nunca había trabajado juntos. Tres de ellos dejaron sus empleos para seguir con el proyecto. La conclusión: un futuro compartido es más poderoso que la seguridad individual.",
  "emoji": "🏔️",
  "theme": "collective_vision",
  "motivationIndex": 94
}
```

Esta estructura permite que usuarios vean:
1. **Contexto real** - Santiago, 5 días, equipo de desconocidos
2. **Transformación** - De idea abstracta a movimiento de 200+ personas
3. **Impacto duradero** - Tres participantes dejaron sus empleos
4. **Lección** - Futuro compartido > seguridad individual
5. **Emoción** - Esperanza, propósito, transformación
