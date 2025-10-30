# Bus Stand Manager

**Your Route, Your Way** - A production-level web application for managing bus routes and schedules.

## Features

- 🚌 **Create and manage bus routes** with complete schedule details
- 📍 **Multiple stoppages** with arrival times
- 📅 **Day-based scheduling** (select which days the bus runs)
- ☁️ **Cloud sync** with Firebase Firestore
- 💾 **Offline support** with LocalStorage fallback
- 🤖 **AI-powered suggestions** using Google Gemini AI
- 💰 **Monetized** with Google AdSense
- 📱 **Responsive design** works on all devices
- ✨ **Modern UI** matching the provided mockup

## Technology Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Firebase (Firestore for data, Authentication for users)
- **AI Integration:** Google Gemini AI API
- **Monetization:** Google AdSense
- **Storage:** LocalStorage (guest mode) + Firestore (cloud sync)

## Project Structure

```
Test/
├── index.html                    # Main HTML entry point
├── config.js                     # Configuration (gitignored)
├── config.example.js             # Configuration template
├── README.md                     # This file
├── .gitignore                    # Git ignore rules
│
├── css/
│   ├── main.css                  # Main stylesheet
│   ├── components.css            # Component styles
│   └── responsive.css            # Responsive styles
│
├── js/
│   ├── app.js                    # Main app initialization
│   ├── router.js                 # SPA routing
│   │
│   ├── services/
│   │   ├── firebase.js           # Firebase initialization
│   │   ├── firestore.js          # Firestore CRUD operations
│   │   ├── gemini.js             # Google Gemini AI service
│   │   ├── storage.js            # LocalStorage operations
│   │   └── adsense.js            # Google AdSense setup
│   │
│   ├── components/
│   │   ├── RouteCard.js          # Route card component
│   │   ├── DaySelector.js        # Day picker component
│   │   ├── TimePickerInput.js    # Time picker component
│   │   ├── StoppageInput.js      # Stoppage input component
│   │   ├── Toast.js              # Toast notifications
│   │   ├── Modal.js              # Modal dialogs
│   │   └── AdBanner.js           # AdSense banner component
│   │
│   ├── screens/
│   │   ├── RoutesListScreen.js   # Routes list page
│   │   ├── AddRouteScreen.js     # Add route form
│   │   ├── RouteDetailsScreen.js # Route details page
│   │   └── EditRouteScreen.js    # Edit route form
│   │
│   └── utils/
│       ├── validation.js         # Form validation functions
│       ├── formatting.js         # Date/time formatting
│       └── helpers.js            # Helper utilities
│
└── assets/
    ├── images/                   # Images and icons
    └── fonts/                    # Custom fonts (optional)
```

## Setup Instructions

### 1. Clone/Download the Project

```bash
cd /path/to/your/projects
# Project is already in Test/ directory
```

### 2. Configure API Keys

Copy the example configuration file:

```bash
cp config.example.js config.js
```

Edit `config.js` and add your API keys:

```javascript
const CONFIG = {
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  geminiApiKey: "YOUR_GEMINI_API_KEY",
  adsense: {
    client: "ca-pub-YOUR_PUBLISHER_ID",
    slotBanner: "YOUR_BANNER_SLOT_ID",
    slotInterstitial: "YOUR_INTERSTITIAL_SLOT_ID"
  }
};
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location
4. Enable **Authentication** (optional, currently using anonymous auth):
   - Go to Authentication
   - Enable Anonymous sign-in method
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Web app" icon to add web app
   - Copy the configuration and paste into `config.js`

#### Firestore Security Rules

Set these rules in Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /routes/{routeId} {
      // Allow read/write for authenticated users on their own routes
      allow read, write: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         resource.data.deviceId == request.auth.uid);

      // Allow create for authenticated users
      allow create: if request.auth != null;
    }
  }
}
```

### 4. Google Gemini AI Setup

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Get your API key
3. Enable the Gemini API
4. Add the key to `config.js` under `geminiApiKey`

### 5. Google AdSense Setup

1. Create an [AdMob account](https://admob.google.com/) or [AdSense account](https://adsense.google.com/)
2. Create your app/website
3. Create ad units:
   - Banner ad (320x50)
   - Interstitial ad
4. Get your Publisher ID and Ad Unit IDs
5. Add them to `config.js` under `adsense`
6. Update the AdSense script tag in `index.html` with your Publisher ID

### 6. Run the Application

#### Option 1: Using Python HTTP Server

```bash
cd Test
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Using Node.js http-server

```bash
npm install -g http-server
cd Test
http-server -p 8000
```

#### Option 3: Using VSCode Live Server

1. Install "Live Server" extension in VSCode
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 7. Testing

Open the application in your browser and test:

1. ✅ App loads successfully
2. ✅ Routes list screen displays (empty state)
3. ✅ Click "+" button to add route
4. ✅ Fill out the form (test all fields)
5. ✅ Type in "Bus Name" field - AI suggestions should appear (if Gemini API configured)
6. ✅ Select multiple days
7. ✅ Add multiple stoppages
8. ✅ Click "Save" - success toast should appear
9. ✅ Interstitial ad should display (if AdSense configured)
10. ✅ Route appears in routes list
11. ✅ Click route card - details screen opens
12. ✅ Click "Edit" - form pre-fills with data
13. ✅ Update and save - changes reflected
14. ✅ Click "Delete" - confirmation dialog appears
15. ✅ Confirm delete - route removed from list

## Features Detail

### 1. Routes List Screen

- Displays all saved routes as cards
- Shows bus name, number, schedule, and operating days
- Tap any card to view full details
- Floating "+" button to add new route
- Pull to refresh (on supported devices)
- Empty state when no routes exist

### 2. Add Route Screen

- Complete form for bus route details
- **AI-powered bus name suggestions** (using Gemini AI)
- Time pickers for start/end times (outbound and return)
- Day selector for operating days
- Dynamic stoppage inputs (add/remove multiple)
- Form validation with error messages
- Saves to Firestore (with LocalStorage fallback)
- Success toast notification
- Interstitial ad after saving
- Form resets after save

### 3. Route Details Screen

- Complete route information display
- Basic info card (name, number, created date)
- Outbound schedule card
- Return trip schedule card
- Operating days display
- Stoppages list with arrival times
- Edit and Delete buttons
- Delete confirmation dialog

### 4. Edit Route Screen

- Same as Add Route but pre-filled with existing data
- Updates existing route in Firestore/LocalStorage
- Success toast after update
- Navigates back to details after save

## Data Storage

### Guest Mode (LocalStorage)

- Routes saved locally on device
- Persists across browser sessions
- No account required
- Limited to single device

### Cloud Sync (Firebase Firestore)

- Routes synced to cloud
- Anonymous authentication enabled
- Device ID tracked for guest users
- Data persists across devices (with same account)

### Data Schema

```javascript
{
  id: string,
  busName: string,
  busNumber: string,
  outbound: {
    startTime: "HH:MM AM/PM",
    endTime: "HH:MM AM/PM"
  },
  returnTrip: {
    startTime: "HH:MM AM/PM",
    endTime: "HH:MM AM/PM"
  },
  runDays: {
    sunday: boolean,
    monday: boolean,
    // ... other days
  },
  stoppages: [
    {
      name: string,
      arrivalTime: "HH:MM AM/PM",
      order: number
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean
}
```

## API Integration

### Google Gemini AI

- Used for bus name auto-suggestions
- Triggers when typing in "Bus Name" field (3+ characters)
- Debounced API calls (500ms) to reduce requests
- Graceful fallback if API fails
- Shows loading indicator while fetching

### Google AdSense

- Banner ads at bottom of all screens (60px height)
- Interstitial ad after successfully saving route
- Respects ad blocker (shows message if detected)
- Test IDs used during development

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### File Naming Conventions

- **PascalCase** for component files (e.g., `RouteCard.js`)
- **camelCase** for utility files (e.g., `helpers.js`)
- **kebab-case** for CSS files (e.g., `main.css`)
- **lowercase** for HTML files (e.g., `index.html`)

### Code Style

- Use ES6+ JavaScript features
- No dependencies (pure vanilla JS)
- Comments for all major functions
- Consistent indentation (2 spaces)
- Semicolons required

### Adding New Features

1. Create component/screen file in appropriate directory
2. Add script tag to `index.html` (in correct order)
3. Follow existing patterns for consistency
4. Test thoroughly on multiple browsers

## Troubleshooting

### Routes Not Saving

- **Check Firebase configuration** in `config.js`
- **Check browser console** for errors
- **Verify Firestore security rules** allow your operations
- **Try opening in incognito mode** to test with clean state

### AI Suggestions Not Working

- **Verify Gemini API key** is correct in `config.js`
- **Check API key has Gemini API enabled** in Google Cloud Console
- **Check browser console** for API errors
- **Try with different input** (at least 3 characters)

### Ads Not Displaying

- **Verify AdSense Publisher ID** in `config.js` and `index.html`
- **Check ad blocker** is disabled
- **Use test ad IDs** during development
- **AdSense requires approved account** for live ads

### LocalStorage Full

- **Clear browser data** or use private browsing
- **Export routes** before clearing (feature can be added)
- **Use Firestore** instead for unlimited storage

## Production Deployment

### Hosting Options

1. **Firebase Hosting** (recommended)
2. **Netlify**
3. **Vercel**
4. **GitHub Pages**
5. **Any static hosting service**

### Pre-Deployment Checklist

- [ ] Replace all API keys with production keys
- [ ] Update Firebase security rules for production
- [ ] Replace AdSense test IDs with production IDs
- [ ] Test on multiple browsers and devices
- [ ] Optimize images (if any added)
- [ ] Enable service worker for offline support (optional)
- [ ] Set up custom domain (optional)
- [ ] Test all features end-to-end

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
cd Test
firebase init hosting

# Select your Firebase project
# Set public directory to: . (current directory)
# Configure as single-page app: Yes
# Set up automatic builds: No

# Deploy
firebase deploy --only hosting
```

Your app will be live at `https://your-project.web.app`

## License

This project is open source. Feel free to use and modify as needed.

## Support

For issues or questions:
- Check browser console for errors
- Verify all API keys are configured correctly
- Test with different browsers
- Check Firebase/Gemini/AdSense documentation

## Credits

- Built with ❤️ for efficient bus route management
- Powered by Firebase, Google Gemini AI, and Google AdSense
- UI designed to match provided mockup specifications

---

**Version:** 1.0.0
**Last Updated:** 2025-01-15
