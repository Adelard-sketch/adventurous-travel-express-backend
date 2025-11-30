/**
 * Sample Flight Data Seeder
 * Run this script to populate your database with sample flights
 * 
 * Usage: node seed-flights.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Flight = require('./models/flight');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adventurous-travel', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Generate seats for a flight
const generateSeats = (config) => {
  const seats = [];
  
  // First class seats
  for (let i = 1; i <= config.firstClass; i++) {
    const row = Math.ceil(i / 2);
    const position = i % 2 === 1 ? 'A' : 'B';
    seats.push({
      seatNumber: `${row}${position}`,
      class: 'first',
      price: config.firstClassPrice,
      isBooked: false
    });
  }
  
  // Business class seats
  const businessStartRow = Math.ceil(config.firstClass / 2) + 1;
  for (let i = 1; i <= config.businessClass; i++) {
    const row = businessStartRow + Math.floor((i - 1) / 3);
    const positions = ['A', 'C', 'D'];
    const position = positions[(i - 1) % 3];
    seats.push({
      seatNumber: `${row}${position}`,
      class: 'business',
      price: config.businessClassPrice,
      isBooked: false
    });
  }
  
  // Economy class seats
  const economyStartRow = businessStartRow + Math.ceil(config.businessClass / 3) + 1;
  for (let i = 1; i <= config.economyClass; i++) {
    const row = economyStartRow + Math.floor((i - 1) / 6);
    const positions = ['A', 'B', 'C', 'D', 'E', 'F'];
    const position = positions[(i - 1) % 6];
    seats.push({
      seatNumber: `${row}${position}`,
      class: 'economy',
      price: config.economyClassPrice,
      isBooked: false
    });
  }
  
  return seats;
};

// Sample flights data
const sampleFlights = [
  // New York to London
  {
    airline: 'British Airways',
    flightNumber: 'BA178',
    from: {
      code: 'JFK',
      city: 'New York',
      airport: 'John F. Kennedy International Airport'
    },
    to: {
      code: 'LHR',
      city: 'London',
      airport: 'Heathrow Airport'
    },
    departureAt: new Date('2025-12-01T20:30:00Z'),
    arrivalAt: new Date('2025-12-02T08:15:00Z'),
    duration: 435,
    seatConfig: {
      firstClass: 8,
      firstClassPrice: 5000,
      businessClass: 30,
      businessClassPrice: 2500,
      economyClass: 150,
      economyClassPrice: 450
    }
  },
  
  // London to Dubai
  {
    airline: 'Emirates',
    flightNumber: 'EK001',
    from: {
      code: 'LHR',
      city: 'London',
      airport: 'Heathrow Airport'
    },
    to: {
      code: 'DXB',
      city: 'Dubai',
      airport: 'Dubai International Airport'
    },
    departureAt: new Date('2025-12-05T14:45:00Z'),
    arrivalAt: new Date('2025-12-06T01:15:00Z'),
    duration: 390,
    seatConfig: {
      firstClass: 12,
      firstClassPrice: 6500,
      businessClass: 42,
      businessClassPrice: 3200,
      economyClass: 200,
      economyClassPrice: 550
    }
  },
  
  // New York to Los Angeles
  {
    airline: 'American Airlines',
    flightNumber: 'AA123',
    from: {
      code: 'JFK',
      city: 'New York',
      airport: 'John F. Kennedy International Airport'
    },
    to: {
      code: 'LAX',
      city: 'Los Angeles',
      airport: 'Los Angeles International Airport'
    },
    departureAt: new Date('2025-12-03T08:00:00Z'),
    arrivalAt: new Date('2025-12-03T11:30:00Z'),
    duration: 330,
    seatConfig: {
      firstClass: 12,
      firstClassPrice: 1200,
      businessClass: 20,
      businessClassPrice: 650,
      economyClass: 120,
      economyClassPrice: 250
    }
  },
  
  // Singapore to Sydney
  {
    airline: 'Singapore Airlines',
    flightNumber: 'SQ221',
    from: {
      code: 'SIN',
      city: 'Singapore',
      airport: 'Singapore Changi Airport'
    },
    to: {
      code: 'SYD',
      city: 'Sydney',
      airport: 'Sydney Kingsford Smith Airport'
    },
    departureAt: new Date('2025-12-10T23:55:00Z'),
    arrivalAt: new Date('2025-12-11T09:50:00Z'),
    duration: 475,
    seatConfig: {
      firstClass: 6,
      firstClassPrice: 7000,
      businessClass: 36,
      businessClassPrice: 3800,
      economyClass: 180,
      economyClassPrice: 650
    }
  },
  
  // Dubai to Johannesburg
  {
    airline: 'Emirates',
    flightNumber: 'EK761',
    from: {
      code: 'DXB',
      city: 'Dubai',
      airport: 'Dubai International Airport'
    },
    to: {
      code: 'JNB',
      city: 'Johannesburg',
      airport: 'OR Tambo International Airport'
    },
    departureAt: new Date('2025-12-15T03:45:00Z'),
    arrivalAt: new Date('2025-12-15T11:20:00Z'),
    duration: 515,
    seatConfig: {
      firstClass: 8,
      firstClassPrice: 5500,
      businessClass: 40,
      businessClassPrice: 2800,
      economyClass: 160,
      economyClassPrice: 580
    }
  },
  
  // Paris to Cairo
  {
    airline: 'Air France',
    flightNumber: 'AF638',
    from: {
      code: 'CDG',
      city: 'Paris',
      airport: 'Charles de Gaulle Airport'
    },
    to: {
      code: 'CAI',
      city: 'Cairo',
      airport: 'Cairo International Airport'
    },
    departureAt: new Date('2025-12-08T10:30:00Z'),
    arrivalAt: new Date('2025-12-08T15:45:00Z'),
    duration: 255,
    seatConfig: {
      firstClass: 8,
      firstClassPrice: 2500,
      businessClass: 24,
      businessClassPrice: 1200,
      economyClass: 100,
      economyClassPrice: 320
    }
  },
  
  // Tokyo to San Francisco
  {
    airline: 'United Airlines',
    flightNumber: 'UA837',
    from: {
      code: 'NRT',
      city: 'Tokyo',
      airport: 'Narita International Airport'
    },
    to: {
      code: 'SFO',
      city: 'San Francisco',
      airport: 'San Francisco International Airport'
    },
    departureAt: new Date('2025-12-12T17:00:00Z'),
    arrivalAt: new Date('2025-12-12T11:30:00Z'),
    duration: 570,
    seatConfig: {
      firstClass: 8,
      firstClassPrice: 8000,
      businessClass: 45,
      businessClassPrice: 4200,
      economyClass: 200,
      economyClassPrice: 850
    }
  },
  
  // London to New York (return flight)
  {
    airline: 'British Airways',
    flightNumber: 'BA179',
    from: {
      code: 'LHR',
      city: 'London',
      airport: 'Heathrow Airport'
    },
    to: {
      code: 'JFK',
      city: 'New York',
      airport: 'John F. Kennedy International Airport'
    },
    departureAt: new Date('2025-12-08T10:00:00Z'),
    arrivalAt: new Date('2025-12-08T13:30:00Z'),
    duration: 450,
    seatConfig: {
      firstClass: 8,
      firstClassPrice: 5200,
      businessClass: 30,
      businessClassPrice: 2600,
      economyClass: 150,
      economyClassPrice: 480
    }
  }
];

// Seed database
const seedFlights = async () => {
  try {
    console.log('🌱 Starting flight seeding...\n');
    
    // Clear existing flights (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing flights...');
    await Flight.deleteMany({});
    console.log('✅ Existing flights cleared\n');
    
    // Insert sample flights
    for (const flightData of sampleFlights) {
      const { seatConfig, ...flightInfo } = flightData;
      flightInfo.seats = generateSeats(seatConfig);
      
      const flight = await Flight.create(flightInfo);
      console.log(`✅ Created: ${flight.airline} ${flight.flightNumber} (${flight.from.code} → ${flight.to.code})`);
      console.log(`   Total seats: ${flight.seats.length} (First: ${seatConfig.firstClass}, Business: ${seatConfig.businessClass}, Economy: ${seatConfig.economyClass})`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleFlights.length} flights!`);
    console.log('\n📊 Summary:');
    const stats = await Flight.aggregate([
      {
        $group: {
          _id: null,
          totalFlights: { $sum: 1 },
          totalSeats: { $sum: { $size: '$seats' } }
        }
      }
    ]);
    
    if (stats.length > 0) {
      console.log(`   Total flights: ${stats[0].totalFlights}`);
      console.log(`   Total seats: ${stats[0].totalSeats}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding flights:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seeder
connectDB().then(seedFlights);
