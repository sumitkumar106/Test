const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const { authenticateToken, requireDriver } = require('../middleware/auth');
const { geocodeStoppage } = require('../services/geocodingService');

/**
 * POST /api/driver/buses
 * Create a new bus listing (driver only)
 */
router.post('/buses', authenticateToken, requireDriver, [
  body('bus_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bus name must be between 2 and 100 characters'),
  body('bus_number')
    .trim()
    .notEmpty()
    .withMessage('Bus number is required'),
  body('start_stand')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Start stand must be between 2 and 100 characters'),
  body('end_stand')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('End stand must be between 2 and 100 characters'),
  body('start_time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid start time format. Use HH:MM AM/PM'),
  body('end_time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid end time format. Use HH:MM AM/PM'),
  body('run_days')
    .isArray({ min: 1 })
    .withMessage('Select at least one run day'),
  body('stoppages')
    .isArray({ min: 1 })
    .withMessage('Add at least one stoppage')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { bus_name, bus_number, start_stand, end_stand, start_time, end_time, run_days, stoppages } = req.body;

    // Validate run_days values
    const validDays = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const invalidDays = run_days.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid run day. Use S, M, T, W, Th, F, Sa'
      });
    }

    // Check bus_number uniqueness
    const existingBus = await Bus.findOne({ bus_number: bus_number.toUpperCase() });
    if (existingBus) {
      return res.status(400).json({
        success: false,
        error: 'Bus number already registered'
      });
    }

    // Validate stoppages
    for (const stoppage of stoppages) {
      if (!stoppage.name || !stoppage.arrival_time || stoppage.distance_km === undefined) {
        return res.status(400).json({
          success: false,
          error: 'All stoppages require name, arrival time, and distance'
        });
      }

      if (stoppage.distance_km < 0) {
        return res.status(400).json({
          success: false,
          error: 'Distance must be positive'
        });
      }

      // Validate arrival time format
      if (!stoppage.arrival_time.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
        return res.status(400).json({
          success: false,
          error: `Invalid arrival time format for stoppage ${stoppage.name}. Use HH:MM AM/PM`
        });
      }
    }

    // Geocode all stoppages
    console.log('Geocoding stoppages...');
    const geocodedStoppages = [];

    for (let i = 0; i < stoppages.length; i++) {
      const stoppage = stoppages[i];

      try {
        const coordinates = await geocodeStoppage(stoppage.name);

        geocodedStoppages.push({
          name: stoppage.name.trim(),
          arrival_time: stoppage.arrival_time,
          distance_km: stoppage.distance_km,
          sequence_order: i + 1,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        });
      } catch (geocodeError) {
        return res.status(400).json({
          success: false,
          error: geocodeError.message
        });
      }
    }

    // Create bus document
    const bus = new Bus({
      driver_id: req.user.id,
      bus_name: bus_name.trim(),
      bus_number: bus_number.toUpperCase().trim(),
      start_stand: start_stand.trim(),
      end_stand: end_stand.trim(),
      start_time,
      end_time,
      run_days,
      stoppages: geocodedStoppages
    });

    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
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
        created_at: bus.created_at
      }
    });

  } catch (error) {
    console.error('Create bus error:', error);

    // Handle duplicate bus_number error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Bus number already registered'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating bus'
    });
  }
});

/**
 * GET /api/driver/buses
 * Get all buses for logged-in driver
 */
router.get('/buses', authenticateToken, requireDriver, async (req, res) => {
  try {
    const buses = await Bus.find({ driver_id: req.user.id })
      .sort({ created_at: -1 })
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
        stoppages_count: bus.stoppages.length,
        created_at: bus.created_at,
        updated_at: bus.updated_at
      }))
    });

  } catch (error) {
    console.error('Get driver buses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching buses'
    });
  }
});

/**
 * GET /api/driver/buses/:id
 * Get single bus details (driver only, own buses)
 */
router.get('/buses/:id', authenticateToken, requireDriver, async (req, res) => {
  try {
    const bus = await Bus.findOne({
      _id: req.params.id,
      driver_id: req.user.id
    }).select('-__v');

    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found or access denied'
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
        created_at: bus.created_at,
        updated_at: bus.updated_at
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
 * PUT /api/driver/buses/:id
 * Update bus listing (driver only, own buses)
 */
router.put('/buses/:id', authenticateToken, requireDriver, [
  body('bus_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bus name must be between 2 and 100 characters'),
  body('bus_number')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bus number cannot be empty'),
  body('start_time')
    .optional()
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid start time format'),
  body('end_time')
    .optional()
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid end time format'),
  body('run_days')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Select at least one run day'),
  body('stoppages')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Add at least one stoppage')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    // Find bus
    const bus = await Bus.findOne({
      _id: req.params.id,
      driver_id: req.user.id
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found or access denied'
      });
    }

    const updates = req.body;

    // Check bus_number uniqueness if updating
    if (updates.bus_number && updates.bus_number.toUpperCase() !== bus.bus_number) {
      const existingBus = await Bus.findOne({
        bus_number: updates.bus_number.toUpperCase(),
        _id: { $ne: bus._id }
      });

      if (existingBus) {
        return res.status(400).json({
          success: false,
          error: 'Bus number already registered'
        });
      }
    }

    // Validate run_days if provided
    if (updates.run_days) {
      const validDays = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const invalidDays = updates.run_days.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid run day. Use S, M, T, W, Th, F, Sa'
        });
      }
    }

    // If updating stoppages, geocode them
    if (updates.stoppages) {
      // Validate stoppages
      for (const stoppage of updates.stoppages) {
        if (!stoppage.name || !stoppage.arrival_time || stoppage.distance_km === undefined) {
          return res.status(400).json({
            success: false,
            error: 'All stoppages require name, arrival time, and distance'
          });
        }
      }

      // Geocode stoppages
      const geocodedStoppages = [];
      for (let i = 0; i < updates.stoppages.length; i++) {
        const stoppage = updates.stoppages[i];

        try {
          const coordinates = await geocodeStoppage(stoppage.name);

          geocodedStoppages.push({
            name: stoppage.name.trim(),
            arrival_time: stoppage.arrival_time,
            distance_km: stoppage.distance_km,
            sequence_order: i + 1,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          });
        } catch (geocodeError) {
          return res.status(400).json({
            success: false,
            error: geocodeError.message
          });
        }
      }
      updates.stoppages = geocodedStoppages;
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key === 'bus_number') {
        bus[key] = updates[key].toUpperCase().trim();
      } else if (typeof updates[key] === 'string') {
        bus[key] = updates[key].trim();
      } else {
        bus[key] = updates[key];
      }
    });

    await bus.save();

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
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
        updated_at: bus.updated_at
      }
    });

  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating bus'
    });
  }
});

/**
 * DELETE /api/driver/buses/:id
 * Delete bus listing (driver only, own buses)
 */
router.delete('/buses/:id', authenticateToken, requireDriver, async (req, res) => {
  try {
    const bus = await Bus.findOne({
      _id: req.params.id,
      driver_id: req.user.id
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found or access denied'
      });
    }

    await Bus.deleteOne({ _id: bus._id });

    // TODO: In Phase 5, also delete associated active_tracking and alarms

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });

  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting bus'
    });
  }
});

module.exports = router;
