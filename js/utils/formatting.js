// Date and time formatting utilities

/**
 * Format ISO timestamp to readable date
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted date (e.g., "Jan 15, 2025")
 */
function formatDate(isoString) {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

/**
 * Format ISO timestamp to readable date and time
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2025 3:30 PM")
 */
function formatDateTime(isoString) {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    return `${datePart} ${timePart}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '';
  }
}

/**
 * Format time range string
 * @param {string} startTime - Start time (HH:MM AM/PM)
 * @param {string} endTime - End time (HH:MM AM/PM)
 * @returns {string} Formatted range (e.g., "6:00 AM - 10:00 PM")
 */
function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${startTime} - ${endTime}`;
}

/**
 * Get day name from day key
 * @param {string} dayKey - Day key (e.g., 'monday')
 * @returns {string} Full day name (e.g., 'Monday')
 */
function getDayName(dayKey) {
  const dayNames = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  };

  return dayNames[dayKey] || '';
}

/**
 * Get day abbreviation from day key
 * @param {string} dayKey - Day key (e.g., 'monday')
 * @returns {string} Day abbreviation (e.g., 'M')
 */
function getDayAbbreviation(dayKey) {
  const dayAbbreviations = {
    sunday: 'S',
    monday: 'M',
    tuesday: 'T',
    wednesday: 'W',
    thursday: 'T',
    friday: 'F',
    saturday: 'S'
  };

  return dayAbbreviations[dayKey] || '';
}

/**
 * Format run days object to human-readable string
 * @param {Object} runDays - Run days object
 * @returns {string} Formatted string (e.g., "Mon, Wed, Fri")
 */
function formatRunDays(runDays) {
  if (!runDays || typeof runDays !== 'object') return '';

  const days = [];
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  dayOrder.forEach(day => {
    if (runDays[day]) {
      days.push(getDayName(day).substring(0, 3));
    }
  });

  return days.join(', ');
}

/**
 * Get active days array from run days object
 * @param {Object} runDays - Run days object
 * @returns {Array<string>} Array of active day keys
 */
function getActiveDays(runDays) {
  if (!runDays || typeof runDays !== 'object') return [];

  return Object.keys(runDays).filter(day => runDays[day] === true);
}

/**
 * Count number of active days
 * @param {Object} runDays - Run days object
 * @returns {number} Count of active days
 */
function countActiveDays(runDays) {
  return getActiveDays(runDays).length;
}

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (HH:MM AM/PM)
 */
function convert24To12Hour(time24) {
  if (!time24) return '';

  try {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Time conversion error:', error);
    return time24;
  }
}

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12 - Time in 12-hour format (HH:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 */
function convert12To24Hour(time12) {
  if (!time12) return '';

  try {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Time conversion error:', error);
    return time12;
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} isoString - ISO timestamp
 * @returns {string} Relative time string
 */
function formatRelativeTime(isoString) {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(isoString);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
}

/**
 * Get ordinal suffix for number (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to get suffix for
 * @returns {string} Number with ordinal suffix
 */
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;

  return `${num}th`;
}

/**
 * Pluralize word based on count
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string} Pluralized string
 */
function pluralize(count, singular, plural = null) {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
