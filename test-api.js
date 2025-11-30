const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Adventurous Travel API\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const health = await axios.get('http://localhost:5000');
    console.log('✅ Health check:', health.data);
    console.log('');

    // Test 2: Get tours (should work without auth)
    console.log('2️⃣ Testing GET /api/tours...');
    const tours = await axios.get(`${BASE_URL}/tours`);
    console.log('✅ Tours:', tours.data);
    console.log('');

    // Test 3: Get flights
    console.log('3️⃣ Testing GET /api/flights...');
    const flights = await axios.get(`${BASE_URL}/flights`);
    console.log('✅ Flights:', flights.data);
    console.log('');

    // Test 4: Get parks
    console.log('4️⃣ Testing GET /api/parks...');
    const parks = await axios.get(`${BASE_URL}/parks`);
    console.log('✅ Parks:', parks.data);
    console.log('');

    // Test 5: Get taxis
    console.log('5️⃣ Testing GET /api/taxis...');
    const taxis = await axios.get(`${BASE_URL}/taxis`);
    console.log('✅ Taxis:', taxis.data);
    console.log('');

    // Test 6: Try to access protected route without auth (should fail)
    console.log('6️⃣ Testing protected route without auth (should fail)...');
    try {
      await axios.get(`${BASE_URL}/bookings`);
    } catch (error) {
      console.log('✅ Protected route correctly requires auth:', error.response?.data);
    }
    console.log('');

    // Test 7: Register a new user
    console.log('7️⃣ Testing user registration...');
    const signupData = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    };
    const signup = await axios.post(`${BASE_URL}/auth/signup`, signupData);
    console.log('✅ User registered:', { name: signup.data.data.name, email: signup.data.data.email });
    const token = signup.data.token;
    console.log('🔑 Token received');
    console.log('');

    // Test 8: Get current user with token
    console.log('8️⃣ Testing GET /api/auth/me (with token)...');
    const me = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Current user:', me.data.data);
    console.log('');

    // Test 9: Access bookings with token
    console.log('9️⃣ Testing GET /api/bookings (with token)...');
    const bookings = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Bookings:', bookings.data);
    console.log('');

    console.log('🎉 All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error details:', error);
    }
  }
}

testAPI();
