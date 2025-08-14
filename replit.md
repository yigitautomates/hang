# Event Discovery & Social Connection App

## Overview

This is a modern full-stack web application that combines event discovery with social features. Users can discover local events, swipe to express interest (similar to dating apps), and participate in group chats for events they've joined. The app supports three main categories: general events, dating, and friendship connections.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly swipe gestures for event interaction
- Bottom navigation pattern for mobile UX
- Custom map interface with touch controls

## Key Components

### Data Models
- **Users**: Username, password, profile information
- **Events**: Title, description, category, location, date/time, creator
- **Swipes**: User interactions with events (like/pass)
- **Messages**: Group chat messages for events
- **Conversations**: Event-based group chat rooms

### Core Features
1. **Event Discovery**: Swipe-based interface for discovering events
2. **Categories**: Events, dating, and friendship categories
3. **Location-Based**: Map view with Ankara-specific locations
4. **Group Chat**: Real-time messaging for event participants
5. **Event Creation**: Form-based event creation with validation

### Storage Strategy
- **Development**: In-memory storage with fallback data
- **Production**: PostgreSQL with Drizzle ORM migrations
- **Client State**: Local storage for user preferences and swiped events

## Data Flow

1. **Event Discovery Flow**:
   - Users browse events by category or view all
   - Swipe left (pass) or right (like) on events
   - Liked events add user to participants list
   - Creates conversation for group chat access

2. **Chat Flow**:
   - Users join event conversations automatically when liking events
   - Real-time polling for new messages (3-second intervals)
   - Messages persist in database with timestamps

3. **Event Creation Flow**:
   - Form validation with Zod schemas
   - Server-side validation and storage
   - Immediate UI updates via React Query

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Powerful data synchronization
- **react-hook-form**: Performant form handling
- **zod**: Runtime type validation
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Consistent icon library
- **class-variance-authority**: Type-safe variant management

### Development Dependencies
- **vite**: Fast build tool with HMR
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Serves static files from Express with API routes
- **Database**: Requires `DATABASE_URL` environment variable

### Deployment Commands
- `npm run dev`: Development with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. Real map integration with Leaflet + OpenStreetMap
- June 29, 2025. Expanded event database (18 events total, 9 dating-focused)