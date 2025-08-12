# Manual Heroku Backend Deployment Guide

## Prerequisites

1. Install Heroku CLI: <https://devcenter.heroku.com/articles/heroku-cli>
2. Login to Heroku: `heroku login`

## Deployment Steps

### Option 1: Using the Deployment Script

1. Run `deploy-backend-to-heroku.bat` (Windows) or `deploy-backend-to-heroku.sh` (Mac/Linux)

### Option 2: Manual Deployment

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Initialize git (if not already done):**

   ```bash
   git init
   ```

3. **Add Heroku remote:**

   ```bash
   git remote add heroku https://git.heroku.com/rugbyappbackend.git
   ```

4. **Stage and commit all files:**

   ```bash
   git add .
   git commit -m "Add new match type fields: matchType, homeTeamCategory, homeTeamAgeLevel, awayTeamAgeLevel"
   ```

5. **Deploy to Heroku:**

   ```bash
   git push heroku main --force
   ```

### Option 3: Using Heroku Dashboard (Manual Deploy)

1. Go to https://dashboard.heroku.com/apps/rugbyappbackend
2. Go to "Deploy" tab
3. Connect to GitHub repository if not already connected
4. Select the branch with your changes
5. Click "Deploy Branch"

## Files Updated

The following files contain the new match type fields:

- `backend/models/Match.js` - Updated schema with new fields
- `backend/controllers/matchController.js` - Enhanced logging for debugging

## New Schema Fields Added

- `matchType`: enum ['boys', 'girls', 'mixed']
- `homeTeamCategory`: enum ['minis', 'youths-boys', 'girls', 'seniors', 'womens-tag']
- `homeTeamAgeLevel`: String
- `awayTeamAgeLevel`: String

## Verification

After deployment, test the API endpoint:

```bash
curl https://rugbyappbackend.herokuapp.com/api/matches
```

The new fields should now persist when creating matches through your frontend.
