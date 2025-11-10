# Architecture Summary & Current State Analysis

## Current Architecture Overview

### Layer Identification

#### ✅ Frontend Layer (React + Vite)
**Location:** Root directory
**Components:**
- `components/` - React UI components
- `pages/` - Route-level page components
- `views/` - Reusable view components
- `contexts/` - React context providers (Theme, Language, App)
- `hooks/` - Custom React hooks
- `services/` - API service layer (`apiService.ts`, `authService.ts`, etc.)
- `locales/` - Localization files
- `App.tsx`, `index.tsx` - Entry points
- `vite.config.ts` - Build configuration

**Status:** ✅ Well-organized, but mixed with backend files at root

#### ✅ Backend Layer (NestJS)
**Location:** `server/` directory
**Structure:**
- Modular NestJS application with TypeORM
- Feature modules: `crafts/`, `products/`, `events/`, `orders/`, `messages/`, `ai/`, `admin/`
- Database entities in `entities/`
- Proper dependency injection

**Status:** ✅ Well-organized, but references root-level assets

#### ⚠️ Shared Layer (Mixed)
**Location:** Root directory
**Files:**
- `types.ts` - TypeScript interfaces (used by both frontend and backend)
- `constants.ts` - Seed data and constants (used by both)
- `enums.ts` - Shared enums (used by both)

**Status:** ⚠️ Needs proper organization into `shared/` directory

#### ❌ Legacy Backend Layer (Deprecated)
**Location:** Root directory
**Files:**
- `auth.cjs` / `auth.js` - Old Sequelize-based auth (replaced by NestJS)
- `database.cjs` / `database.js` - Old Sequelize setup (replaced by TypeORM)
- `config.cjs` / `config.js` - Old config (replaced by NestJS ConfigModule)
- `seed-data.cjs` / `seed-data.js` - Old seeding (replaced by NestJS seed.ts)
- `start-backend.js` - Legacy Express fallback server

**Status:** ❌ Should be removed or archived

#### ⚠️ Deprecated/Legacy Code
**Location:** Various
- `backend/api.ts` - Mock API (deprecated, marked as no longer used)
- `api/index.ts` - Vercel serverless wrapper (kept for deployment)

**Status:** ⚠️ Needs cleanup or documentation

## File Dependency Analysis

### Frontend Dependencies
```
Frontend Files
├── Import from types.ts ✅
├── Import from constants.ts ✅ (for fallback data)
├── Import from enums.ts ✅
├── Call backend via services/apiService.ts ✅
└── Use shared assets from public/ ⚠️
```

### Backend Dependencies
```
Backend Files (NestJS)
├── Uses TypeORM (not Sequelize) ✅
├── Serves static assets from root public/ ⚠️
├── Serves static assets from root assets/ ⚠️
├── May reference types.ts (needs verification) ⚠️
└── Uses NestJS ConfigModule ✅
```

### Shared Dependencies
```
Shared Files
├── types.ts - No dependencies ✅
├── constants.ts - Imports from types.ts ✅
└── enums.ts - No dependencies ✅
```

## Key Architectural Issues

### 1. **Mixed Concerns at Root** 🔴 High Priority
**Problem:** Frontend, backend, and shared code all exist at root level
**Impact:** Unclear boundaries, difficult to maintain, confusing for new developers
**Solution:** Separate into `frontend/`, `backend/`, `shared/` directories

### 2. **Legacy Backend Code** 🔴 High Priority
**Problem:** Old Sequelize-based backend files exist alongside NestJS
**Impact:** Confusion about which backend is active, potential conflicts
**Solution:** Archive or remove legacy files

### 3. **Shared Types/Constants Location** 🟡 Medium Priority
**Problem:** `types.ts` and `constants.ts` at root, unclear they're shared
**Impact:** Risk of duplication, unclear ownership
**Solution:** Move to `shared/` directory with proper structure

### 4. **Static Asset Management** 🟡 Medium Priority
**Problem:** Backend serves assets from root (`public/`, `assets/`)
**Impact:** Mixed concerns, unclear ownership
**Solution:** Separate frontend assets (`frontend/public/`) from backend assets (`backend/server/assets/`)

### 5. **Mock Data Fallback** 🟢 Low Priority
**Problem:** Frontend falls back to `constants.ts` when backend unavailable
**Impact:** Creates dependency on shared constants
**Solution:** Keep mechanism but import from `@shared/constants`

## Dependency Graph

```
┌─────────────────────────────────────────┐
│           Root Directory                 │
│  (Mixed: Frontend + Backend + Shared)  │
└─────────────────────────────────────────┘
           │           │           │
           │           │           │
    ┌──────▼──────┐ ┌──▼──┐ ┌─────▼─────┐
    │  Frontend   │ │Shared│ │  Backend  │
    │  (React)    │ │Types │ │  (NestJS) │
    └──────┬──────┘ └──┬──┘ └─────┬─────┘
           │           │           │
           └───────────┼───────────┘
                       │
              (All import shared)
```

**Current State:** Everything at root, shared code mixed with layer-specific code

**Target State:**
```
┌─────────────┐
│  Frontend   │──┐
└─────────────┘  │
                 ├──► ┌─────────────┐
┌─────────────┐  │    │   Shared    │
│  Backend    │──┘    │  (Types &   │
└─────────────┘       │  Constants) │
                      └─────────────┘
```

## Import Patterns Analysis

### Current Import Patterns

**Frontend:**
```typescript
import type { Craft } from './types';
import { CRAFTS } from './constants';
import { Tab } from './enums';
```

**Backend:**
```typescript
// Mostly uses its own types in server/src/types/
// May reference root types.ts (needs verification)
```

### Target Import Patterns

**Frontend:**
```typescript
import type { Craft } from '@shared/types';
import { CRAFTS } from '@shared/constants';
import { Tab } from '@shared/enums';
```

**Backend:**
```typescript
import type { Craft } from '@shared/types';
// Or use DTOs that extend shared types
```

## Build & Deployment Analysis

### Current Build Process
1. Root `package.json` orchestrates both frontend and backend
2. `npm run dev:stack` runs both concurrently
3. `npm run build:stack` builds both
4. Frontend uses Vite, backend uses NestJS CLI

### Deployment Targets
1. **Frontend:** Vercel / Cloud Run (Docker)
2. **Backend:** Cloud Run (Docker)
3. **Vercel Serverless:** Uses `api/index.ts` wrapper

### Configuration Files
- `vite.config.ts` - Frontend build config
- `server/nest-cli.json` - Backend build config
- `Dockerfile` - Frontend container
- `server/Dockerfile` - Backend container
- `cloudbuild.yaml` - Google Cloud Build
- `vercel.json` - Vercel deployment

## Recommendations Summary

### Immediate Actions (Phase 1-2)
1. ✅ Create `shared/` directory structure
2. ✅ Move `types.ts`, `constants.ts`, `enums.ts` to shared
3. ✅ Update TypeScript path aliases
4. ✅ Move frontend code to `frontend/` directory

### Short-term Actions (Phase 3-4)
1. ✅ Move backend to `backend/server/`
2. ✅ Archive legacy backend files
3. ✅ Remove deprecated mock APIs

### Medium-term Actions (Phase 5-6)
1. ✅ Update all build scripts
2. ✅ Update deployment configurations
3. ✅ Comprehensive testing
4. ✅ Documentation updates

## Risk Assessment

### Low Risk ✅
- Moving frontend code (isolated, well-tested)
- Moving backend code (isolated, well-structured)
- Creating shared directory (additive change)

### Medium Risk ⚠️
- Updating import paths (many files affected)
- Updating build scripts (may break CI/CD)
- Static asset paths (may break asset serving)

### High Risk 🔴
- Removing legacy files (ensure nothing depends on them)
- Deployment script changes (test thoroughly)
- Shared type changes (may break both frontend and backend)

## Success Metrics

After refactoring, we should achieve:

1. ✅ **Clear Separation:** Each layer in its own directory
2. ✅ **No Circular Dependencies:** Frontend → Shared ← Backend
3. ✅ **Type Safety:** Shared types used consistently
4. ✅ **Build Success:** All build scripts work
5. ✅ **Runtime Success:** Application runs correctly
6. ✅ **Deployment Success:** Can deploy both layers independently
7. ✅ **Developer Experience:** Clear where to find/modify code

## Next Steps

1. Review this analysis with the team
2. Approve the refactoring plan
3. Create feature branch
4. Execute migration checklist
5. Test thoroughly
6. Merge and deploy

