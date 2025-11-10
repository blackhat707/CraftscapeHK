# Migration Checklist

Use this checklist to track progress during the refactoring. Check off items as you complete them.

## Phase 1: Create New Structure

### Step 1.1: Create Directories
- [ ] Create `frontend/` directory
- [ ] Create `frontend/src/` directory
- [ ] Create `backend/` directory
- [ ] Create `backend/server/` directory
- [ ] Create `shared/` directory
- [ ] Create `shared/types/` directory
- [ ] Create `shared/constants/` directory
- [ ] Create `shared/enums/` directory
- [ ] Create `scripts/` directory
- [ ] Create `docs/` directory
- [ ] Create `docs/legacy/` directory

### Step 1.2: Move Shared Resources
- [ ] Read `types.ts` and identify domain boundaries
- [ ] Create `shared/types/common.types.ts` (LocalizedString, base types)
- [ ] Create `shared/types/craft.types.ts`
- [ ] Create `shared/types/product.types.ts`
- [ ] Create `shared/types/event.types.ts`
- [ ] Create `shared/types/order.types.ts`
- [ ] Create `shared/types/artisan.types.ts`
- [ ] Create `shared/types/message.types.ts`
- [ ] Create `shared/types/user.types.ts` (if exists)
- [ ] Create `shared/types/index.ts` with re-exports
- [ ] Move `constants.ts` → `shared/constants/index.ts`
- [ ] Move `enums.ts` → `shared/enums/index.ts`
- [ ] Create `shared/index.ts` for convenience exports

### Step 1.3: Update TypeScript Path Aliases
- [ ] Update root `tsconfig.json` (if keeping for reference)
- [ ] Create `frontend/tsconfig.json` with `@shared/*` alias
- [ ] Create `backend/server/tsconfig.json` with `@shared/*` alias
- [ ] Test: `cd frontend && npx tsc --noEmit`
- [ ] Test: `cd backend/server && npx tsc --noEmit`

## Phase 2: Move Frontend Code

### Step 2.1: Move Frontend Source Files
- [ ] Move `components/` → `frontend/src/components/`
- [ ] Move `pages/` → `frontend/src/pages/`
- [ ] Move `views/` → `frontend/src/views/`
- [ ] Move `contexts/` → `frontend/src/contexts/`
- [ ] Move `hooks/` → `frontend/src/hooks/`
- [ ] Move `services/` → `frontend/src/services/`
- [ ] Move `locales/` → `frontend/src/locales/`
- [ ] Move `App.tsx` → `frontend/src/App.tsx`
- [ ] Move `index.tsx` → `frontend/src/index.tsx`
- [ ] Move `index.css` → `frontend/src/index.css`

### Step 2.2: Move Frontend Config Files
- [ ] Move `vite.config.ts` → `frontend/vite.config.ts`
- [ ] Update `frontend/vite.config.ts` paths and aliases
- [ ] Move `postcss.config.js` → `frontend/postcss.config.js`
- [ ] Move `index.html` → `frontend/index.html`
- [ ] Update `index.html` script paths if needed

### Step 2.3: Create Frontend Package.json
- [ ] Create `frontend/package.json`
- [ ] Extract frontend dependencies from root `package.json`
- [ ] Add frontend-specific scripts
- [ ] Test: `cd frontend && npm install`

### Step 2.4: Update Frontend Imports
- [ ] Update imports in `frontend/src/services/apiService.ts`
- [ ] Update imports in `frontend/src/App.tsx`
- [ ] Update imports in all components (use find/replace)
- [ ] Update imports in all pages (use find/replace)
- [ ] Update imports in all views (use find/replace)
- [ ] Update imports in all contexts (use find/replace)
- [ ] Update imports in all hooks (use find/replace)
- [ ] Run: `cd frontend && npm run build` to verify

### Step 2.5: Move Frontend Assets
- [ ] Review `public/` directory contents
- [ ] Move frontend-only assets to `frontend/public/`
- [ ] Keep shared assets at root or move to appropriate location
- [ ] Update asset references in components

## Phase 3: Move Backend Code

### Step 3.1: Move NestJS Backend
- [ ] Move `server/` → `backend/server/`
- [ ] Update `backend/server/src/main.ts` static asset paths
- [ ] Update all internal imports in backend
- [ ] Test: `cd backend/server && npm run build`

### Step 3.2: Move Serverless Wrapper
- [ ] Review `api/index.ts` usage
- [ ] Move `api/index.ts` → `backend/api/index.ts` (if keeping)
- [ ] Update import path in `backend/api/index.ts`
- [ ] Document purpose of `backend/api/` directory

### Step 3.3: Move Backend Assets
- [ ] Move `assets/` → `backend/server/assets/`
- [ ] Update static asset serving in `backend/server/src/main.ts`
- [ ] Test asset serving works correctly

### Step 3.4: Update Backend Package.json
- [ ] Verify `backend/server/package.json` exists
- [ ] Ensure all backend dependencies are listed
- [ ] Test: `cd backend/server && npm install`

## Phase 4: Remove Legacy Code

### Step 4.1: Archive Legacy Files
- [ ] Move `auth.cjs` → `docs/legacy/auth.cjs`
- [ ] Move `auth.js` → `docs/legacy/auth.js`
- [ ] Move `database.cjs` → `docs/legacy/database.cjs`
- [ ] Move `database.js` → `docs/legacy/database.js`
- [ ] Move `config.cjs` → `docs/legacy/config.cjs`
- [ ] Move `config.js` → `docs/legacy/config.js`
- [ ] Move `seed-data.cjs` → `docs/legacy/seed-data.cjs`
- [ ] Move `seed-data.js` → `docs/legacy/seed-data.js`
- [ ] Move `start-backend.js` → `docs/legacy/start-backend.js`
- [ ] Create `docs/legacy/README.md` explaining these files

### Step 4.2: Remove Deprecated Code
- [ ] Review `backend/api.ts` (deprecated mock API)
- [ ] Delete `backend/api.ts` (or move to `docs/legacy/`)
- [ ] Verify no imports reference deprecated files
- [ ] Remove any `.js` compiled files if present

### Step 4.3: Clean Up Root
- [ ] List remaining files at root
- [ ] Verify all necessary files remain (README, .env, .gitignore, etc.)
- [ ] Remove any orphaned files

## Phase 5: Update Configuration

### Step 5.1: Update Root Package.json
- [ ] Update `dev` script to run frontend
- [ ] Update `dev:backend` script to run backend
- [ ] Update `dev:stack` script
- [ ] Update `build` script
- [ ] Update `build:backend` script
- [ ] Update `build:stack` script
- [ ] Update `server:*` scripts to reference new paths
- [ ] Update `docker:*` scripts to reference new paths
- [ ] Update `deploy:*` scripts to reference new paths
- [ ] Test: `npm run dev:stack` works

### Step 5.2: Update Deployment Scripts
- [ ] Review `Dockerfile` (frontend)
- [ ] Update `Dockerfile` paths if needed
- [ ] Review `backend/server/Dockerfile`
- [ ] Update backend Dockerfile paths if needed
- [ ] Review `cloudbuild.yaml`
- [ ] Update Cloud Build paths if needed
- [ ] Review `deploy-*.ps1` scripts
- [ ] Update PowerShell deployment scripts
- [ ] Review `vercel.json`
- [ ] Update Vercel config if needed

### Step 5.3: Update Environment Variables
- [ ] Review `.env` file
- [ ] Document which variables are for frontend
- [ ] Document which variables are for backend
- [ ] Create `.env.example` if needed
- [ ] Update README.md with new structure

## Phase 6: Testing & Validation

### Step 6.1: TypeScript Compilation
- [ ] Run `cd frontend && npx tsc --noEmit`
- [ ] Fix any TypeScript errors in frontend
- [ ] Run `cd backend/server && npx tsc --noEmit`
- [ ] Fix any TypeScript errors in backend
- [ ] Verify shared types are accessible from both

### Step 6.2: Build Tests
- [ ] Run `npm run build` (frontend)
- [ ] Verify frontend build succeeds
- [ ] Run `npm run build:backend`
- [ ] Verify backend build succeeds
- [ ] Run `npm run build:stack`
- [ ] Verify full stack build succeeds

### Step 6.3: Runtime Tests
- [ ] Run `npm run dev:stack`
- [ ] Verify frontend starts on correct port
- [ ] Verify backend starts on correct port
- [ ] Test API calls from frontend to backend
- [ ] Test authentication flow
- [ ] Test AI image generation
- [ ] Test all major features

### Step 6.4: Import Verification
- [ ] Search for old import paths: `from '../types'`
- [ ] Search for old import paths: `from '../constants'`
- [ ] Search for old import paths: `from '../enums'`
- [ ] Replace any remaining old imports
- [ ] Verify no broken imports

### Step 6.5: Deployment Tests
- [ ] Test Docker build: `npm run docker:test:frontend`
- [ ] Test Docker build: `npm run docker:test`
- [ ] Test local deployment (if possible)
- [ ] Document any deployment issues

## Final Verification

- [ ] All checkboxes above are checked
- [ ] `npm run dev:stack` works end-to-end
- [ ] `npm run build:stack` produces valid artifacts
- [ ] No TypeScript errors
- [ ] No broken imports
- [ ] README.md updated with new structure
- [ ] All team members notified of changes
- [ ] Git commit with clear message
- [ ] Create PR for review

## Rollback Plan

If something breaks:
1. Revert git commit
2. Restore files from backup (if created)
3. Review error logs
4. Fix issues incrementally
5. Re-test before committing

