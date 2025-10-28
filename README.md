# 🚌 Bus Stand App

A real-time, intelligent bus tracking and scheduling platform for passengers and bus drivers.

## Overview

Bus Stand App enables passengers to search, track, and set alerts for buses traveling between any two stands, while allowing drivers to list, update, and manage their bus schedules and stops.

### Key Features

**For Passengers:**
- 🔍 Search buses by From → To stands or by bus number/name
- 📍 Live GPS tracking of buses
- ⏰ Set arrival alarms (10/20/30 min before)
- 🤖 AI-powered arrival time predictions
- 📱 Offline search history
- 🔔 Push notifications

**For Drivers:**
- 📝 Create and manage bus listings
- 🛤️ Add multiple stoppages with times and distances
- 📅 Set run days (S M T W Th F Sa)
- ✏️ Edit and update schedules anytime

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Mobile** | React Native (iOS & Android) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Tokens) |
| **Maps & GPS** | Google Maps API |
| **AI Predictions** | Python Flask/FastAPI |
| **Notifications** | Firebase Cloud Messaging |
| **Ads** | Google AdMob |
| **Offline Storage** | SQLite + AsyncStorage |

## Project Structure

```
Test/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication, validation
│   │   ├── services/       # Business logic
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── README.md
│
├── ai-service/             # Python AI prediction service
│   ├── app.py              # Flask/FastAPI app
│   ├── utils/              # Haversine calculations
│   ├── requirements.txt
│   └── README.md
│
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── screens/        # UI screens
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation setup
│   │   ├── context/        # Global state
│   │   ├── services/       # API clients
│   │   ├── api/            # Axios configuration
│   │   └── assets/         # Images, icons
│   ├── App.js
│   ├── package.json
│   └── README.md
│
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Python 3.8+ (for AI service)
- React Native development environment
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd Test
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Mobile App**
```bash
cd ../mobile
npm install
cp .env.example .env
# Edit .env with API URL
npm run ios    # or npm run android
```

4. **Setup AI Service (Phase 4)**
```bash
cd ../ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Environment Configuration

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bus_stand_app
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_GEOCODING_API_KEY=your_geocoding_api_key
AI_SERVICE_URL=http://localhost:5001
```

**Mobile (.env):**
```env
API_BASE_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Implementation Progress

### ✅ Phase 1: Core Infrastructure (COMPLETE)

**Backend:**
- [x] Project structure and dependencies
- [x] MongoDB connection and configuration
- [x] Database models (User, Bus, ActiveTracking, SearchHistory, Alarm)
- [x] JWT authentication system
- [x] Auth endpoints (register, login, refresh, logout)
- [x] Middleware for protected routes
- [x] Error handling and validation

**Mobile:**
- [x] React Native project setup
- [x] Navigation structure (Auth/App stacks)
- [x] Global authentication context
- [x] Login and Signup screens
- [x] API client with token refresh
- [x] Secure token storage
- [x] Home screen UI (basic)

**Deliverable:** Users can sign up, login, and access protected home screen ✅

### ✅ Phase 2: Bus Listings & Search (COMPLETE)

**Backend:**
- [x] Bus CRUD endpoints (create, read, update, delete)
- [x] Passenger search with priority sorting
- [x] Google Geocoding integration
- [x] Search history tracking
- [x] Driver-specific routes

**Mobile:**
- [x] Home screen search functionality
- [x] BusResults screen
- [x] Driver dashboard
- [x] Bus creation/editing forms
- [x] Search history display
- [x] BusDetails screen (basic version)

**Deliverable:** Drivers can create listings, passengers can search buses ✅

### ⏳ Phase 3: GPS Tracking & Maps

- [ ] GPS tracking endpoints
- [ ] Google Maps integration
- [ ] BusDetails screen with map
- [ ] "Inside This Bus" toggle
- [ ] Live location updates
- [ ] Animated bus position

**Deliverable:** Real-time bus tracking on map

### ⏳ Phase 4: AI Predictions

- [ ] Python AI service implementation
- [ ] Haversine distance calculations
- [ ] Speed and ETA predictions
- [ ] Backend integration
- [ ] Display predictions in app

**Deliverable:** AI-powered arrival time predictions

### ⏳ Phase 5: Alarms & Notifications

- [ ] Firebase Cloud Messaging setup
- [ ] Alarm management endpoints
- [ ] Local notification scheduling
- [ ] Push notification service
- [ ] Alarm monitor cron job
- [ ] Alarms screen

**Deliverable:** Users receive notifications when bus approaches

### ⏳ Phase 6: Offline Support

- [ ] SQLite database setup
- [ ] Offline caching service
- [ ] Network status detection
- [ ] Data sync service
- [ ] Offline indicators

**Deliverable:** App works offline with cached data

### ⏳ Phase 7: Ads & Polish

- [ ] Google AdMob integration
- [ ] Banner ad component
- [ ] UI polish and refinements
- [ ] Performance optimization
- [ ] Loading states
- [ ] Error handling improvements

**Deliverable:** Monetized app with polished UX

### ⏳ Phase 8: Testing & Deployment

- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Production builds
- [ ] Backend deployment
- [ ] AI service deployment
- [ ] App Store submission
- [ ] Google Play submission

**Deliverable:** App live in both app stores

## API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "passenger"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**POST /api/auth/refresh**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Health Check

**GET /health**
```json
{
  "success": true,
  "message": "Bus Stand API is running"
}
```

## Database Schema

### User
```
{
  _id: ObjectId
  name: String
  email: String (unique)
  password_hash: String
  role: "passenger" | "driver"
  fcm_token: String
  created_at: Date
  updated_at: Date
}
```

### Bus
```
{
  _id: ObjectId
  driver_id: ObjectId (ref: User)
  bus_name: String
  bus_number: String (unique)
  start_stand: String
  end_stand: String
  start_time: String (HH:MM AM/PM)
  end_time: String (HH:MM AM/PM)
  run_days: ["S", "M", "T", "W", "Th", "F", "Sa"]
  stoppages: [{
    name: String
    arrival_time: String
    distance_km: Number
    sequence_order: Number
    latitude: Number
    longitude: Number
  }]
  created_at: Date
  updated_at: Date
}
```

## Testing

### Manual Testing

1. **Start Backend**
```bash
cd backend && npm run dev
```

2. **Test Authentication**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

3. **Test Mobile App**
- Launch iOS/Android simulator
- Run `npm run ios` or `npm run android`
- Test signup/login flow
- Verify token persistence (close and reopen app)

## Performance Requirements

| Metric | Target |
|--------|--------|
| Page load time | < 2s |
| API response time | < 500ms |
| GPS update interval | 5s |
| AI prediction time | < 2s |
| App size | < 50MB (Android) / < 60MB (iOS) |

## Security

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with short expiration (15 min access, 7 day refresh)
- ✅ HTTPS only in production
- ✅ Input validation on all endpoints
- ✅ CORS configured for mobile app
- ✅ Secure token storage (AsyncStorage encrypted on iOS)
- ✅ Environment variables for sensitive data

## Contributing

1. Follow existing code structure
2. Use meaningful variable/function names
3. Add comments for complex logic
4. Test before committing
5. Update documentation

## License

ISC

## Support

For issues or questions:
- Check README files in each directory
- Review planning.md for detailed specifications
- Create an issue in the repository

---

**Current Status:** Phase 1 Complete ✅ | Phase 2 Next 🔄

**Next Steps:**
1. Implement bus CRUD endpoints (Backend)
2. Add Google Geocoding integration
3. Build driver dashboard screens (Mobile)
4. Implement passenger search functionality