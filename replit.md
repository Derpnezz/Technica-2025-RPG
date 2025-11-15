# Objection! - AI Debate Arena

## Overview
"Objection!" is an interactive AI-powered debate game where players practice argumentation skills by debating against an AI judge. Built with React and Vite, it uses Claude AI to generate debate prompts and evaluate arguments.

## Project Type
Frontend web application - Interactive debate/learning game

## Tech Stack
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.4.21
- **Language**: JavaScript with TypeScript support
- **Icons**: lucide-react
- **AI**: Claude (Anthropic API) - for prompt generation and judging

## Game Features
- **3-Round Debate System**: Progressive difficulty across rounds
- **AI Judge**: Claude AI evaluates arguments and provides scores/feedback
- **Topic Options**: 
  - Generate AI-powered debate prompts
  - Use custom debate topics
- **Timer**: 2-minute countdown per round
- **Scoring**: 100-point scale with detailed feedback
- **Final Results**: Average score across all rounds

## Key Files
- `src/App.jsx` - Main game logic and UI
- `src/App.css` - Game styling and animations
- `src/index.jsx` - React entry point
- `vite.config.js` - Vite configuration (port 5000)

## API Requirements
This app uses the Anthropic Claude API for:
1. Generating debate prompts
2. Evaluating arguments and providing scores

Note: API key needs to be configured for full functionality.

## Development
- Dev server runs on port 5000
- Hot Module Replacement (HMR) enabled
- Configured for Replit environment

## Recent Changes
- **2025-11-15**: Synced from GitHub (Technica-2025-RPG)
  - Restored baseline version with full debate game
  - Installed Node.js 20 and dependencies
  - Configured Vite for Replit (port 5000)
  - Set up dev workflow
