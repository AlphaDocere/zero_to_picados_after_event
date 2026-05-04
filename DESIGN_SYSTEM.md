# Agents Character Design System

## Overview
Character-driven design system for three AI agents: Nova (Amplifier), Atlas (Documentarian), and Phoenix (Visionary). Each character has unique visual identity reflecting their personality and role.

---

## Character Profiles

### Nova (The Amplifier) ⚡
**Personality**: Vibrant, connector, energetic  
**Role**: Amplifies voices and builds community  
**Archetype**: The Bridge Builder

#### Visual Identity
- **Primary Color**: `#ec4899` (Pink)
- **Secondary Color**: `#06b6d4` (Cyan)
- **Dark Accent**: `#3d1e4a`
- **Light Accent**: `#f472b6`
- **Gradient**: Pink → Cyan
- **Typography**: Bold, approachable, forward-facing
- **Icon**: ⚡ (Lightning - energy & amplification)

#### Design Traits
- Dynamic poses and expressions
- Gradient elements showing connection between ideas
- High energy, playful interactions
- Community-focused layouts
- Warm, welcoming color palette

#### Use Cases
- Echo Chamber game (shared voices)
- Community statistics
- Connection highlighting
- Energy/momentum visualization

---

### Atlas (The Documentarian) 📚
**Personality**: Deep, thoughtful, contemplative  
**Role**: Documents stories and context  
**Archetype**: The Historian

#### Visual Identity
- **Primary Color**: `#7c3aed` (Purple)
- **Secondary Color**: `#a855f7` (Light Purple)
- **Dark Accent**: `#2e1065`
- **Light Accent**: `#c4b5fd`
- **Gradient**: Purple → Purple (monochromatic depth)
- **Typography**: Serif-friendly, literary, measured
- **Icon**: 📚 (Books - knowledge & documentation)

#### Design Traits
- Contemplative, grounded poses
- Archival aesthetics and textures
- Timeline and narrative elements
- Context-rich information hierarchies
- Deep, sophisticated color palette

#### Use Cases
- Memory Quest game (remembering context)
- Historical statistics and timelines
- Documentation displays
- Knowledge graphs and connections

---

### Phoenix (The Visionary) 🔥
**Personality**: Transformative, modern, forward-thinking  
**Role**: Envisions future and transforms  
**Archetype**: The Catalyst

#### Visual Identity
- **Primary Color**: `#14b8a6` (Teal/Mint)
- **Secondary Color**: `#ec4899` (Pink)
- **Dark Accent**: `#0d3d36`
- **Light Accent**: `#5eead4`
- **Gradient**: Mint → Pink (split/duality - past↔future)
- **Typography**: Modern, geometric, forward-focused
- **Icon**: 🔥 (Fire - transformation & renewal)

#### Design Traits
- Forward-facing, dynamic poses
- Technology and futurism elements
- Transformation/transition visualizations
- Energy particles and motion
- Bright, optimistic color palette

#### Use Cases
- Future Vision game (trajectory prediction)
- Forward-looking statistics
- Transformation metrics
- Vision and potential visualization

---

## Design System Components

### Card Structure (Agent Cards)
```
┌─────────────────────────────────────┐
│ [Glow Effect]                       │
│ ┌─────────────────────────────────┐ │
│ │ 🔥 Nova              Sparkle    │ │
│ │ The Amplifier                   │ │
│ │ Personality: Vibrant...         │ │
│ │                                 │ │
│ │ Stats Grid (2x2)                │ │
│ │ - Conversations                 │ │
│ │ - Average Sentiment             │ │
│ │ - Last Active                   │ │
│ │ - Top Theme                     │ │
│ │                                 │ │
│ │ Memory Section                  │ │
│ │ - Recent Conversations          │ │
│ │                                 │ │
│ │ Analytics Section               │ │
│ │ - Trend, Cities                 │ │
│ │                                 │ │
│ │ Game Section                    │ │
│ │ - Echo Chamber / Memory Quest   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Color System
- **Background**: Deep (from main theme)
- **Borders**: Character primary color at 50% opacity
- **Text**: White with opacity variations for hierarchy
- **Accents**: Character secondary colors
- **Stats**: Colored boxes with character's primary/secondary colors

### Typography Hierarchy
- **H1 (Name)**: 4xl bold (Nova, Atlas, Phoenix)
- **H2 (Title)**: sm semibold ("The Amplifier", "The Documentarian", "The Visionary")
- **Body**: sm regular for descriptions
- **Labels**: xs medium for stat labels
- **Values**: 2xl bold for stat values

### Spacing
- **Card Padding**: 8 (2rem)
- **Section Gap**: 6 (1.5rem)
- **Component Gap**: 3 (0.75rem)
- **Stat Grid**: 2x2 with gap-3

### Animations
- **Entry**: fade-in + slide-in-from-bottom-4 (500ms, staggered)
- **Hover**: border-opacity fade, shadow-lg
- **Glow**: opacity transition on group-hover
- **Stats**: pulse animation while loading

---

## Color Tokens in CSS

```css
/* Nova (Amplifier) */
--nova-primary: #ec4899;
--nova-secondary: #06b6d4;
--nova-dark: #3d1e4a;
--nova-light: #f472b6;

/* Atlas (Documentarian) */
--atlas-primary: #7c3aed;
--atlas-secondary: #a855f7;
--atlas-dark: #2e1065;
--atlas-light: #c4b5fd;

/* Phoenix (Visionary) */
--phoenix-primary: #14b8a6;
--phoenix-secondary: #ec4899;
--phoenix-dark: #0d3d36;
--phoenix-light: #5eead4;
```

---

## Usage Guidelines

### When to use each agent's colors
- **Nova**: Community features, amplification, connections, energy
- **Atlas**: Documentation, archives, history, knowledge
- **Phoenix**: Vision, transformation, future, innovation

### Accessibility
- All text maintains 4.5:1 contrast ratio minimum
- Color is never sole information carrier
- Icons and text labels always paired
- Focus states use character primary colors

### Responsive Design
- Cards stack vertically on mobile
- Stats grid remains 2x2 on all sizes
- Images scale with viewport
- Touch targets minimum 44x44px

### Animation Performance
- GPU-accelerated transforms
- Reduced motion respected via prefers-reduced-motion
- Staggered animations (100ms intervals)
- Glow effects use blur instead of shadows for performance

---

## Implementation Examples

### Using getCharacterTheme()
```typescript
import { getCharacterTheme } from '@/lib/character-system'

const theme = getCharacterTheme('amplifier')
// Returns: { id, name, colors, border, bgGradient, ... }
```

### Styling with theme colors
```tsx
<div style={{ background: `${theme.colors.primary}20`, borderColor: theme.colors.primary }}>
  Content
</div>
```

### Character showcase
```tsx
<AgentShowcase agentId="amplifier" />
```

---

## Variants & Customization

### For future additions
- **Accent variations**: Use secondary color for alternative actions
- **State variants**: Active/inactive using opacity variations
- **Density**: Compact/comfortable card layouts
- **Theming**: Dark mode support (currently dark by default)

---

## Files Reference
- `lib/character-system.ts` - Design tokens and themes
- `components/agents/agent-card.tsx` - Character card display
- `components/agents/agent-showcase.tsx` - Character showcase
- `app/globals.css` - CSS color variables
- `public/characters/` - Character avatars
