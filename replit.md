# Lab3 - Replit Agent Guide

## Overview

Lab3 is a React Native / Expo mobile application that lets users compare cryptocurrency and financial asset performance side-by-side. It displays interactive charts showing percentage change over time for assets like Bitcoin, Ethereum, S&P 500, KOSPI, and others. The UI is in Korean, targeting Korean-speaking users. The app uses mock data for asset prices and chart data — no live market data APIs are integrated yet.

The project has a dual architecture: an Expo/React Native frontend and an Express.js backend server. The backend currently has minimal functionality (user CRUD with in-memory storage) and serves as infrastructure for future API development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Tab-based navigation using expo-router's `(tabs)` directory convention. Currently has a single tab ("비교" / Compare)
- **State Management**: Local component state with `useState`. React Query (`@tanstack/react-query`) is configured for server state but not heavily used yet since data is mocked
- **Animations**: `react-native-reanimated` for smooth UI animations (chip selections, chart transitions, period toggles)
- **Fonts**: Inter font family (400, 500, 600, 700 weights) loaded via `@expo-google-fonts/inter`
- **Charts**: Custom SVG-based chart rendering using `react-native-svg` — no charting library. The `ComparisonChart` component manually computes paths, axes, and gradients
- **Haptics**: `expo-haptics` for tactile feedback on button presses
- **Design**: Dark theme only, with color constants defined in `constants/colors.ts`. Uses a crypto-themed dark palette with orange (#F7931A) as the primary accent
- **Path aliases**: `@/*` maps to project root, `@shared/*` maps to `./shared/*`

### Key Frontend Components

| Component | Purpose |
|-----------|---------|
| `ComparisonChart` | SVG-based multi-line comparison chart with percentage change Y-axis |
| `AssetSelector` | Scrollable chip-based asset picker with animated selection states |
| `PeriodSelector` | Time period toggle (24H, 1W, 1M, 1Y) |
| `PresetCard` | Pre-configured comparison cards (e.g., BTC vs KOSPI) with mini charts |
| `InsightBanner` | Auto-generated insight text comparing selected assets |
| `ChartLegend` | Color-coded legend for chart lines |

### Data Layer

- **Mock Data**: All asset and chart data is generated client-side in `lib/mock-data.ts` using deterministic random walks seeded per asset/period combination. No real API calls for market data
- **Assets**: 10 pre-defined assets (BTC, ETH, SOL, XRP, BNB, DOGE, S&P 500, NASDAQ, KOSPI, Gold)
- **Presets**: Pre-configured comparison pairs stored as static data

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript (compiled via `tsx` in dev, `esbuild` for production)
- **Framework**: Express 5
- **API Pattern**: Routes registered in `server/routes.ts`, prefixed with `/api`
- **Storage**: Currently uses in-memory storage (`MemStorage` class) with a `Map` for users. Interface `IStorage` is defined for future database integration
- **CORS**: Configured for Replit domains and localhost development
- **Static Serving**: In production, serves Expo web build from `dist/` directory; in development, proxies to Expo's Metro bundler

### Database Schema (Drizzle + PostgreSQL)

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Tables**:
  - `users`: `id` (UUID, auto-generated), `username` (unique text), `password` (text)
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Output to `./migrations` directory, managed via `drizzle-kit push`
- **Note**: The database schema is defined but the server currently uses in-memory storage, not the actual PostgreSQL database. The database connection requires `DATABASE_URL` environment variable

### Build & Deployment

- **Development**: Two processes run simultaneously — Expo dev server (`expo:dev`) and Express server (`server:dev`)
- **Production Build**: Expo web static build compiled via custom `scripts/build.js`, Express server bundled with esbuild
- **Platform Support**: Primarily targets web; iOS/Android configured but tablet support disabled on iOS

## External Dependencies

### Core Framework
- **Expo SDK 54** — React Native framework with managed workflow
- **React 19.1** / **React Native 0.81.5** — UI framework
- **expo-router 6** — File-based routing with typed routes

### Database & ORM
- **PostgreSQL** — Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM** — Type-safe SQL ORM
- **drizzle-kit** — Database migration tooling
- **pg** — PostgreSQL client for Node.js

### Server
- **Express 5** — HTTP server framework
- **http-proxy-middleware** — Proxies requests to Expo's Metro bundler in development

### UI & Animation
- **react-native-reanimated** — High-performance animations
- **react-native-gesture-handler** — Touch gesture handling
- **react-native-svg** — SVG rendering for custom charts
- **expo-haptics** — Haptic feedback
- **expo-blur** / **expo-glass-effect** — Visual effects
- **expo-linear-gradient** — Gradient backgrounds
- **@expo/vector-icons** (Feather, MaterialCommunityIcons, Ionicons) — Icon sets

### Data & State
- **@tanstack/react-query** — Async state management (configured, minimally used)
- **zod** — Runtime type validation
- **drizzle-zod** — Generates Zod schemas from Drizzle table definitions

### Development Tools
- **TypeScript** — Type safety throughout
- **esbuild** — Production server bundling
- **tsx** — TypeScript execution for development
- **patch-package** — Post-install patching