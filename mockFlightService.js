// Mock Flight Data Service - For Testing Without API Subscription

class MockFlightService {
  /**
   * Generate mock flight data
   */
  generateMockFlights(params) {
    const { departureId, arrivalId, departureDate, returnDate, adults = 1, tripType = 'oneway' } = params;
    
    const airlines = [
      'British Airways',
      'Emirates',
      'Qatar Airways',
      'Delta Airlines',
      'United Airlines',
      'Lufthansa',
      'Air France',
      'KLM',
      'Turkish Airlines',
      'Ethiopian Airlines'
    ];
    
    const flights = [];
    const numFlights = Math.floor(Math.random() * 10) + 8; // 8-17 flights
    
    for (let i = 0; i < numFlights; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const departureTime = new Date(departureDate);
      departureTime.setHours(6 + Math.floor(Math.random() * 16)); // 6 AM - 10 PM
      departureTime.setMinutes(Math.random() < 0.5 ? 0 : 30);
      
      const duration = 300 + Math.floor(Math.random() * 420); // 5-12 hours
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000);
      
      const stops = Math.random() < 0.3 ? 0 : (Math.random() < 0.7 ? 1 : 2);
      const basePrice = 400 + Math.floor(Math.random() * 800);
      const price = basePrice + (stops * 50) + (adults - 1) * basePrice * 0.9;
      
      flights.push({
        bookingToken: `MOCK_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        tripType,
        airline,
        flightNumber: `${airline.split(' ')[0].substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        from: {
          code: departureId,
          city: this.getAirportCity(departureId),
          airport: this.getAirportName(departureId)
        },
        to: {
          code: arrivalId,
          city: this.getAirportCity(arrivalId),
          airport: this.getAirportName(arrivalId)
        },
        departureAt: departureTime.toISOString(),
        arrivalAt: arrivalTime.toISOString(),
        duration,
        stops,
        price: {
          amount: Math.round(price),
          currency: 'USD',
          formatted: `$${Math.round(price)}`
        },
        segments: this.generateSegments(departureId, arrivalId, stops, departureTime, arrivalTime),
        deepLink: `https://www.booking.com/flights`,
        isSelfTransfer: false,
        scrapedAt: new Date()
      });
    }
    
    // Sort by price
    return flights.sort((a, b) => a.price.amount - b.price.amount);
  }
  
  generateSegments(from, to, stops, departureTime, arrivalTime) {
    const segments = [];
    
    if (stops === 0) {
      segments.push({
        origin: from,
        destination: to,
        departure: departureTime.toISOString(),
        arrival: arrivalTime.toISOString(),
        duration: Math.floor((arrivalTime - departureTime) / 60000),
        carrier: 'Mock Airline',
        flightNumber: 'MA1234'
      });
    } else {
      const stopCities = ['DXB', 'IST', 'FRA', 'AMS', 'CDG'];
      const stopCity = stopCities[Math.floor(Math.random() * stopCities.length)];
      
      const midTime = new Date(departureTime.getTime() + (arrivalTime - departureTime) / 2);
      
      segments.push({
        origin: from,
        destination: stopCity,
        departure: departureTime.toISOString(),
        arrival: midTime.toISOString(),
        duration: Math.floor((midTime - departureTime) / 60000),
        carrier: 'Mock Airline',
        flightNumber: 'MA1234'
      });
      
      segments.push({
        origin: stopCity,
        destination: to,
        departure: new Date(midTime.getTime() + 3600000).toISOString(), // 1 hour layover
        arrival: arrivalTime.toISOString(),
        duration: Math.floor((arrivalTime - midTime - 3600000) / 60000),
        carrier: 'Mock Airline',
        flightNumber: 'MA5678'
      });
    }
    
    return segments;
  }
  
  getAirportCity(code) {
    const cities = {
      'JFK': 'New York',
      'LHR': 'London',
      'ACC': 'Accra',
      'LAX': 'Los Angeles',
      'DXB': 'Dubai',
      'CDG': 'Paris',
      'FRA': 'Frankfurt',
      'AMS': 'Amsterdam',
      'ORD': 'Chicago',
      'MIA': 'Miami',
      'SFO': 'San Francisco',
      'BOS': 'Boston',
      'ATL': 'Atlanta',
      'IAD': 'Washington',
      'LGW': 'London',
      'AUH': 'Abu Dhabi',
      'MAD': 'Madrid',
      'BCN': 'Barcelona',
      'FCO': 'Rome',
      'MXP': 'Milan',
      'MUC': 'Munich',
      'BER': 'Berlin'
    };
    return cities[code] || code;
  }
  
  getAirportName(code) {
    const airports = {
      'JFK': 'John F. Kennedy International Airport',
      'LHR': 'Heathrow Airport',
      'ACC': 'Kotoka International Airport',
      'LAX': 'Los Angeles International Airport',
      'DXB': 'Dubai International Airport',
      'CDG': 'Charles de Gaulle Airport',
      'FRA': 'Frankfurt Airport',
      'AMS': 'Amsterdam Schiphol Airport',
      'ORD': 'O\'Hare International Airport',
      'MIA': 'Miami International Airport',
      'SFO': 'San Francisco International Airport',
      'BOS': 'Logan International Airport',
      'ATL': 'Hartsfield-Jackson Atlanta International Airport',
      'IAD': 'Washington Dulles International Airport',
      'LGW': 'Gatwick Airport',
      'AUH': 'Abu Dhabi International Airport',
      'MAD': 'Adolfo Suárez Madrid-Barajas Airport',
      'BCN': 'Barcelona-El Prat Airport',
      'FCO': 'Leonardo da Vinci-Fiumicino Airport',
      'MXP': 'Milan Malpensa Airport',
      'MUC': 'Munich Airport',
      'BER': 'Berlin Brandenburg Airport'
    };
    return airports[code] || `${code} Airport`;
  }
  
  async searchOneWay(params) {
    console.log('🔶 Using MOCK data (API not subscribed)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.generateMockFlights({ ...params, tripType: 'oneway' });
  }
  
  async searchRoundTrip(params) {
    console.log('🔶 Using MOCK data (API not subscribed)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return this.generateMockFlights({ ...params, tripType: 'roundtrip' });
  }
  
  async getPriceGraph(params) {
    console.log('🔶 Using MOCK data for price graph');
    return {
      success: true,
      message: 'Mock price graph data'
    };
  }
  
  async getBookingDetails(bookingToken) {
    console.log('🔶 Using MOCK booking details');
    return {
      bookingToken,
      message: 'Mock booking details - Please subscribe to API for real data'
    };
  }
  
  getAirportCode(query) {
    const airportCodes = {
      'accra': 'ACC', 'kotoka': 'ACC', 'acc': 'ACC',
      'new york': 'JFK', 'jfk': 'JFK',
      'los angeles': 'LAX', 'lax': 'LAX',
      'chicago': 'ORD', 'ord': 'ORD',
      'miami': 'MIA', 'mia': 'MIA',
      'san francisco': 'SFO', 'sfo': 'SFO',
      'boston': 'BOS', 'bos': 'BOS',
      'atlanta': 'ATL', 'atl': 'ATL',
      'washington': 'IAD', 'iad': 'IAD',
      'london': 'LHR', 'heathrow': 'LHR', 'lhr': 'LHR',
      'gatwick': 'LGW', 'lgw': 'LGW',
      'dubai': 'DXB', 'dxb': 'DXB',
      'abu dhabi': 'AUH', 'auh': 'AUH',
      'paris': 'CDG', 'charles de gaulle': 'CDG', 'cdg': 'CDG',
      'frankfurt': 'FRA', 'fra': 'FRA',
      'munich': 'MUC', 'muc': 'MUC',
      'berlin': 'BER', 'ber': 'BER',
      'amsterdam': 'AMS', 'ams': 'AMS',
      'madrid': 'MAD', 'mad': 'MAD',
      'barcelona': 'BCN', 'bcn': 'BCN',
      'rome': 'FCO', 'fco': 'FCO',
      'milan': 'MXP', 'mxp': 'MXP'
    };
    
    const normalized = query.toLowerCase().trim();
    const code = airportCodes[normalized] || query.toUpperCase();
    console.log(`Airport code lookup: "${query}" -> "${code}"`);
    return code;
  }
}

module.exports = new MockFlightService();
