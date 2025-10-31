# Craftscape HK (藝守)

## Project Overview
Craftscape HK is an AI-powered AR e-commerce platform designed to preserve and promote Hong Kong's traditional crafts through modern technology. The platform bridges heritage craftsmanship with contemporary digital experiences.

## Recent Changes
- **2025-10-31**: Configured project for Replit environment
  - Updated Vite to run on port 5000 with HMR proxy support
  - Configured API proxy to route `/api` and `/debug` requests to backend on port 3001
  - Updated backend CORS to allow all origins for development
  - Installed system dependency `libuuid` for canvas support
  - Database seeded with initial craft, product, event, artisan, order, and message data
  - Deployment configured as VM target with build and run scripts

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: NestJS + TypeORM + SQLite
- **AI**: Google Gemini API (Imagen 4.0) for AI image generation
- **AR**: USDZ assets for Quick Look/WebAR experiences

## Project Architecture

### Frontend (Port 5000)
- React-based SPA with component-driven architecture
- Mobile-first design with swipeable carousel interface
- AI Creation Studio for custom craft design
- AR exhibition experience with 360° product views
- Real-time chat with artisans

### Backend (Port 3001)
- NestJS REST API with modular architecture
- SQLite database with TypeORM
- Modules: Products, Crafts, Events, Orders, Messages, AI
- Debug endpoints for AI image generation testing

### Key Features
1. **Swipe-card craft exploration** - Tinder-like interface for browsing crafts
2. **AI Creation Studio** - Generate custom craft designs using Gemini
3. **AR Exhibitions** - Immersive 360° product viewing with AR support
4. **Cultural Events Calendar** - Workshops, exhibitions, community activities
5. **Direct Artisan Support** - Purchase products, book workshops, commission custom work

## Environment Variables
- `GEMINI_API_KEY` - Google AI Studio API key (required for AI features)
- `GOOGLE_AI_IMAGE_MODEL` - Optional override for Imagen model (default: gemini-2.5-flash-latest)

## Development

### Running the Application
The workflow "Full Stack Development Server" runs both frontend and backend concurrently:
```bash
npm run dev:stack
```

### Individual Commands
- `npm run dev` - Run frontend only (Vite dev server)
- `npm run server:dev` - Run backend only (NestJS in watch mode)
- `npm run server:seed` - Seed database with sample data
- `npm run build:stack` - Build both frontend and backend for production

### Key Directories
- `/components` - React UI components
- `/pages` - Page-level components (routes)
- `/views` - Complex view components (AiStudio, Chatroom, etc.)
- `/text_lab` - Text customization/design tool
- `/services` - API and authentication services
- `/server/src` - NestJS backend source
- `/public` - Static assets
- `/assets` - Additional assets (mahjong tiles, etc.)

## Database
- **Type**: SQLite (development)
- **ORM**: TypeORM
- **Entities**: Artisan, Craft, Product, Event, Order, MessageThread
- **Location**: `database.sqlite` (gitignored)
- **Seeding**: Run `npm run server:seed` to populate with sample data

## API Endpoints
- `GET /api/crafts` - List all crafts
- `GET /api/products` - List all products
- `GET /api/events` - List all events
- `GET /api/orders` - List orders (auth required)
- `GET /api/messages` - List message threads (auth required)
- `POST /api/ai/generate-image` - Generate AI craft images
- `POST /api/ai/generate-tryon` - Generate AI try-on images

## Deployment

### Distributed Deployment (Backend on Replit, Frontend on Vercel)

**Backend on Replit:**
1. The backend is configured to run on Replit and expose port 3001
2. Set environment variables in Replit Secrets:
   - `GEMINI_API_KEY` - Your Google AI Studio API key
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://your-app.vercel.app,http://localhost:5000`)
3. The backend will be accessible at your Replit domain on port 3001
4. Deployment target: VM (always-on server)

**Frontend on Vercel:**
1. Deploy the Vite app to Vercel
2. Set environment variable in Vercel:
   - `VITE_API_URL` - Your Replit backend URL with /api (e.g., `https://your-repl.replit.dev/api`)
3. Build command: `npm run build`
4. Output directory: `dist`

### Local Development
- **Run both frontend and backend together:**
  ```bash
  npm run dev:stack
  ```
  Frontend runs on port 5000 with Vite proxy routing `/api` → `localhost:3001`
  
- **Environment Variables for Local Dev:**
  - Frontend uses Vite proxy, so no `VITE_API_URL` needed
  - Backend accepts all origins by default (no `ALLOWED_ORIGINS` needed)

### Environment Variables Summary

**Backend (Replit):**
- `GEMINI_API_KEY` - Required for AI image generation
- `GOOGLE_AI_IMAGE_MODEL` - Optional, defaults to gemini-2.5-flash-latest
- `ALLOWED_ORIGINS` - Optional, comma-separated allowed CORS origins (defaults to all origins if not set)
- `HOST` - Optional, defaults to 0.0.0.0 (publicly accessible)
- `PORT` - Optional, defaults to 3001

**Frontend (Vercel):**
- `VITE_API_URL` - Required for production, full URL to backend API with /api path (e.g., `https://your-repl.replit.dev/api`)

## User Preferences
- None documented yet

## Notes
- The platform uses Tailwind CSS via CDN for development (should be installed as PostCSS plugin for production)
- AI image generation requires a paid Google AI Studio API key with Images API access
- AR features work with USDZ files viewable on iOS devices via Quick Look
- Database uses SQLite for simplicity but can be migrated to PostgreSQL for production scale
