const axios = require('axios');

class FlightScraperService {
  constructor() {
    this.apiKey = process.env.FLIGHT_SCRAPER_API_KEY || '2d359e780emsh6cfec7aeef207b0p10f243jsn03861557a8ba';
    this.apiHost = 'flights-scraper-data.p.rapidapi.com';
    this.baseURL = 'https://flights-scraper-data.p.rapidapi.com';
    this.headers = {
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': this.apiHost
    };
  }

  /**
   * Search round-trip flights
   * @param {Object} params
   * @param {string} params.departureId - Departure airport code (e.g., "JFK")
   * @param {string} params.arrivalId - Arrival airport code (e.g., "LHR")
   * @param {string} params.departureDate - Format: YYYY-MM-DD
   * @param {string} params.returnDate - Format: YYYY-MM-DD
   * @param {number} params.adults - Number of adults (default: 1)
   * @param {string} params.currency - Currency code (default: "USD")
   * @param {string} params.cabinClass - "economy", "premium_economy", "business", "first"
   */
  async searchRoundTrip(params) {
    try {
      const {
        departureId,
        arrivalId,
        departureDate,
        returnDate,
        adults = 1,
        currency = 'USD',
        cabinClass = 'economy'
      } = params;

      console.log(`📡 Calling RapidAPI: ${this.baseURL}/flights/search-roundtrip`);
      console.log('Parameters:', { departureId, arrivalId, departureDate, returnDate, adults, currency, cabinClass });

      const response = await axios.get(`${this.baseURL}/flights/search-roundtrip`, {
        params: {
          departureId,
          arrivalId,
          departureDate,
          returnDate,
          adults,
          currency,
          cabinClass
        },
        headers: this.headers,
        timeout: 30000 // 30 seconds timeout
      });

      console.log(`✅ API Response - Status: ${response.data.status}, Flights: ${response.data.itineraries?.length || 0}`);
      
      const flights = this.formatFlightResults(response.data, 'roundtrip');
      
      if (flights.length === 0) {
        console.log('⚠️ API returned 0 flights - this may be normal for some routes/dates');
      }
      
      return flights;
    } catch (error) {
      console.error('Flight Scraper API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search flights');
    }
  }

  /**
   * Search one-way flights
   * @param {Object} params
   * @param {string} params.departureId - Departure airport code
   * @param {string} params.arrivalId - Arrival airport code
   * @param {string} params.departureDate - Format: YYYY-MM-DD
   * @param {number} params.adults - Number of adults
   * @param {string} params.currency - Currency code
   * @param {string} params.cabinClass - Cabin class
   */
  async searchOneWay(params) {
    try {
      const {
        departureId,
        arrivalId,
        departureDate,
        adults = 1,
        currency = 'USD',
        cabinClass = 'economy'
      } = params;

      console.log(`📡 Calling RapidAPI: ${this.baseURL}/flights/search-oneway`);
      console.log('Parameters:', { departureId, arrivalId, departureDate, adults, currency, cabinClass });

      const response = await axios.get(`${this.baseURL}/flights/search-oneway`, {
        params: {
          departureId,
          arrivalId,
          departureDate,
          adults,
          currency,
          cabinClass
        },
        headers: this.headers,
        timeout: 30000
      });

      console.log(`✅ API Response - Status: ${response.data.status}, Flights: ${response.data.itineraries?.length || 0}`);
      
      const flights = this.formatFlightResults(response.data, 'oneway');
      
      if (flights.length === 0) {
        console.log('⚠️ API returned 0 flights - this may be normal for some routes/dates');
      }
      
      return flights;
    } catch (error) {
      console.error('Flight Scraper API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search flights');
    }
  }

  /**
   * Get price graph for round-trip
   * @param {Object} params
   * @param {string} params.departureId - Departure airport code
   * @param {string} params.arrivalId - Arrival airport code
   */
  async getPriceGraph(params) {
    try {
      const { departureId, arrivalId } = params;

      const response = await axios.get(`${this.baseURL}/price-graph/for-roundtrip`, {
        params: {
          departureId,
          arrivalId
        },
        headers: this.headers
      });

      return response.data;
    } catch (error) {
      console.error('Price Graph Error:', error.response?.data || error.message);
      throw new Error('Failed to get price graph');
    }
  }

  /**
   * Get flight booking details
   * @param {string} bookingToken - Booking token from search results
   */
  async getBookingDetails(bookingToken) {
    try {
      const response = await axios.get(`${this.baseURL}/flights/booking-details`, {
        params: {
          bookingToken
        },
        headers: this.headers
      });

      return response.data;
    } catch (error) {
      console.error('Booking Details Error:', error.response?.data || error.message);
      throw new Error('Failed to get booking details');
    }
  }

  /**
   * Format flight results to match your database schema
   */
  formatFlightResults(data, tripType) {
    if (!data || !data.itineraries) {
      return [];
    }

    return data.itineraries.map(itinerary => {
      const firstLeg = itinerary.legs[0];
      const lastLeg = itinerary.legs[itinerary.legs.length - 1];
      
      // Calculate total duration
      const totalDuration = itinerary.legs.reduce((sum, leg) => sum + leg.durationInMinutes, 0);
      
      // Get carrier info
      const carriers = firstLeg.carriers?.marketing || [];
      const airline = carriers[0]?.name || 'Unknown Airline';
      
      return {
        // API specific data
        bookingToken: itinerary.token,
        tripType,
        
        // Flight info
        airline,
        flightNumber: firstLeg.segments?.[0]?.flightNumber || 'N/A',
        
        // Route
        from: {
          code: firstLeg.origin.displayCode,
          city: firstLeg.origin.parent?.name || firstLeg.origin.name,
          airport: firstLeg.origin.name
        },
        to: {
          code: lastLeg.destination.displayCode,
          city: lastLeg.destination.parent?.name || lastLeg.destination.name,
          airport: lastLeg.destination.name
        },
        
        // Timing
        departureAt: new Date(firstLeg.departure),
        arrivalAt: new Date(lastLeg.arrival),
        duration: totalDuration,
        
        // Stops
        stops: firstLeg.stopCount || 0,
        
        // Pricing
        price: {
          amount: itinerary.price?.raw || 0,
          currency: data.context?.currency || 'USD',
          formatted: itinerary.price?.formatted || '$0'
        },
        
        // Additional info
        segments: itinerary.legs.map(leg => ({
          origin: leg.origin.displayCode,
          destination: leg.destination.displayCode,
          departure: leg.departure,
          arrival: leg.arrival,
          duration: leg.durationInMinutes,
          carrier: leg.carriers?.marketing?.[0]?.name,
          flightNumber: leg.segments?.[0]?.flightNumber
        })),
        
        // Booking
        deepLink: itinerary.deepLink,
        isSelfTransfer: firstLeg.isSelfTransfer || false,
        
        // Metadata
        scrapedAt: new Date()
      };
    });
  }

  /**
   * Convert airport name/city to airport code
   * Note: This API uses IATA codes (JFK, LHR, etc.)
   */
  getAirportCode(query) {
    // Common airport codes mapping
    const airportCodes = {
      // Ghana
      'accra': 'ACC',
      'kotoka': 'ACC',
      'acc': 'ACC',
      
      // USA
      'new york': 'JFK',
      'jfk': 'JFK',
      'los angeles': 'LAX',
      'lax': 'LAX',
      'chicago': 'ORD',
      'ord': 'ORD',
      'miami': 'MIA',
      'mia': 'MIA',
      'san francisco': 'SFO',
      'sfo': 'SFO',
      'boston': 'BOS',
      'bos': 'BOS',
      'atlanta': 'ATL',
      'atl': 'ATL',
      'washington': 'IAD',
      'iad': 'IAD',
      
      // UK
      'london': 'LHR',
      'heathrow': 'LHR',
      'lhr': 'LHR',
      'gatwick': 'LGW',
      'lgw': 'LGW',
      
      // UAE
      'dubai': 'DXB',
      'dxb': 'DXB',
      'abu dhabi': 'AUH',
      'auh': 'AUH',
      
      // France
      'paris': 'CDG',
      'charles de gaulle': 'CDG',
      'cdg': 'CDG',
      
      // Germany
      'frankfurt': 'FRA',
      'fra': 'FRA',
      'munich': 'MUC',
      'muc': 'MUC',
      'berlin': 'BER',
      'ber': 'BER',
      
      // Netherlands
      'amsterdam': 'AMS',
      'ams': 'AMS',
      
      // Spain
      'madrid': 'MAD',
      'mad': 'MAD',
      'barcelona': 'BCN',
      'bcn': 'BCN',
      
      // Italy
      'rome': 'FCO',
      'fco': 'FCO',
      'milan': 'MXP',
      'mxp': 'MXP',
      
      // Add more as needed
    };

    const normalized = query.toLowerCase().trim();
    const code = airportCodes[normalized] || query.toUpperCase();
    
    console.log(`Airport code lookup: "${query}" -> "${code}"`);
    return code;
  }
}

module.exports = new FlightScraperService();