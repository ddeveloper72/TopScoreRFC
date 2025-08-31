# Rugby Score Tracker - TopScoreRFC

[![Deploy to GitHub Pages](https://github.com/ddeveloper72/TopScoreRFC/actions/workflows/deploy.yml/badge.svg)](https://github.com/ddeveloper72/TopScoreRFC/actions/workflows/deploy.yml)

A professional, mobile-first Rugby score tracking application with stunning gradient UI design and MongoDB database integration, built with Angular 19, Node.js, and Express.

**🌐 Live Demo**: [https://ddeveloper72.github.io/TopScoreRFC/](https://ddeveloper72.github.io/TopScoreRFC/)

## ✨ What's New

🎨 **Stunning Mobile Design**: Beautiful purple gradient background with glassmorphic cards  
📱 **Optimized Mobile Controls**: 2x2 grid layout for perfect thumb navigation  
🎯 **Perfect Contrast**: White icons on colored buttons for maximum readability  
⚡ **Lightning Fast**: Optimized SCSS and responsive design for all devices  
🏉 **Production Ready**: Deployed and tested on GitHub Pages

## 🎯 Project Status

✅ **Production Ready** - Complete rugby score tracking application  
✅ **Live & Deployed** - Successfully running on GitHub Pages  
✅ **Database Integration** - MongoDB backend with hybrid localStorage fallback  
✅ **Mobile Optimized** - Beautiful responsive design for all devices  
✅ **Performance Optimized** - Resolved SCSS budget issues, fast loading  
✅ **CI/CD Pipeline** - Automated deployment via GitHub Actions

### ⚡ Quick Start

**Ready to use right now:**

1. **Visit Live App**: [https://ddeveloper72.github.io/TopScoreRFC/](https://ddeveloper72.github.io/TopScoreRFC/)
2. **Start Tracking**: Click "Start" and begin scoring immediately
3. **Edit Teams**: Tap on team names to customize
4. **Track Scores**: Use the beautiful scoring buttons
5. **View History**: See all scoring events in the history section

**For Developers:**

```bash
git clone https://github.com/ddeveloper72/TopScoreRFC.git
cd TopScoreRFC
npm install
npm start
```

Visit `http://localhost:4200` - no additional setup required!

## 🏈 Features

### ✨ Modern UI Design

- **Stunning Visual Design**: Beautiful purple gradient background with glassmorphic white cards
- **Mobile-First Controls**: Optimized 2x2 grid button layout for thumb navigation
- **Perfect Contrast**: White icons on colored backgrounds for maximum readability
- **Smooth Animations**: Hover effects and transitions for professional feel
- **Responsive Layout**: Seamlessly adapts from mobile to desktop

### Core Rugby Functionality

- **Real-time Score Tracking**: Track scores for both teams with live updates
- **Complete Rugby Scoring**: Supports all rugby scoring types:
  - Try (5 points) - Red gradient button
  - Conversion (2 points) - Teal gradient button  
  - Penalty Kick (3 points) - Blue gradient button
  - Drop Goal (3 points) - Orange gradient button
  - Penalty Try (5 points) - Dark red gradient button
- **Game Timer**: Built-in timer with beautiful translucent display
- **Score History**: Complete log of all scoring events with timestamps
- **Team Management**: Edit team names with inline editing
- **Smart Undo**: Easily undo the last score with visual feedback

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

- **Mobile-First Design**: Stunning gradient UI optimized for phones, tablets, and desktops
- **Touch-Friendly Interface**: 44px minimum button heights with perfect spacing
- **Offline Support**: Continue tracking even without internet connection
- **Smart URL Handling**: Custom 404 page with auto-redirect for typos
- **Lightning Fast**: Optimized bundles and intelligent caching
- **Progressive Web App**: Can be installed on mobile devices for native-like experience

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
