# CraftscapeHK Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to separate concerns into distinct frontend, backend, and shared architectural layers. The current codebase has mixed concerns with legacy backend code at the root, deprecated mock APIs, and shared types/constants that need proper organization.

## Current Architecture Analysis

### Current Structure Issues

1. **Legacy Backend Files at Root** (❌ Should be removed or archived)
   - `auth.cjs` / `auth.js` - Old Sequelize-based authentication (replaced by NestJS)
   - `database.cjs` / `database.js` - Old Sequelize database setup (replaced by TypeORM in NestJS)
   - `config.cjs` / `config.js` - Old configuration (replaced by NestJS ConfigModule)
   - `seed-data.cjs` / `seed-data.js` - Old seeding script (replaced by NestJS seed.ts)
   - `start-backend.js` - Legacy Express fallback server (not needed)

2. **Deprecated/Legacy Directories** (❌ Should be removed)
   - `api/` - Vercel serverless wrapper (kept for Vercel deployment, but should be documented)
   - `backend/` - Mock API file (deprecated, marked as no longer used)

3. **Shared Resources** (⚠️ Need proper organization)
   - `types.ts` - Shared TypeScript interfaces (used by both frontend and backend)
   - `constants.ts` - Shared constants/data (used by both frontend and backend)
   - `enums.ts` - Shared enums (used by both frontend and backend)

4. **Static Assets** (⚠️ Mixed concerns)
   - `public/` - Served by both frontend (Vite) and backend (NestJS)
   - `assets/` - Served by backend (NestJS) for AR/USDZ files

5. **Frontend Structure** (✅ Mostly well-organized)
   - `components/` - React components
   - `pages/` - Route-level pages
   - `views/` - Reusable view components
   - `contexts/` - React context providers
   - `hooks/` - Custom React hooks
   - `services/` - Frontend API services
   - `locales/` - Localization files

6. **Backend Structure** (✅ Well-organized NestJS)
   - `server/` - NestJS backend with proper module structure
   - Uses TypeORM (not Sequelize)
   - Proper dependency injection

## Proposed Directory Structure

```
CraftscapeHK/
├── frontend/                    # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Route-level pages
│   │   ├── views/              # Reusable view components
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Frontend API services
│   │   ├── locales/           # Localization files
│   │   ├── assets/            # Frontend-only assets (images, fonts, etc.)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── public/                # Public static assets (favicon, etc.)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── postcss.config.js
│
├── backend/                    # Backend API server
│   ├── server/                # NestJS application (rename from current server/)
│   │   ├── src/
│   │   │   ├── admin/
│   │   │   ├── ai/
│   │   │   ├── config/
│   │   │   ├── crafts/
│   │   │   ├── database/
│   │   │   ├── debug/
│   │   │   ├── entities/
│   │   │   ├── events/
│   │   │   ├── messages/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── seed.ts
│   │   ├── assets/            # Backend-served assets (AR/USDZ files)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── Dockerfile
│   │
│   └── api/                   # Serverless/Vercel wrapper (if needed)
│       └── index.ts          # Vercel serverless function
│
├── shared/                     # Shared code between frontend and backend
│   ├── types/                 # Shared TypeScript types
│   │   ├── index.ts          # Main type exports
│   │   ├── craft.types.ts
│   │   ├── product.types.ts
│   │   ├── event.types.ts
│   │   ├── order.types.ts
│   │   └── common.types.ts
│   ├── constants/             # Shared constants
│   │   ├── index.ts          # Main constant exports
│   │   └── seed-data.ts      # Seed data (if needed by both)
│   └── enums/                 # Shared enums
│       └── index.ts
│
├── scripts/                   # Build/deployment scripts
│   ├── seed.ts               # Unified seeding script
│   └── deploy/               # Deployment scripts
│
├── docs/                      # Documentation
│   └── ARCHITECTURE.md       # Architecture documentation
│
├── .env                       # Environment variables
├── .gitignore
├── package.json              # Root package.json (monorepo orchestrator)
├── README.md
└── REFACTORING_PLAN.md       # This file
```

## Migration Plan

### Phase 1: Create New Structure (Non-Breaking)

**Step 1.1: Create new directories**
- Create `frontend/` directory
- Create `backend/` directory  
- Create `shared/` directory
- Create `scripts/` directory

**Step 1.2: Move shared resources**
- Move `types.ts` → `shared/types/index.ts` (split into domain-specific files)
- Move `constants.ts` → `shared/constants/index.ts`
- Move `enums.ts` → `shared/enums/index.ts`

**Step 1.3: Update imports (automated)**
- Update all frontend imports to use `@shared/types`, `@shared/constants`, `@shared/enums`
- Update all backend imports to use shared types
- Configure TypeScript path aliases in both frontend and backend

### Phase 2: Move Frontend Code

**Step 2.1: Move frontend source files**
- Move `components/` → `frontend/src/components/`
- Move `pages/` → `frontend/src/pages/`
- Move `views/` → `frontend/src/views/`
- Move `contexts/` → `frontend/src/contexts/`
- Move `hooks/` → `frontend/src/hooks/`
- Move `services/` → `frontend/src/services/`
- Move `locales/` → `frontend/src/locales/`
- Move `App.tsx`, `index.tsx`, `index.css` → `frontend/src/`
- Move `index.html` → `frontend/`

**Step 2.2: Move frontend config files**
- Move `vite.config.ts` → `frontend/vite.config.ts`
- Move `tsconfig.json` → `frontend/tsconfig.json` (update paths)
- Move `postcss.config.js` → `frontend/postcss.config.js`
- Create `frontend/package.json` (extract frontend dependencies)

**Step 2.3: Move frontend assets**
- Move `public/` → `frontend/public/` (or keep at root if shared)
- Create `frontend/src/assets/` for frontend-only assets

**Step 2.4: Update frontend imports**
- Update all relative imports to use new paths
- Update Vite alias configuration
- Update TypeScript path mappings

### Phase 3: Move Backend Code

**Step 3.1: Move NestJS backend**
- Move `server/` → `backend/server/`
- Update all internal imports
- Update static asset paths in `main.ts`

**Step 3.2: Move serverless wrapper**
- Move `api/index.ts` → `backend/api/index.ts` (if keeping Vercel support)
- Update import paths

**Step 3.3: Move backend assets**
- Move `assets/` → `backend/server/assets/` (AR/USDZ files)
- Update static asset serving in NestJS

**Step 3.4: Create backend package.json**
- Extract backend dependencies to `backend/server/package.json`
- Update root package.json to orchestrate both

### Phase 4: Remove Legacy Code

**Step 4.1: Archive legacy backend files**
- Move `auth.cjs`, `auth.js` → `docs/legacy/` (for reference)
- Move `database.cjs`, `database.js` → `docs/legacy/`
- Move `config.cjs`, `config.js` → `docs/legacy/`
- Move `seed-data.cjs`, `seed-data.js` → `docs/legacy/`
- Move `start-backend.js` → `docs/legacy/`

**Step 4.2: Remove deprecated directories**
- Remove `backend/api.ts` (deprecated mock API)
- Keep `api/` directory only if using Vercel serverless (document its purpose)

**Step 4.3: Clean up root**
- Remove legacy `.cjs` and `.js` files from root
- Keep only orchestration files at root

### Phase 5: Update Configuration

**Step 5.1: Update build scripts**
- Update root `package.json` scripts to reference new paths
- Update `dev:stack` to run frontend and backend from new locations
- Update `build:stack` to build both from new locations

**Step 5.2: Update deployment scripts**
- Update Dockerfiles to reference new paths
- Update Cloud Run deployment scripts
- Update Vercel configuration if needed

**Step 5.3: Update environment variables**
- Ensure `.env` is properly loaded by both frontend and backend
- Document required environment variables

### Phase 6: Testing & Validation

**Step 6.1: Verify imports**
- Run TypeScript compiler on both frontend and backend
- Fix any import errors
- Verify shared types are accessible

**Step 6.2: Test builds**
- Test `npm run build:stack`
- Test `npm run dev:stack`
- Verify frontend and backend can communicate

**Step 6.3: Test deployment**
- Test Docker builds
- Test Cloud Run deployment
- Test Vercel deployment (if applicable)

## Detailed File Mapping

### Shared Types Migration

**Current:** `types.ts` (single file)
**Target:** `shared/types/` (split by domain)

```
types.ts → shared/types/
├── index.ts              # Re-exports all types
├── common.types.ts      # LocalizedString, base interfaces
├── craft.types.ts       # Craft interface
├── product.types.ts     # Product interface
├── event.types.ts       # Event interface
├── order.types.ts       # Order interface
├── artisan.types.ts    # Artisan interface
├── message.types.ts    # MessageThread interface
└── user.types.ts       # User, Auth types
```

### Constants Migration

**Current:** `constants.ts` (single file with all seed data)
**Target:** `shared/constants/index.ts`

- Keep seed data in shared if used by both frontend (fallback) and backend (seeding)
- Or move to backend-only if only used for seeding

### Frontend Services Migration

**Current:** `services/apiService.ts` imports from `../types` and `../constants`
**Target:** `frontend/src/services/apiService.ts` imports from `@shared/types` and `@shared/constants`

### Backend Entity Migration

**Current:** Backend entities may reference types
**Target:** Backend entities import from `@shared/types` or use their own DTOs

## New Interfaces/Contracts Needed

### 1. Shared Type Package

Create a proper shared package structure:

```typescript
// shared/types/index.ts
export * from './common.types';
export * from './craft.types';
export * from './product.types';
// ... etc
```

### 2. API Contract Types

Define request/response DTOs in shared types:

```typescript
// shared/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 3. Environment Configuration

Create typed environment configuration:

```typescript
// shared/config/env.types.ts
export interface AppConfig {
  apiBaseUrl: string;
  geminiApiKey: string;
  // ... etc
}
```

## Configuration Changes Required

### TypeScript Configuration

**Frontend `tsconfig.json`:**
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

**Backend `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### Vite Configuration

**`frontend/vite.config.ts`:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, '../shared'),
  }
}
```

### Package.json Scripts

**Root `package.json`:**
```json
{
  "scripts": {
    "dev": "npm run dev --prefix frontend",
    "dev:backend": "npm run start:dev --prefix backend/server",
    "dev:stack": "concurrently \"npm run dev\" \"npm run dev:backend\"",
    "build": "npm run build --prefix frontend",
    "build:backend": "npm run build --prefix backend/server",
    "build:stack": "npm run build && npm run build:backend"
  }
}
```

## Architectural Issues & Anti-Patterns to Address

### 1. ❌ Legacy Backend Code at Root
**Issue:** Old Sequelize-based backend files (`auth.cjs`, `database.cjs`) exist alongside NestJS backend
**Solution:** Archive or remove legacy files, ensure NestJS is the single source of truth

### 2. ⚠️ Shared Types/Constants at Root
**Issue:** `types.ts` and `constants.ts` are at root, making it unclear they're shared
**Solution:** Move to `shared/` directory with proper structure

### 3. ⚠️ Static Assets Served by Backend
**Issue:** Backend serves static assets from root (`public/`, `assets/`)
**Solution:** Move backend assets to `backend/server/assets/`, frontend assets to `frontend/public/`

### 4. ⚠️ Mock Data Fallback in Frontend
**Issue:** Frontend `apiService.ts` falls back to `constants.ts` when backend is unavailable
**Solution:** Keep fallback mechanism but import from `@shared/constants`

### 5. ⚠️ Duplicate Type Definitions
**Issue:** Risk of types diverging between frontend and backend
**Solution:** Use shared types package, enforce via TypeScript path aliases

### 6. ⚠️ Mixed Build Tooling
**Issue:** Root package.json mixes frontend and backend dependencies
**Solution:** Separate `package.json` files, use root as orchestrator

### 7. ⚠️ Environment Variable Management
**Issue:** `.env` at root, unclear which variables belong to which layer
**Solution:** Document in README, consider `.env.example` files per layer

## Dependencies Between Layers

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │ imports
       ▼
┌─────────────┐
│   Shared    │
│  (Types &   │
│  Constants) │
└──────┬──────┘
       │ imports
       ▼
┌─────────────┐
│   Backend   │
│  (NestJS)   │
└─────────────┘
```

**Dependency Flow:**
- Frontend → Shared (types, constants, enums)
- Backend → Shared (types, constants, enums)
- Frontend → Backend (via HTTP API calls)
- No circular dependencies

## Risk Mitigation

### Breaking Changes
- **Risk:** Import paths will change, breaking builds
- **Mitigation:** Use automated find/replace, test incrementally, use TypeScript to catch errors

### Deployment Issues
- **Risk:** Deployment scripts reference old paths
- **Mitigation:** Update all deployment scripts in Phase 5, test in staging first

### Shared Code Conflicts
- **Risk:** Frontend and backend may need different type definitions
- **Mitigation:** Use DTOs in backend, keep shared types minimal, use type transformations

## Success Criteria

✅ All legacy backend files removed or archived
✅ Frontend code isolated in `frontend/` directory
✅ Backend code isolated in `backend/` directory
✅ Shared code in `shared/` directory
✅ All imports updated and working
✅ Build scripts updated and functional
✅ Deployment scripts updated and tested
✅ No circular dependencies
✅ TypeScript compilation passes for all layers
✅ Application runs successfully with `npm run dev:stack`

## Timeline Estimate

- **Phase 1:** 2-3 hours (create structure, move shared)
- **Phase 2:** 3-4 hours (move frontend, update imports)
- **Phase 3:** 2-3 hours (move backend, update paths)
- **Phase 4:** 1 hour (remove legacy code)
- **Phase 5:** 2-3 hours (update configs, scripts)
- **Phase 6:** 2-3 hours (testing, fixes)

**Total:** ~12-17 hours of focused work

## Next Steps

1. Review this plan with the team
2. Create feature branch: `refactor/separate-layers`
3. Execute phases sequentially
4. Test after each phase
5. Merge when all phases complete and tests pass

