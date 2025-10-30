// Google Gemini AI service for bus name suggestions

/**
 * Get bus name suggestions from Gemini AI
 * @param {string} input - User input text
 * @returns {Promise<Array<string>>} Array of suggestions
 */
async function getGeminiSuggestions(input) {
  if (!input || input.trim().length < 2) {
    return [];
  }

  try {
    const apiKey = CONFIG.geminiApiKey;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      console.warn('Gemini API key not configured');
      return [];
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const prompt = `Suggest 3 professional bus route names based on this input: "${input}".
Return only the route names, one per line, without numbering or extra text.
Focus on clear, descriptive names that would be suitable for a bus service.
Examples: "Downtown Express", "City Center Route", "Airport Shuttle", "North-South Connector".`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 0.8,
        topK: 10
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);

      if (response.status === 429) {
        throw new Error('API rate limit reached. Please try again later.');
      } else if (response.status === 403) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else {
        throw new Error('Failed to get suggestions from AI.');
      }
    }

    const data = await response.json();

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('No suggestions returned from Gemini');
      return [];
    }

    // Parse suggestions (split by newlines, trim, filter empty)
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 100)
      .slice(0, 3); // Max 3 suggestions

    console.log('Gemini suggestions:', suggestions);
    return suggestions;

  } catch (error) {
    console.error('Error getting Gemini suggestions:', error);

    // Return empty array on error (graceful fallback)
    return [];
  }
}

/**
 * Debounced version of getGeminiSuggestions
 * Use this to avoid excessive API calls while user is typing
 */
const debouncedGetGeminiSuggestions = debounce(getGeminiSuggestions, 500);

/**
 * Get route description suggestions
 * @param {string} busName - Bus name
 * @param {Array} stoppages - Array of stoppage names
 * @returns {Promise<string>} Generated description
 */
async function getRouteDescription(busName, stoppages) {
  try {
    const apiKey = CONFIG.geminiApiKey;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return '';
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const stoppageList = stoppages.map(s => s.name).join(', ');

    const prompt = `Write a brief, professional description (1-2 sentences) for a bus route named "${busName}" that stops at: ${stoppageList}.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('Gemini API error for description');
      return '';
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text ? text.trim() : '';

  } catch (error) {
    console.error('Error getting route description:', error);
    return '';
  }
}

/**
 * Test Gemini API connection
 * @returns {Promise<boolean>} True if API is working
 */
async function testGeminiAPI() {
  try {
    const apiKey = CONFIG.geminiApiKey;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      console.warn('Gemini API key not configured');
      return false;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: 'Hello'
        }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    return response.ok;

  } catch (error) {
    console.error('Gemini API test failed:', error);
    return false;
  }
}

/**
 * Handle Gemini API errors with user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
function handleGeminiError(error) {
  if (error.message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  } else if (error.message.includes('API key')) {
    return 'AI service not configured properly. Please check settings.';
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Unable to connect to AI service. Check your internet connection.';
  } else {
    return 'AI suggestions temporarily unavailable.';
  }
}
