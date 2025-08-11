# Environment Configuration

This folder contains environment configuration files for the TopScoreRFC application.

## File Structure

- `environment.ts` - Development environment template (safe to commit, no secrets)
- `environment.prod.ts` - Production environment template (safe to commit, no secrets)
- `environment.template.ts` - Template for creating local development environment
- `environment.prod.template.ts` - Template for creating local production environment

## Local Development Setup

For local development with secrets (optional, since all config is handled via runtime `env.js`):

1. Copy `environment.template.ts` to `environment.local.ts`
2. Copy `environment.prod.template.ts` to `environment.prod.local.ts`
3. Add your actual API keys to the `.local.ts` files
4. The `.local.ts` files are gitignored and won't be committed

## Configuration Strategy

This application uses **runtime configuration injection** via `env.js` files:

- **Local Development**: `src/assets/env.local.js` (gitignored)
- **Production**: `src/assets/env.js` (injected at build time)

All secrets and configuration are loaded at runtime through the `AppConfigService`, ensuring no secrets are ever committed to the repository.

## Security

✅ **Safe**: Template files in this folder (no secrets)
❌ **Never commit**: Any files with actual API keys or secrets
🔒 **Secure**: All production secrets handled via runtime injection
