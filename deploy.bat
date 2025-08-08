@echo off
REM Rugby Score Tracker - GitHub Pages Deployment Script (Windows)
REM Run this script from the project root directory

echo 🏉 Deploying Rugby Score Tracker to GitHub Pages...

REM Step 1: Build the application
echo 📦 Building application for GitHub Pages...
call npm run build:ghpages

if errorlevel 1 (
    echo ❌ Build failed! Please check the error messages above.
    exit /b 1
)

REM Step 2: Check if build output exists
if not exist "dist\rugby-score-card-app\browser" (
    echo ❌ Build output not found. Please check your build configuration.
    exit /b 1
)

REM Step 3: Deploy to gh-pages branch
echo 🚀 Deploying to GitHub Pages...
cd dist\rugby-score-card-app\browser

REM Initialize git repository in build output
git init
git add .
git commit -m "Deploy Rugby Score Tracker"

REM Set up remote and push to gh-pages branch
git branch -M gh-pages
git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
git push -f origin gh-pages

REM Return to project root
cd ..\..\..

echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Go to: https://github.com/ddeveloper72/TopScoreRFC/settings/pages
echo 2. Set source to 'gh-pages' branch
echo 3. Wait 5-10 minutes for deployment
echo 4. Visit: https://ddeveloper72.github.io/TopScoreRFC/
echo.
echo 🏉 Your Rugby Score Tracker will be live soon!

pause
