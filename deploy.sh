#!/bin/bash

# Rugby Score Tracker - GitHub Pages Deployment Script
# Run this script from the project root directory

echo "🏉 Deploying Rugby Score Tracker to GitHub Pages..."

# Step 1: Build the application
echo "📦 Building application for GitHub Pages..."
npm run build:ghpages

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi

# Step 2: Check if build output exists
if [ ! -d "dist/rugby-score-card-app/browser" ]; then
    echo "❌ Build output not found. Please check your build configuration."
    exit 1
fi

# Step 3: Deploy to gh-pages branch
echo "🚀 Deploying to GitHub Pages..."
cd dist/rugby-score-card-app/browser

# Initialize git repository in build output
git init
git add .
git commit -m "Deploy Rugby Score Tracker v$(date +%Y%m%d-%H%M%S)"

# Set up remote and push to gh-pages branch
git branch -M gh-pages
git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
git push -f origin gh-pages

# Return to project root
cd ../../..

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/ddeveloper72/TopScoreRFC/settings/pages"
echo "2. Set source to 'gh-pages' branch"
echo "3. Wait 5-10 minutes for deployment"
echo "4. Visit: https://ddeveloper72.github.io/TopScoreRFC/"
echo ""
echo "🏉 Your Rugby Score Tracker will be live soon!"
