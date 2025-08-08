# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Rugby Score Tracker to GitHub Pages.

## 🎯 Quick Deploy

### Option 1: Automatic Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment:

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository settings
   - Scroll to "Pages" section
   - Set Source to "Deploy from a branch"
   - Select branch: `gh-pages`
   - Click "Save"

3. **Wait for deployment:**
   - Check the "Actions" tab in your GitHub repo
   - Wait for the deployment workflow to complete
   - Your app will be available at: `https://ddeveloper72.github.io/TopScoreRFC/`

### Option 2: Manual Deployment

If you prefer manual deployment:

```bash
# Build and deploy in one command
npm run deploy
```

## 🛠️ Available Commands

```bash
# Build for production (generic)
npm run build:prod

# Build specifically for GitHub Pages
npm run build:ghpages

# Build and deploy to GitHub Pages
npm run deploy

# Just build (same as build:ghpages, runs before deploy)
npm run predeploy
```

## ⚙️ Configuration Details

### Build Configuration

- **Production build**: Optimized, minified, tree-shaken
- **Base href**: Set to `https://ddeveloper72.github.io/TopScoreRFC/`
- **Output directory**: `dist/rugby-score-card-app/`

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) automatically:

- Runs on every push to `main` branch
- Installs Node.js 18 and dependencies
- Builds the Angular app for GitHub Pages
- Deploys to the `gh-pages` branch

## 🌐 App Features for GitHub Pages

### What Works on GitHub Pages

✅ **Full Angular App**: All client-side functionality  
✅ **Score Tracking**: Complete rugby score tracking  
✅ **Game History**: localStorage-based game history  
✅ **Statistics**: Local game statistics  
✅ **Responsive Design**: Mobile-first UI  
✅ **PWA Features**: Offline capability  

### What Doesn't Work on GitHub Pages

❌ **Database API**: Backend MongoDB integration (static hosting only)  
❌ **Cross-device Sync**: No backend API for cloud sync  

### Hybrid Mode for GitHub Pages

The app automatically detects GitHub Pages environment and:

- Uses localStorage exclusively (no API calls)
- Maintains full functionality for single-device use
- Preserves all existing games and data
- Shows appropriate UI messaging

## 🔧 Troubleshooting

### Common Issues

#### 1. **404 on GitHub Pages**

```bash
# Ensure base href is correct
npm run build:ghpages
```

#### 2. **Build Fails**

```bash
# Update Angular CLI if needed
npm install -g @angular/cli@latest

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Routing Issues**

GitHub Pages doesn't support Angular routing by default. The app uses hash routing which works on static hosting.

#### 4. **Actions Workflow Fails**

- Check the Actions tab in your GitHub repo
- Ensure you have the necessary permissions
- Verify package.json scripts are correct

### Build Errors

#### "Unknown argument: prod"

✅ **Fixed!** Use `npm run build:ghpages` instead of `--prod`

#### "Cannot resolve module"

```bash
npm ci  # Clean install from package-lock.json
```

#### "Out of memory"

```bash
# Increase Node.js memory if needed
node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build --configuration=production
```

## 📊 Performance Optimizations

The GitHub Pages build includes:

- **Tree shaking**: Removes unused code
- **Minification**: Reduces file sizes
- **AOT compilation**: Ahead-of-time compilation
- **Asset optimization**: Optimized images and fonts
- **Gzip compression**: Automatic compression by GitHub Pages

## 🔄 Update Deployment

To update your deployed app:

```bash
# Make your changes, then:
git add .
git commit -m "Update app"
git push origin main

# GitHub Actions will automatically redeploy
```

Or manually:

```bash
npm run deploy
```

## 🎮 Testing Before Deployment

Always test locally before deploying:

```bash
# Build and serve locally to test production build
npm run build:ghpages
npx http-server dist/rugby-score-card-app -p 8080

# Visit http://localhost:8080 to test
```

## 📱 Mobile Optimization

The app is optimized for GitHub Pages mobile use:

- Responsive design works on all devices
- Fast loading with optimized assets
- PWA capabilities for offline use
- Touch-friendly UI elements

Your Rugby Score Tracker is ready for GitHub Pages! 🏉✨
