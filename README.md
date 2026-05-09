# Reflect - Emotional Check-in Platform

Transform self-awareness through guided reflections with personalized AI companions.

## Overview

**Reflect** is an innovative emotional intelligence platform that combines guided check-ins with AI agents to help users understand and track their emotional journey. Built with modern web technologies and powered by Firebase, Reflect creates a safe space for meaningful self-reflection while building a collaborative community.

## Features

### Core Check-in Experience
- **Guided Reflections**: Step-by-step emotional check-in flow with thoughtful prompts
- **AI Companions**: Multiple specialized AI agents (Psychologist, Life Coach, Therapist, Friend) provide personalized guidance
- **Real-time Mood Tracking**: Visual mood progression from initial state to final reflection
- **Mood Shift Detection**: Intelligent analysis of emotional changes during the session

### Collaborative Features
- **Mood Harvesting**: Aggregate anonymized mood data to visualize collective emotional patterns
- **Community Insights**: See how your emotional journey compares with the broader community
- **Shared Wisdom**: Benefit from collective emotional intelligence

### Technical Excellence
- **Firebase Integration**: Secure, scalable real-time database with Realtime Database
- **AI-Powered Responses**: Dynamic responses cached for performance
- **Optimized Performance**: Response caching, mood shift schema optimization, pre-configured Firebase indexes
- **Modern UI**: AIWeekend-inspired dark theme with vibrant purple/pink gradients and neon accents

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Backend**: Firebase Functions (optional)
- **Analytics**: Vercel Analytics
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── globals.css         # Theme tokens & styles
│   └── harvest/            # Mood harvesting page
├── components/
│   ├── check-in/           # Check-in flow components
│   │   ├── check-in-form.tsx      # Main form controller
│   │   ├── mood-input.tsx         # Mood slider
│   │   ├── opinion-input.tsx      # Opinion text input
│   │   ├── agent-selector.tsx     # AI agent selection
│   │   ├── agent-follow-up.tsx    # Follow-up prompts
│   │   ├── response-card.tsx      # AI response display
│   │   └── step-indicator.tsx     # Progress indicator
│   ├── harvest/            # Harvest page components
│   ├── root-nav.tsx        # Navigation
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── db.ts               # Database operations
│   └── utils.ts            # Utilities
└── public/                 # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ (pnpm recommended)
- Firebase project with Realtime Database enabled
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd reflect

# Install dependencies
pnpm install

# Set up environment variables
# Create .env.local with Firebase credentials:
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to start reflecting.

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## How It Works

1. **Start Check-in**: User begins their emotional reflection
2. **Initial Mood**: Set baseline emotional state (0-100)
3. **Pick an Agent**: Choose from 4 specialized AI companions
4. **Share Opinion**: Express what's on their mind
5. **Get Guidance**: Receive personalized AI response with follow-up prompt
6. **Final Reflection**: Conclude with final mood state
7. **View Results**: See emotional journey and mood change
8. **Join Harvest**: Contribute anonymized data to collective insights

## Performance Optimizations (v1.2.1)

- Response caching for faster AI interactions
- MoodShift schema optimization for efficient mood tracking
- Pre-configured Firebase indexes for query performance
- Tailwind CSS v4 for optimized CSS generation
- React Compiler ready for improved performance

## Design System

### Color Palette (AIWeekend Theme)
- **Background**: Deep Navy/Black (`#0a0e17`)
- **Primary**: Soft Purple (`#a78bfa`)
- **Accent**: Neon Green (`#10b981`)
- **Gradient**: Purple → Pink → Purple (`#9333ea` → `#ec4899`)

### Typography
- **Font**: Nunito Sans (multiple weights)
- **Headlines**: Bold, clear, and prominent
- **Body**: Clean and readable

## Firebase Schema

### Collections
- `sessions/`: User emotional check-in sessions
  - `id`: Unique session identifier
  - `initialMood`: Starting emotional state (0-100)
  - `finalMood`: Ending emotional state (0-100)
  - `agent`: Selected AI companion
  - `opinion`: User's emotional narrative
  - `response`: AI-generated guidance
  - `createdAt`: Session timestamp
  - `updatedAt`: Last update timestamp

## Contributing

This project welcomes contributions. Please ensure code follows the existing patterns and includes appropriate testing.

## License

MIT

## Support

For issues, questions, or feedback, please open an issue on GitHub or contact the team.

---

**Reflect** - Where self-awareness meets artificial intelligence. 💜

