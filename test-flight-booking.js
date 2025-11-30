/**
 * Flight Booking API Test Script
 * Run this after starting the backend server
 */

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
let testFlightId = null;
let testSeatIds = [];
let authToken = null;

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { status: 500, error: error.message };
  }
}

// Test 1: Create a test user and login
async function testAuthentication() {
  console.log('\n📝 Test 1: Authentication');
  console.log('=' .repeat(50));

  // Try to signup
  const signupResult = await apiCall('/auth/signup', 'POST', {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#'
  });

  if (signupResult.data.success) {
    console.log('✅ User created successfully');
    authToken = signupResult.data.token;
  } else {
    // Try to login with existing test account
    const loginResult = await apiCall('/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'Test123!@#'
    });

    if (loginResult.data.success) {
      console.log('✅ Logged in successfully');
      authToken = loginResult.data.token;
    } else {
      console.error('❌ Authentication failed');
      return false;
    }
  }

  return true;
}

// Test 2: Search for flights
async function testFlightSearch() {
  console.log('\n🔍 Test 2: Search Flights');
  console.log('=' .repeat(50));

  const result = await apiCall('/flights?page=1&limit=5');

  if (result.data.success) {
    console.log(`✅ Found ${result.data.count} flights`);
    console.log(`   Total available: ${result.data.total}`);
    
    if (result.data.data.length > 0) {
      const flight = result.data.data[0];
      testFlightId = flight._id;
      console.log(`   Test flight: ${flight.airline} ${flight.flightNumber}`);
      console.log(`   Route: ${flight.from.city} → ${flight.to.city}`);
      console.log(`   Available seats: ${flight.totalAvailableSeats}`);
    }
  } else {
    console.log('⚠️  No flights found - you may need to add sample data');
  }

  return result.data.success;
}

// Test 3: Get flight details
async function testFlightDetails() {
  if (!testFlightId) {
    console.log('\n⚠️  Test 3: Skipped (no test flight available)');
    return false;
  }

  console.log('\n✈️  Test 3: Get Flight Details');
  console.log('=' .repeat(50));

  const result = await apiCall(`/flights/${testFlightId}`);

  if (result.data.success) {
    console.log('✅ Flight details retrieved');
    const flight = result.data.data;
    console.log(`   Airline: ${flight.airline}`);
    console.log(`   Flight: ${flight.flightNumber}`);
    console.log(`   Total seats: ${flight.seats.length}`);
  } else {
    console.error('❌ Failed to get flight details');
  }

  return result.data.success;
}

// Test 4: Get available seats
async function testSeatAvailability() {
  if (!testFlightId) {
    console.log('\n⚠️  Test 4: Skipped (no test flight available)');
    return false;
  }

  console.log('\n💺 Test 4: Get Seat Availability');
  console.log('=' .repeat(50));

  const result = await apiCall(`/flights/${testFlightId}/seats`);

  if (result.data.success) {
    console.log('✅ Seat map retrieved');
    console.log(`   Flight: ${result.data.airline} ${result.data.flightNumber}`);
    console.log(`   Route: ${result.data.route}`);
    
    const seats = result.data.seats;
    console.log('\n   Seat availability:');
    Object.keys(seats).forEach(className => {
      const available = seats[className].available.length;
      const booked = seats[className].booked.length;
      console.log(`   ${className}: ${available} available, ${booked} booked`);
      
      // Store first 2 available economy seats for booking test
      if (className === 'economy' && available > 0 && testSeatIds.length === 0) {
        testSeatIds = seats[className].available.slice(0, 2).map(s => s.id);
      }
    });
  } else {
    console.error('❌ Failed to get seat availability');
  }

  return result.data.success;
}

// Test 5: Book a flight
async function testFlightBooking() {
  if (!testFlightId || !authToken || testSeatIds.length === 0) {
    console.log('\n⚠️  Test 5: Skipped (missing prerequisites)');
    return false;
  }

  console.log('\n🎫 Test 5: Book Flight');
  console.log('=' .repeat(50));

  const bookingData = {
    seatIds: testSeatIds,
    passengers: {
      adults: 2,
      children: 0
    },
    passengerDetails: [
      {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-15',
        passportNumber: 'AB1234567',
        nationality: 'US'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1992-08-20',
        passportNumber: 'AB7654321',
        nationality: 'US'
      }
    ]
  };

  const result = await apiCall(
    `/flights/${testFlightId}/book`,
    'POST',
    bookingData,
    authToken
  );

  if (result.data.success) {
    console.log('✅ Flight booked successfully!');
    const booking = result.data.data;
    console.log(`   Booking ID: ${booking._id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Total price: $${booking.price}`);
    console.log(`   Seats: ${booking.bookingDetails.seats.map(s => s.seatNumber).join(', ')}`);
  } else {
    console.error('❌ Booking failed:', result.data.message);
  }

  return result.data.success;
}

// Test 6: Verify seats are booked
async function testSeatBookingVerification() {
  if (!testFlightId) {
    console.log('\n⚠️  Test 6: Skipped (no test flight available)');
    return false;
  }

  console.log('\n✔️  Test 6: Verify Seats Booked');
  console.log('=' .repeat(50));

  const result = await apiCall(`/flights/${testFlightId}/seats`);

  if (result.data.success) {
    const seats = result.data.seats;
    let bookedSeats = 0;
    
    Object.keys(seats).forEach(className => {
      bookedSeats += seats[className].booked.length;
    });

    if (bookedSeats > 0) {
      console.log(`✅ Verified: ${bookedSeats} seats are now booked`);
    } else {
      console.log('⚠️  No seats booked (this is expected if booking test was skipped)');
    }
  }

  return result.data.success;
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(60) + '╗');
  console.log('║' + ' '.repeat(15) + 'FLIGHT BOOKING API TEST SUITE' + ' '.repeat(16) + '║');
  console.log('╚' + '═'.repeat(60) + '╝');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Run tests sequentially
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Flight Search', fn: testFlightSearch },
    { name: 'Flight Details', fn: testFlightDetails },
    { name: 'Seat Availability', fn: testSeatAvailability },
    { name: 'Flight Booking', fn: testFlightBooking },
    { name: 'Booking Verification', fn: testSeatBookingVerification }
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed === false && test.name.includes('Skip')) {
        results.skipped++;
      } else if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" crashed:`, error.message);
      results.failed++;
    }
  }

  // Summary
  console.log('\n');
  console.log('╔' + '═'.repeat(60) + '╗');
  console.log('║' + ' '.repeat(23) + 'TEST SUMMARY' + ' '.repeat(25) + '║');
  console.log('╠' + '═'.repeat(60) + '╣');
  console.log(`║  ✅ Passed: ${results.passed}  ❌ Failed: ${results.failed}  ⚠️  Skipped: ${results.skipped}` + ' '.repeat(60 - 38 - results.passed.toString().length - results.failed.toString().length - results.skipped.toString().length) + '║');
  console.log('╚' + '═'.repeat(60) + '╝');

  if (results.failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the backend server is running and sample data exists.\n');
  } else if (results.passed > 0) {
    console.log('\n🎉 All tests passed! Flight booking API is working correctly.\n');
  }
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - need to install node-fetch
  console.log('Note: This test requires node-fetch. Install with: npm install node-fetch@2');
  console.log('Or run this script in a browser console when on your website.\n');
} else {
  // Browser environment
  runAllTests();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
