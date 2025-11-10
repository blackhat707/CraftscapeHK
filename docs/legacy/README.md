# Legacy Backend Files

This directory contains legacy backend code that has been replaced by the NestJS backend in `server/`.

## Files Archived

### Authentication (`auth.cjs`, `auth.js`)
- **Status:** ❌ Deprecated
- **Replaced by:** NestJS authentication in `server/src/`
- **Description:** Old Sequelize-based authentication middleware and routes
- **Date Archived:** 2025-01-XX

### Database (`database.cjs`, `database.js`)
- **Status:** ❌ Deprecated
- **Replaced by:** TypeORM in `server/src/database/`
- **Description:** Old Sequelize database setup and models
- **Date Archived:** 2025-01-XX

### Configuration (`config.cjs`, `config.js`)
- **Status:** ❌ Deprecated
- **Replaced by:** NestJS ConfigModule in `server/src/config/`
- **Description:** Old configuration file using CommonJS
- **Date Archived:** 2025-01-XX

### Seed Data (`seed-data.cjs`, `seed-data.js`)
- **Status:** ❌ Deprecated
- **Replaced by:** NestJS seed script in `server/src/seed.ts`
- **Description:** Old seeding script using Sequelize models
- **Date Archived:** 2025-01-XX

### Start Backend (`start-backend.js`)
- **Status:** ❌ Deprecated
- **Replaced by:** NestJS CLI (`npm run server:dev`)
- **Description:** Legacy Express fallback server (no longer needed)
- **Date Archived:** 2025-01-XX

## Why These Files Were Archived

These files represent the old Sequelize-based backend that was replaced by the current NestJS + TypeORM backend. They are kept here for reference only and should **not** be used in production.

## Current Backend

The active backend is located in `server/` and uses:
- **Framework:** NestJS
- **ORM:** TypeORM
- **Database:** SQLite (via TypeORM)
- **Authentication:** NestJS guards and JWT

## Migration Notes

If you need to reference the old implementation:
1. Check the NestJS equivalent in `server/src/`
2. The new implementation follows NestJS best practices
3. TypeORM replaces Sequelize for database operations

