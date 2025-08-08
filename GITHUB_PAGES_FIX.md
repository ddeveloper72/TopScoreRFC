# 🔧 Quick Fix: GitHub Pages 404 Error

## Problem: Getting 404 "File not found" on GitHub Pages

This happens when GitHub Pages isn't properly configured or the `gh-pages` branch doesn't exist.

## ✅ Solution Steps

### Step 1: Enable GitHub Pages (Required)

1. Go to your repository: <https://github.com/ddeveloper72/TopScoreRFC>
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**: Select "Deploy from a branch"
5. Under **Branch**: Select "gh-pages"
6. Under **Folder**: Select "/ (root)"
7. Click **Save**

### Step 2: Verify Deployment Files

```bash
# Check if gh-pages branch exists
git ls-remote --heads origin gh-pages

# If not found, deploy manually:
npm run build:ghpages
cd dist/rugby-score-card-app/browser
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
git push -f origin gh-pages
cd ../../..
```

### Step 3: Wait and Verify

- Wait 5-10 minutes for GitHub Pages to update
- Check deployment status in repository **Actions** tab
- Visit: <https://ddeveloper72.github.io/TopScoreRFC/>

## 🚀 Future Deployments

Once setup is complete, use any of these methods:

```bash
# Automatic deployment
npm run deploy

# Or use deployment scripts
./deploy.bat      # Windows
./deploy.sh       # Linux/Mac
```

## 🔍 Troubleshooting

### "Branch not found"

- The gh-pages branch needs to be created first
- Use the manual deployment commands above

### "Still getting 404"

- Check repository settings → Pages
- Ensure "gh-pages" branch is selected
- Wait up to 10 minutes for DNS propagation

### "Build fails"

- Run `npm run build:ghpages` first
- Check for any build errors
- Ensure all dependencies are installed

## ✅ Verification Checklist

- [ ] Repository has gh-pages branch
- [ ] GitHub Pages is enabled in settings  
- [ ] Source is set to gh-pages branch
- [ ] Waited 5-10 minutes after deployment
- [ ] No build errors in terminal

Your Rugby Score Tracker will be live at: <https://ddeveloper72.github.io/TopScoreRFC/>
