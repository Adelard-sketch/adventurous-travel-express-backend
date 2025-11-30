const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
const Location = require('./models/location');
const Tour = require('./models/tour');
const Park = require('./models/park');
const Taxi = require('./models/taxi');
require('dotenv').config();

// Vehicle Types Data
const vehicleTypesData = [
  {
    vehicleType: 'sedan',
    carModel: 'Standard Sedan',
    licensePlate: 'GH-001-SEDAN',
    capacity: 4,
    basePrice: 15,
    pricePerKm: 2.5,
    location: { type: 'Point', coordinates: [-0.1870, 5.6037] }, // Accra
    features: ['Air Conditioning', 'Comfortable Seats', 'GPS'],
    isAvailable: true,
    rating: 4.8,
    totalRides: 1234
  },
  {
    vehicleType: 'suv',
    carModel: 'Premium SUV',
    licensePlate: 'GH-002-SUV',
    capacity: 6,
    basePrice: 25,
    pricePerKm: 4.0,
    location: { type: 'Point', coordinates: [-0.1870, 5.6037] }, // Accra
    features: ['Extra Space', 'Luxury Interior', 'Air Conditioning', 'GPS'],
    isAvailable: true,
    rating: 4.9,
    totalRides: 2456
  },
  {
    vehicleType: 'luxury',
    carModel: 'Luxury Car',
    licensePlate: 'GH-003-LUX',
    capacity: 4,
    basePrice: 40,
    pricePerKm: 6.0,
    location: { type: 'Point', coordinates: [-0.1870, 5.6037] }, // Accra
    features: ['Premium Comfort', 'Leather Seats', 'Entertainment System', 'GPS'],
    isAvailable: true,
    rating: 5.0,
    totalRides: 892
  },
  {
    vehicleType: 'van',
    carModel: 'Large Van',
    licensePlate: 'GH-004-VAN',
    capacity: 8,
    basePrice: 50,
    pricePerKm: 7.0,
    location: { type: 'Point', coordinates: [-0.1870, 5.6037] }, // Accra
    features: ['Large Space', 'Extra Luggage', 'Air Conditioning', 'GPS'],
    isAvailable: true,
    rating: 4.7,
    totalRides: 567
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adventurous-travel')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Ghana Locations Data
const locationsData = [
  // Greater Accra Region
  { name: 'Kotoka International Airport', type: 'airport', region: 'Greater Accra', popular: true, code: 'ACC' },
  { name: 'Osu Oxford Street', type: 'area', region: 'Greater Accra', popular: true },
  { name: 'Accra Mall', type: 'attraction', region: 'Greater Accra', popular: true },
  { name: 'Labadi Beach', type: 'attraction', region: 'Greater Accra', popular: true },
  { name: 'East Legon', type: 'area', region: 'Greater Accra', popular: true },
  { name: 'Legon', type: 'area', region: 'Greater Accra', popular: true, aliases: ['University of Ghana'] },
  { name: 'Tema', type: 'city', region: 'Greater Accra', popular: true },
  { name: 'Madina', type: 'area', region: 'Greater Accra', popular: true },
  { name: 'Circle', type: 'area', region: 'Greater Accra', popular: true, aliases: ['Kwame Nkrumah Circle'] },
  { name: 'Spintex', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Cantonments', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Airport Residential Area', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Dansoman', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Achimota', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Lapaz', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Independence Square', type: 'attraction', region: 'Greater Accra', popular: false },
  { name: 'Makola Market', type: 'attraction', region: 'Greater Accra', popular: false },
  { name: 'James Town', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'La Beach', type: 'attraction', region: 'Greater Accra', popular: false },
  { name: 'Teshie', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Nungua', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Haatso', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Adenta', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Tesano', type: 'area', region: 'Greater Accra', popular: false },
  { name: 'Kasoa', type: 'city', region: 'Central', popular: false },
  
  // Ashanti Region
  { name: 'Kumasi', type: 'city', region: 'Ashanti', popular: true },
  { name: 'Kumasi Airport', type: 'airport', region: 'Ashanti', popular: true },
  { name: 'Kejetia Market', type: 'attraction', region: 'Ashanti', popular: true },
  { name: 'Adum', type: 'area', region: 'Ashanti', popular: true },
  { name: 'KNUST', type: 'area', region: 'Ashanti', popular: true, aliases: ['Kwame Nkrumah University'] },
  { name: 'Asokwa', type: 'area', region: 'Ashanti', popular: false },
  { name: 'Bantama', type: 'area', region: 'Ashanti', popular: false },
  { name: 'Suame', type: 'area', region: 'Ashanti', popular: false },
  { name: 'Manhyia Palace', type: 'attraction', region: 'Ashanti', popular: true },
  { name: 'Ahodwo', type: 'area', region: 'Ashanti', popular: false },
  
  // Western Region
  { name: 'Takoradi', type: 'city', region: 'Western', popular: true },
  { name: 'Takoradi Harbour', type: 'attraction', region: 'Western', popular: true },
  { name: 'Sekondi', type: 'city', region: 'Western', popular: true },
  
  // Central Region
  { name: 'Cape Coast', type: 'city', region: 'Central', popular: true },
  { name: 'Cape Coast Castle', type: 'attraction', region: 'Central', popular: true },
  { name: 'University of Cape Coast', type: 'area', region: 'Central', popular: true, aliases: ['UCC'] },
  { name: 'Elmina', type: 'city', region: 'Central', popular: true },
  { name: 'Elmina Castle', type: 'attraction', region: 'Central', popular: true },
  { name: 'Kakum National Park', type: 'attraction', region: 'Central', popular: true },
  
  // Northern Region
  { name: 'Tamale', type: 'city', region: 'Northern', popular: true },
  { name: 'Tamale Airport', type: 'airport', region: 'Northern', popular: true },
  { name: 'Bolgatanga', type: 'city', region: 'Upper East', popular: true },
  { name: 'Wa', type: 'city', region: 'Upper West', popular: true }
];

// Hotels Data (sample - you'll need to add more)
const hotelsData = [
  {
    name: 'Labadi Beach Hotel',
    location: 'Labadi',
    city: 'Accra',
    region: 'Greater Accra',
    description: 'Luxury beachfront hotel in Accra',
    rating: 4.5,
    reviews: 450,
    pricePerNight: 200,
    currency: 'USD',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Spa', 'Gym'],
    featured: true,
    category: 'luxury'
  },
  {
    name: 'Mövenpick Ambassador Hotel',
    location: 'Airport Area',
    city: 'Accra',
    region: 'Greater Accra',
    description: 'Premium business hotel near airport',
    rating: 4.7,
    reviews: 380,
    pricePerNight: 180,
    currency: 'USD',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Business Center', 'Airport Shuttle'],
    featured: true,
    category: 'business'
  },
  {
    name: 'Golden Tulip',
    location: 'Airport Area',
    city: 'Accra',
    region: 'Greater Accra',
    description: 'Modern hotel with excellent facilities',
    rating: 4.3,
    reviews: 290,
    pricePerNight: 150,
    currency: 'USD',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym'],
    featured: false,
    category: 'business'
  },
  {
    name: 'Kempinski Hotel Gold Coast City',
    location: 'Ridge',
    city: 'Accra',
    region: 'Greater Accra',
    description: 'Ultra-luxury hotel in the heart of Accra',
    rating: 4.8,
    reviews: 520,
    pricePerNight: 300,
    currency: 'USD',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Concierge'],
    featured: true,
    category: 'luxury'
  },
  {
    name: 'Best Western Plus Atlantic Hotel',
    location: 'Takoradi',
    city: 'Takoradi',
    region: 'Western',
    description: 'Comfortable hotel in Takoradi',
    rating: 4.0,
    reviews: 180,
    pricePerNight: 100,
    currency: 'USD',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar'],
    featured: false,
    category: 'business'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Location.deleteMany({});
    await Hotel.deleteMany({});
    await Taxi.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Locations
    console.log('📍 Seeding locations...');
    const locations = await Location.insertMany(locationsData);
    console.log(`✅ ${locations.length} locations added\n`);

    // Seed Hotels
    console.log('🏨 Seeding hotels...');
    const hotels = await Hotel.insertMany(hotelsData);
    console.log(`✅ ${hotels.length} hotels added\n`);

    // Seed Vehicle Types
    console.log('🚗 Seeding vehicle types...');
    const vehicles = await Taxi.insertMany(vehicleTypesData);
    console.log(`✅ ${vehicles.length} vehicle types added\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\nDatabase Summary:');
    console.log(`  - Locations: ${locations.length}`);
    console.log(`  - Hotels: ${hotels.length}`);
    console.log(`  - Vehicle Types: ${vehicles.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
