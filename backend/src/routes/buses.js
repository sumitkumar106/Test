const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const SearchHistory = require('../models/SearchHistory');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

/**
 * Calculate duration between two times in format "HH:MM AM/PM"
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {string} Duration in format "Xhr Ymin"
 */
const calculateDuration = (startTime, endTime) => {
  const parseTime = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}hr ${minutes}min`;
};

/**
 * Get day of week abbreviation for a date
 * @param {Date} date - Date object
 * @returns {string} Day abbreviation (S, M, T, W, Th, F, Sa)
 */
const getDayAbbreviation = (date) => {
  const days = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  return days[date.getDay()];
};

/**
 * GET /api/buses/search
 * Search buses by from/to stands
 */
router.get('/search', [
  query('from')
    .trim()
    .notEmpty()
    .withMessage('From stand is required'),
  query('to')
    .trim()
    .notEmpty()
    .withMessage('To stand is required'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { from, to, date } = req.query;

    // Validate from !== to
    if (from.toLowerCase() === to.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'From and to stands must be different'
      });
    }

    // Determine day of week
    const searchDate = date ? new Date(date) : new Date();
    const dayAbbr = getDayAbbreviation(searchDate);

    // Search for matching buses
    // Priority 1: Direct routes (start_stand = from, end_stand = to)
    const directBuses = await Bus.find({
      start_stand: { $regex: new RegExp(from, 'i') },
      end_stand: { $regex: new RegExp(to, 'i') },
      run_days: dayAbbr
    }).populate('driver_id', 'name email');

    // Priority 2: From is start, to is intermediate stoppage
    const fromStartBuses = await Bus.find({
      start_stand: { $regex: new RegExp(from, 'i') },
      'stoppages.name': { $regex: new RegExp(to, 'i') },
      run_days: dayAbbr
    }).populate('driver_id', 'name email');

    // Priority 3: From is intermediate, to is end
    const toEndBuses = await Bus.find({
      'stoppages.name': { $regex: new RegExp(from, 'i') },
      end_stand: { $regex: new RegExp(to, 'i') },
      run_days: dayAbbr
    }).populate('driver_id', 'name email');

    // Priority 4: Both are intermediate stoppages
    const bothIntermediateBuses = await Bus.find({
      'stoppages.name': {
        $all: [
          { $regex: new RegExp(from, 'i') },
          { $regex: new RegExp(to, 'i') }
        ]
      },
      run_days: dayAbbr
    }).populate('driver_id', 'name email');

    // Filter bothIntermediateBuses to ensure 'from' comes before 'to' in sequence
    const validIntermediateBuses = bothIntermediateBuses.filter(bus => {
      const fromStoppage = bus.stoppages.find(s =>
        new RegExp(from, 'i').test(s.name)
      );
      const toStoppage = bus.stoppages.find(s =>
        new RegExp(to, 'i').test(s.name)
      );

      return fromStoppage && toStoppage &&
             fromStoppage.sequence_order < toStoppage.sequence_order;
    });

    // Format results with match type
    const formatBus = (bus, matchType) => {
      let fromStand, toStand, fromTime, toTime;

      switch (matchType) {
        case 'direct':
          fromStand = bus.start_stand;
          toStand = bus.end_stand;
          fromTime = bus.start_time;
          toTime = bus.end_time;
          break;

        case 'from_start':
          fromStand = bus.start_stand;
          fromTime = bus.start_time;
          const toStoppage = bus.stoppages.find(s =>
            new RegExp(to, 'i').test(s.name)
          );
          toStand = toStoppage.name;
          toTime = toStoppage.arrival_time;
          break;

        case 'to_end':
          const fromStoppage = bus.stoppages.find(s =>
            new RegExp(from, 'i').test(s.name)
          );
          fromStand = fromStoppage.name;
          fromTime = fromStoppage.arrival_time;
          toStand = bus.end_stand;
          toTime = bus.end_time;
          break;

        case 'intermediate':
          const fromStop = bus.stoppages.find(s =>
            new RegExp(from, 'i').test(s.name)
          );
          const toStop = bus.stoppages.find(s =>
            new RegExp(to, 'i').test(s.name)
          );
          fromStand = fromStop.name;
          fromTime = fromStop.arrival_time;
          toStand = toStop.name;
          toTime = toStop.arrival_time;
          break;
      }

      return {
        id: bus._id,
        bus_name: bus.bus_name,
        bus_number: bus.bus_number,
        from_stand: fromStand,
        to_stand: toStand,
        from_time: fromTime,
        to_time: toTime,
        duration: calculateDuration(fromTime, toTime),
        run_days: bus.run_days,
        match_type: matchType
      };
    };

    // Combine results with priority
    const allResults = [
      ...directBuses.map(bus => formatBus(bus, 'direct')),
      ...fromStartBuses.map(bus => formatBus(bus, 'from_start')),
      ...toEndBuses.map(bus => formatBus(bus, 'to_end')),
      ...validIntermediateBuses.map(bus => formatBus(bus, 'intermediate'))
    ];

    // Remove duplicates (bus might match multiple criteria)
    const uniqueResults = Array.from(
      new Map(allResults.map(bus => [bus.id.toString(), bus])).values()
    );

    // Save search history if user is authenticated
    if (req.user) {
      try {
        const searchHistory = new SearchHistory({
          user_id: req.user.id,
          from_stand: from,
          to_stand: to
        });
        await searchHistory.save();

        // Keep only last 50 searches per user
        const count = await SearchHistory.countDocuments({ user_id: req.user.id });
        if (count > 50) {
          const oldestSearches = await SearchHistory.find({ user_id: req.user.id })
            .sort({ searched_at: 1 })
            .limit(count - 50);

          const idsToDelete = oldestSearches.map(s => s._id);
          await SearchHistory.deleteMany({ _id: { $in: idsToDelete } });
        }
      } catch (historyError) {
        // Don't fail the search if history save fails
        console.error('Error saving search history:', historyError);
      }
    }

    res.status(200).json({
      success: true,
      buses: uniqueResults
    });

  } catch (error) {
    console.error('Search buses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error searching buses'
    });
  }
});

/**
 * GET /api/buses/search-by-number
 * Search buses by bus number or name
 */
router.get('/search-by-number', [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { query: searchQuery } = req.query;

    // Search by bus_number or bus_name (case-insensitive)
    const buses = await Bus.find({
      $or: [
        { bus_number: { $regex: new RegExp(searchQuery, 'i') } },
        { bus_name: { $regex: new RegExp(searchQuery, 'i') } }
      ]
    })
    .populate('driver_id', 'name email')
    .limit(50)
    .select('-__v');

    res.status(200).json({
      success: true,
      buses: buses.map(bus => ({
        id: bus._id,
        bus_name: bus.bus_name,
        bus_number: bus.bus_number,
        start_stand: bus.start_stand,
        end_stand: bus.end_stand,
        start_time: bus.start_time,
        end_time: bus.end_time,
        run_days: bus.run_days,
        stoppages: bus.stoppages,
        driver_info: {
          name: bus.driver_id.name,
          email: bus.driver_id.email
        }
      }))
    });

  } catch (error) {
    console.error('Search by number error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error searching buses'
    });
  }
});

/**
 * GET /api/buses/:id
 * Get full bus details including all stoppages
 */
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driver_id', 'name email')
      .select('-__v');

    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      bus: {
        id: bus._id,
        bus_name: bus.bus_name,
        bus_number: bus.bus_number,
        start_stand: bus.start_stand,
        end_stand: bus.end_stand,
        start_time: bus.start_time,
        end_time: bus.end_time,
        run_days: bus.run_days,
        stoppages: bus.stoppages,
        driver_info: {
          name: bus.driver_id.name,
          email: bus.driver_id.email
        }
      }
    });

  } catch (error) {
    console.error('Get bus details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching bus details'
    });
  }
});

/**
 * GET /api/search-history
 * Get user's search history (authenticated users only)
 */
router.get('/search-history', authenticateToken, async (req, res) => {
  try {
    const history = await SearchHistory.find({ user_id: req.user.id })
      .sort({ searched_at: -1 })
      .limit(50)
      .select('-__v');

    res.status(200).json({
      success: true,
      history: history.map(item => ({
        id: item._id,
        from_stand: item.from_stand,
        to_stand: item.to_stand,
        searched_at: item.searched_at
      }))
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching search history'
    });
  }
});

module.exports = router;
