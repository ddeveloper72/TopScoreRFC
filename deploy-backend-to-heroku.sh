#!/bin/bash

# Backend Deployment Script for Heroku
# Run this script from the project root directory after installing Heroku CLI

echo "🚀 Deploying Backend to Heroku..."

# Navigate to backend directory
cd backend

# Check if git is initialized in backend directory
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository in backend directory..."
    git init
    git add .
    git commit -m "Initial backend commit with new match fields"
fi

# Add Heroku remote if not exists
echo "🔗 Adding Heroku remote..."
git remote remove heroku 2>/dev/null
git remote add heroku https://git.heroku.com/rugbyappbackend.git

# Stage all changes
echo "📦 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Add new match type fields: matchType, homeTeamCategory, homeTeamAgeLevel, awayTeamAgeLevel"

# Push to Heroku
echo "🚀 Pushing to Heroku..."
git push heroku main --force

echo "✅ Deployment complete!"
echo "🔍 You can check your app at: https://rugbyappbackend-4014b68ac4bb.herokuapp.com/"
