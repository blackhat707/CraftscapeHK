# Quick Reference: New Directory Structure

## Directory Map

```
CraftscapeHK/
│
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Route-level pages
│   │   ├── views/        # Reusable views
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── locales/      # i18n files
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/           # Public static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/              # Backend API server
│   ├── server/          # NestJS application
│   │   ├── src/
│   │   │   ├── crafts/
│   │   │   ├── products/
│   │   │   ├── events/
│   │   │   ├── orders/
│   │   │   ├── messages/
│   │   │   ├── ai/
│   │   │   ├── admin/
│   │   │   └── main.ts
│   │   ├── assets/      # Backend-served assets (AR/USDZ)
│   │   ├── package.json
│   │   └── Dockerfile
│   └── api/             # Vercel serverless wrapper (optional)
│       └── index.ts
│
├── shared/               # Shared code between layers
│   ├── types/           # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── craft.types.ts
│   │   ├── product.types.ts
│   │   └── ...
│   ├── constants/       # Shared constants
│   │   └── index.ts
│   └── enums/           # Shared enums
│       └── index.ts
│
├── scripts/              # Build/deployment scripts
├── docs/                 # Documentation
│   └── legacy/          # Archived legacy files
│
├── .env                  # Environment variables
├── package.json         # Root orchestrator
└── README.md
```

## Import Patterns

### Frontend Imports
```typescript
// From shared
import type { Craft, Product } from '@shared/types';
import { CRAFTS } from '@shared/constants';
import { Tab } from '@shared/enums';

// From frontend
import { apiService } from '@/services/apiService';
import { BottomNav } from '@/components/BottomNav';
```

### Backend Imports
```typescript
// From shared
import type { Craft } from '@shared/types';

// From backend
import { CraftsService } from './crafts/crafts.service';
```

## Common Commands

### Development
```bash
# Run both frontend and backend
npm run dev:stack

# Run frontend only
npm run dev

# Run backend only
npm run dev:backend
```

### Build
```bash
# Build both
npm run build:stack

# Build frontend only
npm run build

# Build backend only
npm run build:backend
```

### Testing
```bash
# Type check frontend
cd frontend && npx tsc --noEmit

# Type check backend
cd backend/server && npx tsc --noEmit

# Run backend tests
cd backend/server && npm test
```

## Path Aliases

### Frontend (`frontend/tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### Backend (`backend/server/tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../../shared/*"]
    }
  }
}
```

## Key Files

### Frontend Entry Points
- `frontend/src/index.tsx` - React app entry
- `frontend/src/App.tsx` - Main app component
- `frontend/index.html` - HTML template

### Backend Entry Points
- `backend/server/src/main.ts` - NestJS bootstrap
- `backend/server/src/app.module.ts` - Root module
- `backend/api/index.ts` - Vercel serverless wrapper

### Shared Exports
- `shared/types/index.ts` - All type exports
- `shared/constants/index.ts` - All constant exports
- `shared/enums/index.ts` - All enum exports

## Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

### Backend (.env)
```bash
GEMINI_API_KEY=your_key_here
GOOGLE_AI_IMAGE_MODEL=gemini-2.5-flash-latest
PORT=3001
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your_secret_here
```

## Deployment

### Frontend (Vercel/Cloud Run)
```bash
npm run deploy:frontend
```

### Backend (Cloud Run)
```bash
npm run deploy:backend
```

### Both
```bash
npm run deploy:all
```

## Troubleshooting

### Import Errors
- Check TypeScript path aliases are configured
- Verify `@shared/*` resolves correctly
- Check file extensions in imports

### Build Errors
- Ensure both `frontend/` and `backend/server/` have their own `package.json`
- Run `npm install` in each directory
- Check Node.js version compatibility

### Runtime Errors
- Verify environment variables are set
- Check API base URL matches backend port
- Verify CORS configuration in backend

