# 🏉 TopScoreRFC Setup Checklist

## 🔐 Security & API Key Rotation

### Step 1: Create New Google Maps API Key

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Create new API key or clone existing
- [ ] Restrict referrers to:
  - `http://localhost:4200/*`
  - `http://localhost:4201/*` (backup dev port)
  - `https://ddeveloper72.github.io/*`
- [ ] Enable APIs: Maps JavaScript API, Places API, Geocoding API
- [ ] Copy the new API key

### Step 2: Update Local Development

- [ ] Open `src/assets/env.local.js`
- [ ] Replace `YOUR_NEW_GOOGLE_MAPS_KEY_HERE` with your actual new API key
- [ ] Save the file

### Step 3: Update Heroku Backend

- [ ] Go to <https://dashboard.heroku.com/apps/rugbyappbackend-4014b68ac4bb>
- [ ] Click **Settings** → **Reveal Config Vars**
- [ ] Set `CLIENT_URLS` to: `http://localhost:4200,http://localhost:4201,https://ddeveloper72.github.io,https://ddeveloper72.github.io/TopScoreRFC`
- [ ] Verify `MONGODB_URI` points to `task_manager` database

### Step 4: Update GitHub Repository Secrets

- [ ] Go to <https://github.com/ddeveloper72/TopScoreRFC/settings/secrets/actions>
- [ ] Update these secrets:
  - `GOOGLE_MAPS_API_KEY`: Your new API key
  - `API_URL`: `https://rugbyappbackend-4014b68ac4bb.herokuapp.com/api`
  - `GOOGLE_MAPS_MAP_ID`: (leave empty for now)

## 🧪 Testing Steps

### Local Development Test

```bash
# 1. Start the dev server
npm start
# (Accept different port if 4200 is busy)

# 2. Open browser to http://localhost:4200 (or the assigned port)

# 3. Test Google Maps:
# - Click "New Match"
# - Try searching for "Aviva Stadium"
# - Should show search results and map

# 4. Test API connectivity:
# - Check browser dev tools Network tab
# - API calls should go to Heroku (rugbyappbackend-4014b68ac4bb.herokuapp.com)
# - No CORS errors should appear
```

### Production Test

```bash
# 1. Push changes to trigger deployment
git add .
git commit -m "Update API key configuration"
git push origin main

# 2. Wait for GitHub Actions to complete
# Check: https://github.com/ddeveloper72/TopScoreRFC/actions

# 3. Test production site:
# Visit: https://ddeveloper72.github.io/TopScoreRFC/
# - Google Maps should work
# - API calls should work
# - Check dev tools for any errors
```

## 🔍 Verification Commands

### Check Current Configuration

```bash
# Check if APIs are reachable
curl https://rugbyappbackend-4014b68ac4bb.herokuapp.com/health

# Check database connection
curl https://rugbyappbackend-4014b68ac4bb.herokuapp.com/health/db

# Check matches endpoint
curl https://rugbyappbackend-4014b68ac4bb.herokuapp.com/api/matches
```

### Common Issues & Solutions

#### "Google Maps search is not configured"

- ✅ Check `env.local.js` has correct API key
- ✅ Refresh browser (Ctrl+F5)
- ✅ Check browser console for errors

#### CORS Errors

- ✅ Verify Heroku `CLIENT_URLS` includes your domain
- ✅ Check browser is using correct origin
- ✅ Restart Heroku dyno if needed

#### API Calls Failing

- ✅ Check `env.local.js` points to correct Heroku URL
- ✅ Verify Heroku app is running
- ✅ Check network tab in dev tools

## ✅ Success Indicators

When everything is working:

- [ ] Local dev: Google Maps search shows venues
- [ ] Local dev: Map displays with markers
- [ ] Local dev: Can create and save matches
- [ ] Production: Same functionality works on GitHub Pages
- [ ] No API keys visible in browser dev tools
- [ ] No CORS errors in console
- [ ] Backend APIs respond with valid data

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify all config values are correct
4. Test each component independently

Current status: Database seeded ✅, Backend deployed ✅, Frontend config in progress ⏳
