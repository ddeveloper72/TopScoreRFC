# Rugby Score Tracker - TopScoreRFC

A mobile-first Rugby score tracking application with MongoDB database integration, built with Angular 19, Node.js, and Express.

**🌐 Live Demo**: [https://ddeveloper72.github.io/TopScoreRFC/](https://ddeveloper72.github.io/TopScoreRFC/)

## 🎯 Project Status

✅ **Fully Functional** - Complete rugby score tracking application  
🔄 **GitHub Pages Setup** - Deployment files ready, requires repository configuration  
✅ **Database Integration** - MongoDB backend with hybrid localStorage fallback  
✅ **Mobile Optimized** - Responsive design for all devices  
✅ **Production Ready** - Optimized builds with resolved SCSS budget issues  
✅ **CI/CD Pipeline** - Automated deployment via GitHub Actions

### ⚡ Quick Start for GitHub Pages

**To get your app live in 2 minutes:**

1. **Enable GitHub Pages:** Go to [Settings → Pages](https://github.com/ddeveloper72/TopScoreRFC/settings/pages)
2. **Set Source:** Choose "Deploy from a branch" → "gh-pages" → "/ (root)"
3. **Deploy:** Run `npm run deploy` in terminal
4. **Wait:** 5-10 minutes for GitHub to process
5. **Visit:** <https://ddeveloper72.github.io/TopScoreRFC/>

**Current Status:** App is built and ready, just needs GitHub Pages enabled in repository settings.

### 🚨 GitHub Pages Troubleshooting

If you see a 404 error on GitHub Pages, see the [Quick Fix Guide](./GITHUB_PAGES_FIX.md) for detailed steps.

**Quick Steps:**

1. **Enable GitHub Pages in Repository Settings:**
   - Go to [repository settings](https://github.com/ddeveloper72/TopScoreRFC/settings/pages)
   - Under "Source", select "Deploy from a branch"
   - Choose "gh-pages" branch and "/ (root)" folder
   - Click "Save"

2. **Wait for Deployment:**
   - GitHub Pages can take 5-10 minutes to update
   - Check the Actions tab for deployment status

3. **Verify gh-pages Branch Exists:**

   ```bash
   git branch -r  # Should show origin/gh-pages
   ```

4. **Manual Deployment if Needed:**

   ```bash
   npm run build:ghpages
   cd dist/rugby-score-card-app/browser
   git init && git add . && git commit -m "Deploy"
   git branch -M gh-pages
   git remote add origin https://github.com/ddeveloper72/TopScoreRFC.git
   git push -f origin gh-pages
   cd ../../..
   ```

## 🏈 Features

### Core Functionality

- **Real-time Score Tracking**: Track scores for both teams with live updates
- **Rugby Scoring Rules**: Supports all rugby scoring types:
  - Try (5 points)
  - Conversion (2 points)
  - Penalty Kick (3 points)
  - Drop Goal (3 points)
  - Penalty Try (5 points)
- **Game Timer**: Built-in timer to track game duration
- **Score History**: Complete log of all scoring events with timestamps
- **Team Management**: Edit team names on the fly
- **Undo Functionality**: Easily undo the last score if needed

### Match Booking & Calendar

- **Professional Match Booking**: Advanced dialog with Material Design
- **Date/Time Validation**: Prevents past dates, limits to 1 year advance
- **Interactive Time Picker**: Clickable schedule icon with popular time options
- **Match Persistence**: All bookings saved to localStorage, survive page refreshes
- **Competition Management**: Pre-defined competition types
- **Smart Validation**: Prevents duplicate teams, validates required fields
- **Responsive Forms**: Mobile-friendly booking interface

### Database & Storage

- **MongoDB Integration**: Cloud database storage with MongoDB Atlas
- **Hybrid Storage**: Automatic fallback to localStorage when API unavailable
- **Data Synchronization**: Sync game data across devices
- **Match Persistence**: All match bookings automatically saved to browser storage
- **Import/Export**: Backup and restore functionality

### User Experience

- **Mobile-First Design**: Optimized for phones, tablets, and desktops
- **Responsive UI**: Looks great on all screen sizes
- **Offline Support**: Continue tracking even without internet connection
- **Smart URL Handling**: Custom 404 page with auto-redirect for typos
- **Fast Loading**: Smart caching and hybrid storage system
- **Progressive Web App**: Can be installed on mobile devices
- **Smart URL Handling**: Automatic redirection for mistyped URLs to dashboard

## 🚀 Quick Start

### For Database Integration (Recommended)

For full features including cloud sync and data persistence:

1. **Setup MongoDB Database**: Follow our comprehensive [Database Setup Guide](./DATABASE_SETUP.md)
2. **Start Full-Stack App**:

```bash
npm run dev:full
```

Visit:

- Frontend: <http://localhost:4200>
- Backend API: <http://localhost:3000>

### For Local Development Only

To run just the Angular app with localStorage:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:4200`

## 🗂️ Project Structure

```
TopScoreRFC/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── services/
│   │   │   ├── api.service.ts                    # HTTP API communication
│   │   │   ├── game-storage-hybrid.service.ts   # Hybrid storage manager
│   │   │   └── game-storage-local.service.ts    # localStorage service
│   │   ├── score-tracker/        # Main score tracking component
│   │   └── calendar/             # Game history and statistics
├── backend/                      # Node.js/Express API
│   ├── server.js                 # Express server with security middleware
│   ├── models/Game.js            # MongoDB/Mongoose game schema
│   ├── controllers/              # API route handlers
│   ├── routes/                   # API endpoint definitions
│   └── .env                      # Database connection configuration
└── DATABASE_SETUP.md             # Complete setup instructions

## 📱 Usage

### Starting a Game

1. Click "Start Game" to begin timing
2. Edit team names by clicking on them
3. Use the scoring buttons to add points

### Scoring

- **Try**: Award 5 points for crossing the goal line
- **Conversion**: Award 2 points for successful kick after try
- **Penalty**: Award 3 points for penalty kick
- **Drop Goal**: Award 3 points for drop goal during play
- **Penalty Try**: Award 5 points for penalty try (no conversion needed)

### Game Management

- **End Game**: Stop the timer
- **Reset**: Clear all scores and restart
- **Undo**: Remove the last scoring event

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 🚀 Deployment

### GitHub Pages (Live Production App)

**🔄 Deployment Status**: GitHub Pages setup in progress

**📋 Setup Required**:

1. Enable GitHub Pages in [repository settings](https://github.com/ddeveloper72/TopScoreRFC/settings/pages)
2. Select "gh-pages" branch as source
3. Wait 5-10 minutes for deployment

**🌐 Live URL**: [https://ddeveloper72.github.io/TopScoreRFC/](https://ddeveloper72.github.io/TopScoreRFC/) *(will be active once setup is complete)*

Deploy your latest changes:

```bash
# Method 1: Using npm script (recommended)
npm run deploy

# Method 2: Using deployment scripts
./deploy.bat      # Windows
./deploy.sh       # Linux/Mac

# Method 3: Build only for manual deployment
npm run build:ghpages
```

**Deployment Features:**

- ✅ Automatic optimization and minification
- ✅ SCSS budget optimization (resolved build issues)
- ✅ Mobile-responsive design
- ✅ Offline functionality with localStorage
- ✅ Fast loading with optimized bundles

### GitHub Actions (Automatic Deployment)

The project includes automatic deployment via GitHub Actions:

- Pushes to `main` branch automatically deploy to GitHub Pages
- Uses optimized production builds with Angular 19
- Configured in `.github/workflows/deploy.yml`
- No manual intervention required

### Full-Stack Development & Deployment

For local development with backend API:

```bash
# Start both frontend and backend together
npm run dev:full

# Or start separately
npm run backend:dev    # API server on port 3000
npm start             # Angular app on port 4200
```

For production deployment with backend API, see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for backend deployment options.

## 📚 Documentation

- 📖 [Database Setup Guide](./DATABASE_SETUP.md) - Complete MongoDB integration
- 🚀 [GitHub Pages Deployment](./GITHUB_PAGES_DEPLOYMENT.md) - Deployment instructions
- 🎨 [SCSS Optimization](./SCSS_OPTIMIZATION.md) - Style optimization guide
- 🔧 [Deployment Alternatives](./DEPLOYMENT_ALTERNATIVES.md) - Alternative deployment methods

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development
npm start                    # Frontend only (port 4200)
npm run backend:dev         # Backend only (port 3000)  
npm run dev:full           # Both frontend & backend

# Building
npm run build              # Development build
npm run build:prod         # Production build
npm run build:ghpages      # GitHub Pages build

# Deployment
npm run deploy             # Deploy to GitHub Pages
npm run predeploy          # Pre-deployment build

# Backend
npm run backend:install    # Install backend dependencies
npm run backend:start      # Start backend in production mode

# Testing
npm test                   # Run unit tests
ng e2e                     # Run e2e tests (framework required)
```

## Running Tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner:

```bash
npm test
```

For end-to-end (e2e) testing:

```bash
ng e2e
```

*Note: Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.*

## 🎯 Performance & Optimization

The application includes several optimizations:

- **Bundle Size Optimization**: SCSS budgets configured for large stylesheets
- **Lazy Loading**: Components loaded on demand
- **Tree Shaking**: Unused code eliminated in production builds  
- **AOT Compilation**: Ahead-of-time compilation for faster runtime
- **Service Worker**: PWA capabilities for offline usage
- **Hybrid Storage**: Intelligent fallback between API and localStorage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🏉 About

Rugby Score Tracker was built to provide rugby enthusiasts with a modern, mobile-first scoring application. Whether you're tracking local club matches or international tournaments, this app provides all the tools you need for accurate score keeping.

## 📞 Support & Issues

- 🐛 Report bugs via [GitHub Issues](https://github.com/ddeveloper72/TopScoreRFC/issues)
- 💡 Request features via [GitHub Issues](https://github.com/ddeveloper72/TopScoreRFC/issues)
- 📖 Check the [documentation files](./DATABASE_SETUP.md) for detailed guides

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
