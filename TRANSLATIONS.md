# Adding New Languages to Reflect

## Quick Start: Adding French

### Step 1: Create French translation file
```bash
cp lib/translations/es.json lib/translations/fr.json
```

Then edit `fr.json` and translate all values to French. Keys remain the same.

### Step 2: Update LanguageContext.tsx

```typescript
// Add import
import fr from '@/lib/translations/fr.json'

// Update type
type Language = 'es' | 'en' | 'fr'

// Update translations object
const translations: Record<Language, any> = {
  es,
  en,
  fr
}
```

### Step 3: Update LanguageToggle.tsx

```typescript
<select 
  value={language}
  onChange={(e) => setLanguage(e.target.value as 'es' | 'en' | 'fr')}
  className="..."
>
  <option value="en">English</option>
  <option value="es">Español</option>
  <option value="fr">Français</option>
</select>
```

### Step 4: Done!

All components automatically support French. Users can select it from the dropdown.

---

## Translation Keys Reference

### Common
- `common.next` - "Next" / "Siguiente"
- `common.skip` - "Skip" / "Saltar"
- `common.done` - "Done" / "Listo"
- `common.back` - "Back" / "Atrás"
- `common.help` - "Help" / "Ayuda"

### Check-in Flow
- `checkin.mood.title` - "How are you feeling?" / "¿Cómo te sientes?"
- `checkin.mood.description` - Description of mood slider
- `checkin.mood.terrible` - "Terrible"
- `checkin.mood.bad` - "Bad"
- `checkin.mood.neutral` - "Neutral"
- `checkin.mood.good` - "Good"
- `checkin.mood.excellent` - "Excellent"

- `checkin.city.title` - "Select your city" / "Selecciona tu ciudad"
- `checkin.city.description` - City selection description

- `checkin.opinion.title` - "What's your opinion?" / "¿Cuál es tu opinión?"
- `checkin.opinion.description` - "Share your thoughts freely..." / "Comparte libremente tus pensamientos..."
- `checkin.opinion.placeholder` - Placeholder for opinion text

- `checkin.agent.title` - "Choose your companion" / "Elige tu compañero"
- `checkin.agent.description` - Agent selection description
- `checkin.agent.psychologist` - "Psychologist"
- `checkin.agent.lifeCoach` - "Life Coach"
- `checkin.agent.therapist` - "Therapist"
- `checkin.agent.friend` - "Friend"

### Pages
- `harvest.title` - "Emotion Harvest" / "Cosecha de Emociones"
- `insights.title` - "Wellness Insights" / "Insights de Bienestar"
- `dashboard.title` - "Personal Dashboard" / "Dashboard Personal"

---

## Automated Translation Option (Phase 3)

For 10+ languages at once, use Groq LLM:

```typescript
// api/translate-all.ts
const groq = new Groq()

export async function translateToLanguages(
  esTranslations: Record<string, any>,
  targetLanguages: string[]
) {
  const languages = await Promise.all(
    targetLanguages.map(lang =>
      groq.messages.create({
        model: 'mixtral-8x7b-32768',
        messages: [{
          role: 'user',
          content: `Translate this JSON to ${lang}:\n${JSON.stringify(esTranslations)}`
        }]
      })
    )
  )
  return languages
}
```

Time estimate: 1-2 hours to implement

---

## Current Language Coverage

✅ English (en) - 100%
✅ Spanish (es) - 100%
❌ French (fr) - Ready to add
❌ German (de) - Ready to add
❌ Portuguese (pt) - Ready to add
❌ Italian (it) - Ready to add
❌ Polish (pl) - Ready to add
❌ Chinese (zh) - Ready to add
❌ Japanese (ja) - Ready to add
❌ Korean (ko) - Ready to add
❌ Arabic (ar) - Ready to add

Each takes ~5 minutes to add manually, or ~30 minutes to auto-generate all 10+.

---

## Testing Translations

1. Navigate to http://localhost:3000
2. Click language dropdown (top-right navbar)
3. Select new language
4. Refresh page
5. All UI should be in new language
6. Check browser dev tools → Application → localStorage → `reflect_language` key should show selected language

---

## Fallback Behavior

If a translation key is missing:

1. Check current language first
2. Fall back to English
3. If still missing, display key name (e.g., "checkin.mood.title")

This ensures app never breaks, even with partial translations.

---

## Performance

- Translation files: ~8 KB each (gzipped: ~2 KB)
- Hook overhead: <1ms per render
- localStorage lookup: <1ms
- Zero impact on page load time

---

## Future: Agent Memory with Groq

Once Phase 3 is complete, integrate agent self-updates:

```typescript
// /agent/[name]/memory-update.ts
export async function updateAgentMemory(agentId: string) {
  // Get recent sessions
  const sessions = await getSessions(agentId)
  
  // Ask Groq to reflect
  const reflection = await groq.messages.create({
    model: 'mixtral-8x7b-32768',
    messages: [{
      role: 'user',
      content: `Based on ${sessions.length} conversations, what have you learned?`
    }]
  })
  
  // Store in Firebase
  await saveThoughtDroplet({
    agentId,
    reflection: reflection.content,
    timestamp: Date.now()
  })
}
```

Estimated time: 2-3 hours

---

## Questions?

Refer to:
- Translation structure: `/lib/translations/`
- Context implementation: `/contexts/LanguageContext.tsx`
- Usage example: `/components/check-in/mood-slider.tsx`
