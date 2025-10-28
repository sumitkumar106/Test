# Bus Stand App - Mobile Application

React Native mobile app for iOS and Android.

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the following variables:
- `API_BASE_URL` - Backend API URL (default: http://localhost:5000)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (for Phase 3)
- Firebase configuration (for Phase 5)
- AdMob IDs (for Phase 7)

3. **iOS Setup** (macOS only)
```bash
cd ios
pod install
cd ..
```

4. **Run Development**

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Features

### ✅ Phase 1: Complete
- [x] Authentication system (Login/Signup)
- [x] JWT token management with auto-refresh
- [x] Global auth state with React Context
- [x] Protected routes
- [x] Secure token storage (AsyncStorage)
- [x] Input validation
- [x] Error handling
- [x] Loading states

### 🔄 Phase 2: Next Steps
- [ ] Home screen with search functionality
- [ ] Bus results display
- [ ] Search history
- [ ] Driver dashboard
- [ ] Bus listing creation/editing

### ⏳ Future Phases
- Phase 3: GPS tracking and maps
- Phase 4: AI arrival predictions display
- Phase 5: Push notifications and alarms
- Phase 6: Offline mode with SQLite
- Phase 7: AdMob integration

## Screens

### Implemented
1. **LoginScreen** - User login with email/password
2. **SignupScreen** - New user registration
3. **HomeScreen** - Main dashboard (basic UI, search features pending)

### Planned
- BusResultsScreen
- BusDetailsScreen with map
- DriverDashboardScreen
- DriverCreateBusScreen
- DriverEditBusScreen
- AlarmsScreen

## Architecture

### State Management
- **AuthContext** - Global authentication state
- React Context API for user data and auth status
- AsyncStorage for token persistence

### API Communication
- **apiClient.js** - Axios instance with:
  - Automatic Bearer token injection
  - Token refresh interceptor
  - Error handling

### Services
- **authService.js** - Authentication operations
  - register, login, logout
  - Token refresh
  - FCM token management

### Navigation
- **AppNavigator.js** - Main navigation structure
  - AuthStack (Login, Signup) for unauthenticated users
  - AppStack (Home, etc.) for authenticated users
  - Automatic routing based on auth state

## Project Structure

```
mobile/
├── src/
│   ├── api/
│   │   └── apiClient.js          # Axios instance with interceptors
│   ├── context/
│   │   └── AuthContext.js        # Global auth state
│   ├── navigation/
│   │   └── AppNavigator.js       # Navigation setup
│   ├── screens/
│   │   ├── LoginScreen.js        # Login UI
│   │   ├── SignupScreen.js       # Signup UI
│   │   └── HomeScreen.js         # Home dashboard
│   ├── services/
│   │   └── authService.js        # Auth API calls
│   ├── components/               # Reusable components (future)
│   ├── hooks/                    # Custom hooks (future)
│   ├── assets/                   # Images and icons
│   └── utils/                    # Helper functions (future)
├── App.js                        # Root component
├── index.js                      # Entry point
├── app.json                      # App configuration
├── package.json                  # Dependencies
├── .env                          # Environment variables
└── README.md                     # This file
```

## Dependencies

### Core
- **react-native** - Mobile framework
- **@react-navigation** - Navigation library
- **axios** - HTTP client
- **@react-native-async-storage/async-storage** - Secure storage

### Future Features
- **react-native-maps** - Google Maps integration
- **expo-location** - GPS tracking
- **react-native-google-mobile-ads** - AdMob
- **@react-native-firebase** - Push notifications
- **expo-sqlite** - Offline storage

## Authentication Flow

1. **App Launch**
   - Check for stored tokens in AsyncStorage
   - If valid, auto-login user
   - Navigate to Home if authenticated, Login if not

2. **Registration**
   - User enters name, email, password
   - API creates account and returns tokens
   - Tokens stored in AsyncStorage
   - Navigate to Home

3. **Login**
   - User enters email, password
   - API validates and returns tokens
   - Tokens stored in AsyncStorage
   - Navigate to Home

4. **Token Refresh**
   - Access token expires after 15 minutes
   - API interceptor detects 401 error
   - Automatically refreshes using refresh token
   - Retries original request
   - If refresh fails, logout and navigate to Login

5. **Logout**
   - Clear tokens from AsyncStorage
   - Reset auth state
   - Navigate to Login

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with valid credentials
- [ ] Sign up with existing email (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Auto-login on app restart
- [ ] Logout clears session

**Validation:**
- [ ] Email validation (format check)
- [ ] Password validation (min 8 characters)
- [ ] Name validation (2-100 characters)
- [ ] Error messages display correctly

**Navigation:**
- [ ] Login → Home transition
- [ ] Signup → Home transition
- [ ] Logout → Login transition
- [ ] Protected routes require authentication

## Running the App

### Prerequisites
- Node.js 16+ installed
- React Native CLI or Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Backend API running on localhost:5000

### Development Mode

1. **Start Backend API**
```bash
cd ../backend
npm run dev
```

2. **Start Metro Bundler**
```bash
npm start
```

3. **Launch iOS/Android**
```bash
npm run ios   # or npm run android
```

### Troubleshooting

**Cannot connect to backend:**
- Ensure backend is running on port 5000
- Check API_BASE_URL in .env
- For Android emulator, use `http://10.0.2.2:5000` instead of `localhost`

**Dependencies issues:**
- Delete node_modules and package-lock.json
- Run `npm install` again
- For iOS: `cd ios && pod install`

**Navigation errors:**
- Ensure all navigation packages installed
- Check AppNavigator.js for circular imports

## Next Steps

1. Install dependencies: `npm install`
2. Configure .env file
3. Ensure backend API is running
4. Run on simulator/emulator
5. Test authentication flow
6. Implement Phase 2 features (search and bus listings)

## UI Design

Screens follow mockup specifications:
- Clean, minimal design
- Black buttons with white text
- Input fields with border and padding
- Error messages in red (#d32f2f)
- Success states in green
- Banner ad placeholder in yellow (#F4E6A3)
