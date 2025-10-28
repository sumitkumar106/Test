# Bus Stand App - Backend API

Node.js Express backend with MongoDB for the Bus Stand App.

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Update the following variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong secret key (min 32 characters)
- `JWT_REFRESH_SECRET` - Another strong secret key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (for Phase 3)
- `GOOGLE_GEOCODING_API_KEY` - Google Geocoding API key (for Phase 2)

3. **Start MongoDB**
Ensure MongoDB is running locally or use MongoDB Atlas cloud database.

4. **Run Development Server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/users/fcm-token` - Update FCM token for notifications

### Health Check
- `GET /health` - Server health check
- `GET /` - API welcome message

## Database Models

### User
- Name, email, password (hashed)
- Role (passenger or driver)
- FCM token for push notifications

### Bus
- Driver ID, bus name, bus number
- Start/end stands and times
- Run days (S, M, T, W, Th, F, Sa)
- Stoppages array with lat/long coordinates

### ActiveTracking
- Bus ID, user ID
- Current GPS location
- Last updated timestamp

### SearchHistory
- User ID, from/to stands
- Search timestamp

### Alarm
- User ID, bus ID
- Stoppage name, minutes before
- Active status, triggered timestamp

## Implementation Status

### ✅ Phase 1: Complete
- [x] Project structure
- [x] MongoDB connection
- [x] User model with validation
- [x] All database schemas (User, Bus, ActiveTracking, SearchHistory, Alarm)
- [x] JWT authentication middleware
- [x] Auth routes (register, login, refresh, logout)
- [x] Error handling
- [x] CORS configuration

### 🔄 Phase 2: Next Steps
- [ ] Bus CRUD endpoints
- [ ] Passenger search endpoint with priority sorting
- [ ] Google Geocoding integration
- [ ] Driver management routes

### ⏳ Future Phases
- Phase 3: GPS tracking endpoints
- Phase 4: AI service integration
- Phase 5: Alarm monitoring and notifications
- Phase 6: Search history management

## Testing

### Manual Testing
Use Postman or curl to test endpoints:

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "passenger"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Bus.js                # Bus schema with stoppages
│   │   ├── ActiveTracking.js     # GPS tracking schema
│   │   ├── SearchHistory.js      # Search history schema
│   │   └── Alarm.js              # Alarm schema
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── routes/
│   │   └── auth.js               # Authentication endpoints
│   ├── services/                 # Business logic (future)
│   └── server.js                 # Main server file
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **axios** - HTTP client (for external APIs)
- **node-cron** - Scheduled tasks
- **firebase-admin** - Push notifications

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with short expiration (15 min access, 7 day refresh)
- Input validation on all endpoints
- CORS enabled for mobile app
- Environment variables for sensitive data

## Next Steps

1. Install dependencies: `npm install`
2. Configure .env file
3. Start MongoDB
4. Run server: `npm run dev`
5. Test authentication endpoints
6. Implement Phase 2 features (bus listings and search)
