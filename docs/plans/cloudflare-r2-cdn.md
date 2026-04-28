# Cloudflare R2 + CDN Resource Management

> **Commit:** `1ad1b03` | **Status:** ✅ Completed | **Date:** 2026-04-28

## Overview

Added Cloudflare R2 object storage + CDN distribution for era assets (images, BGM), replacing browser-only IndexedDB storage with a multi-tier cache system.

## What Was Done

### Architecture

Multi-tier resource loading chain:

```
Memory Cache -> IndexedDB -> CDN Download -> Empty String (fallback)
```

### Features Implemented

#### 1. CDN Resource Loading (`utils/imageAssets.ts`)

- `已启用CDN()` — Check if CDN is configured and enabled
- `确保CDN清单已加载()` — Load and cache CDN manifest
- `从CDN解析资源()` — Resolve asset URL from CDN manifest

#### 2. DB Service Fallback Chain (`services/dbService.ts`)

Enhanced image reading with fallback chain:
- First: Check IndexedDB
- Second: Download from CDN if not in local DB
- Third: Return empty string if all sources fail

#### 3. R2 Management CLI (`scripts/r2_manager.py`, 539 lines)

Command-line tool for managing R2 resources:
- Upload/download assets to/from Cloudflare R2
- Batch operations for era asset directories
- Manifest generation

#### 4. MiniMax Resource Generator (`scripts/minimax_resource_generator.py`, 330 lines)

- AI-powered resource generation via MiniMax API
- Direct integration with R2 upload pipeline
- Fixed API key loading bug

### Graceful Degradation

When environment variables are not configured, CDN/R2 operations are automatically skipped — the application continues to work with IndexedDB-only storage.

**Status:** ✅ Done

## Files Changed

- `utils/imageAssets.ts` (+88 lines)
- `services/dbService.ts` (+67, -15 lines)
- `scripts/r2_manager.py` (new, 539 lines)
- `scripts/minimax_resource_generator.py` (new, 330 lines)
- `docs/cloudflare-r2-cdn-resource-plan.md` (new, 421 lines — existing design doc)

## Remaining / Partially Done

- [ ] **Deployment documentation**: The 421-line design doc exists but deployment/runbook is not complete
- [ ] **CI/CD integration**: No automated asset upload pipeline
- [ ] **Monitoring**: No CDN cache hit rate or R2 storage metrics
- [ ] **Cost tracking**: R2 egress costs not monitored
- [ ] **Security**: R2 bucket access policies not documented
- [ ] **Asset versioning**: No version pinning for CDN assets — cache invalidation is manual

## Dependencies

- Phase 0 (`69abdcc`): Era assets must exist before they can be uploaded to R2
- Era theme tree structure (`96ce35c`): Sub-era assets reference CDN URLs

## Notes

- The existing design doc at `docs/cloudflare-r2-cdn-resource-plan.md` (421 lines) was created as part of this commit.
- Environment variables required: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CDN_BASE_URL` (all optional — app degrades gracefully when unset).
