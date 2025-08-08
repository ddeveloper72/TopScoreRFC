# 🚀 GitHub Pages Deployment - Alternative Methods

## Issue: angular-cli-ghpages Command Not Found

When you get the error: `'angular-cli-ghpages' is not recognized as an internal or external command`, here are several solutions:

## ✅ Solution 1: Manual GitHub Pages Deployment (Recommended)

This method works without additional dependencies:

### Step 1: Build the app

```bash
npm run build:ghpages
```

### Step 2: Initialize git in dist folder and push to gh-pages branch

```bash
cd dist/rugby-score-card-app/browser
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
git push -f origin gh-pages
cd ../../..
```

### Step 3: Enable GitHub Pages

1. Go to your GitHub repository settings
2. Scroll to "Pages" section  
3. Set Source to "Deploy from a branch"
4. Select branch: `gh-pages`
5. Select folder: `/ (root)`
6. Click "Save"

## ✅ Solution 2: Using GitHub Actions (Automatic)

The project already has `.github/workflows/deploy.yml` configured. Just push your code:

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

GitHub Actions will automatically build and deploy your app!

## ✅ Solution 3: Fix angular-cli-ghpages Installation

If you prefer using the angular-cli-ghpages tool:

### Option A: Global Installation

```bash
npm install -g angular-cli-ghpages
npm run deploy
```

### Option B: Use npx (already updated in package.json)

```bash
# Should work after installation completes
npm run deploy
```

### Option C: Direct npx command

```bash
npm run build:ghpages
npx angular-cli-ghpages --dir=dist/rugby-score-card-app/browser
```

## ✅ Solution 4: Using gh-pages Package (Alternative)

Install a different deployment package:

```bash
npm install --save-dev gh-pages
```

Add this script to package.json:

```json
"deploy:gh": "npm run build:ghpages && gh-pages -d dist/rugby-score-card-app/browser"
```

Then run:

```bash
npm run deploy:gh
```

## 🎯 Recommended Approach

**For immediate deployment**: Use **Solution 1 (Manual)**
**For ongoing development**: Use **Solution 2 (GitHub Actions)**

## 📝 Manual Deployment Script (Copy-Paste Ready)

Here's a complete script you can copy and paste:

```bash
# Build the app
npm run build:ghpages

# Navigate to build output
cd dist/rugby-score-card-app/browser

# Initialize git and deploy
git init
git add .
git commit -m "Deploy Rugby Score Tracker to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
git push -f origin gh-pages

# Go back to project root
cd ../../..

echo "✅ Deployment complete! Enable GitHub Pages in your repo settings."
echo "🌐 Your app will be available at: https://ddeveloper72.github.io/TopScoreRFC/"
```

## 🔧 Troubleshooting

### "fatal: not a git repository"

Make sure you're in the project root directory before running commands.

### "Permission denied"

You may need to authenticate with GitHub:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### "Repository not found"

Verify the repository URL is correct:

```bash
git remote -v
```

### Build fails

Make sure the build completed successfully:

```bash
ls -la dist/rugby-score-card-app/browser/
# Should show index.html and other files
```

## 🎉 After Deployment

1. Go to <https://github.com/ddeveloper72/TopScoreRFC/settings/pages>
2. Set source to `gh-pages` branch
3. Wait 5-10 minutes for deployment
4. Visit <https://ddeveloper72.github.io/TopScoreRFC/>

Your Rugby Score Tracker will be live! 🏉✨
