# Bus Stand App - AI Prediction Service

Python Flask/FastAPI microservice for real-time bus arrival predictions.

## Overview

This service calculates predicted bus arrival times based on:
- Current GPS location
- Bus speed (from GPS updates)
- Distance to upcoming stoppages
- Scheduled arrival times

## Implementation Status

### ⏳ Pending (Phase 4)

This service will be implemented in Phase 4 after:
- GPS tracking is functional (Phase 3)
- Bus listings with stoppage coordinates exist (Phase 2)
- Live location data is being collected

## Planned Features

### Endpoints

**POST /predict-arrivals**
- Input: Current location, recent GPS history, stoppages with coordinates
- Output: Predicted arrival times, on-time/delayed status for each stoppage
- Logic:
  - Calculate average speed from GPS history
  - Use haversine formula for distances
  - Estimate arrival times
  - Compare with scheduled times
  - Return status (on-time if <5 min difference, delayed otherwise)

### Requirements

**Dependencies:**
- Flask or FastAPI (Python web framework)
- python-dateutil (time calculations)
- Standard library math (haversine formula)

**Environment:**
- Python 3.8+
- Port 5001 (different from Node.js backend)
- Environment variables for configuration

### Algorithm

```python
def predict_arrivals(current_location, recent_locations, stoppages, current_time):
    # 1. Calculate average speed
    speed = calculate_speed(recent_locations)
    if speed == 0:
        speed = 40  # Default speed 40 km/h

    # 2. For each stoppage:
    predictions = []
    for stoppage in stoppages:
        # Calculate distance using haversine
        distance = haversine(current_location, stoppage['location'])

        # Estimate time to reach
        time_to_reach = distance / speed * 60  # in minutes

        # Predicted arrival
        predicted_time = current_time + time_to_reach

        # Compare with scheduled time
        delay = predicted_time - stoppage['scheduled_time']

        # Determine status
        status = 'delayed' if delay > 5 else 'on-time'

        predictions.append({
            'stoppage_name': stoppage['name'],
            'predicted_arrival': predicted_time,
            'scheduled_arrival': stoppage['scheduled_time'],
            'delay_minutes': delay,
            'status': status
        })

    return predictions
```

### Haversine Distance Calculation

```python
import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate great-circle distance between two points on Earth
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in km

    # Convert to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c

    return distance
```

## Project Structure (Planned)

```
ai-service/
├── app.py                  # Main Flask/FastAPI app
├── utils/
│   └── haversine.py        # Distance calculation
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
└── README.md               # This file
```

## Dependencies (requirements.txt)

```
flask==2.3.0
# OR
fastapi==0.100.0
uvicorn==0.23.0

python-dateutil==2.8.2
python-dotenv==1.0.0
```

## Setup (When Implementing)

1. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
```

4. **Run Service**
```bash
# Flask
python app.py

# OR FastAPI
uvicorn app:app --reload --port 5001
```

## Integration with Backend

The Node.js backend will call this service via HTTP:

```javascript
// backend/src/services/aiService.js
const axios = require('axios');

async function getPredictedArrivals(busId) {
  // Get bus details and GPS data
  const bus = await Bus.findById(busId);
  const tracking = await ActiveTracking.findOne({ bus_id: busId, is_active: true });

  if (!tracking) return null;

  // Build request
  const payload = {
    current_location: tracking.current_location,
    recent_locations: [], // Get last 3 GPS updates
    stoppages: bus.stoppages, // With lat/long
    current_time: new Date()
  };

  // Call AI service
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/predict-arrivals`,
    payload
  );

  return response.data.predictions;
}
```

## Testing (When Implementing)

**Manual Test:**
```bash
curl -X POST http://localhost:5001/predict-arrivals \
  -H "Content-Type: application/json" \
  -d '{
    "current_location": {"latitude": 25.5941, "longitude": 85.1376},
    "recent_locations": [
      {"latitude": 25.5940, "longitude": 85.1375, "timestamp": "2025-10-28T10:00:00Z"},
      {"latitude": 25.5935, "longitude": 85.1370, "timestamp": "2025-10-28T09:59:55Z"}
    ],
    "stoppages": [
      {
        "name": "Sonpur",
        "latitude": 25.5950,
        "longitude": 85.1400,
        "scheduled_arrival": "10:30 AM"
      }
    ],
    "current_time": "2025-10-28T10:00:05Z"
  }'
```

## Edge Cases to Handle

1. **No GPS data:** Use default speed (40 km/h), mark all as on-time
2. **Speed = 0 (bus stationary):** Use last known speed or default
3. **Invalid coordinates:** Return 400 error
4. **Past scheduled time:** Automatically mark as delayed
5. **Insufficient GPS history:** Use default speed

## Performance Considerations

- Prediction calculations are fast (< 100ms)
- Cache predictions for 30 seconds to reduce load
- Use async operations for concurrent predictions
- Monitor for memory leaks (clear old data)

## Deployment

**Development:**
- Run locally on port 5001
- Backend calls http://localhost:5001

**Production:**
- Deploy as separate container/service
- Use environment variable AI_SERVICE_URL in backend
- Example: https://ai-service.your-domain.com

## Next Steps

1. Wait for Phase 2 (bus listings with coordinates) to complete
2. Wait for Phase 3 (GPS tracking) to complete
3. Implement this service in Phase 4
4. Test with real GPS data
5. Integrate with backend
6. Display predictions in mobile app
