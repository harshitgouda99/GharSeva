require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const ServiceCategory = require('./models/ServiceCategory');
const Service = require('./models/Service');
const ProviderApplication = require('./models/ProviderApplication');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Address = require('./models/Address');
const Earning = require('./models/Earning');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gharseva');
    console.log('Database connected for seeding...');

    // Clear all existing collections
    await User.deleteMany({});
    await ServiceCategory.deleteMany({});
    await Service.deleteMany({});
    await ProviderApplication.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Address.deleteMany({});
    await Earning.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Cleared all existing collections.');

    // 1. Seed Service Categories
    const categoriesData = [
      { name: 'Electrician', icon: 'Zap', description: 'Fan repair, wiring installations, short circuits fix, socket additions.' },
      { name: 'Plumber', icon: 'Droplet', description: 'Tap replacement, leakage repairs, blockages removal, pipeline setup.' },
      { name: 'Carpenter', icon: 'Hammer', description: 'Furniture repair, key replacement, wooden doors, cabinets installation.' },
      { name: 'Painter', icon: 'Paintbrush', description: 'Interior walls touch-up, exterior protection paint, full house decoration.' },
      { name: 'Cleaner', icon: 'Sparkles', description: 'Deep home sanitization, kitchen cleaning, bathroom cleaning, carpet wash.' },
      { name: 'AC Repair', icon: 'Wind', description: 'AC gas filling, servicing, board replacement, cooling issue fixes.' },
      { name: 'Home Appliance Repair', icon: 'Cpu', description: 'Refrigerator, washing machine, television, microwave service.' },
      { name: 'Home Maintenance', icon: 'Wrench', description: 'General house renovation, handyman tasks, drill and hang mounts.' },
      { name: 'Interior Services', icon: 'Layout', description: 'Modular kitchen construction, false ceiling design, wall panels.' },
      { name: 'Gardening', icon: 'Flower', description: 'Lawn trimming, potting services, weed removal, soil treatment.' }
    ];

    const categories = await ServiceCategory.insertMany(categoriesData);
    console.log(`Seeded ${categories.length} Service Categories.`);

    // 2. Seed Users
    // Admin Account
    const adminUser = await User.create({
      fullName: 'GharSeva Admin',
      email: 'admin@gharseva.com',
      password: 'Password123',
      phone: '+919999999999',
      role: 'admin',
      profileImage: ''
    });

    // Customer Account
    const customerUser = await User.create({
      fullName: 'Ravi Kumar',
      email: 'customer@gharseva.com',
      password: 'Password123',
      phone: '+919876543210',
      role: 'customer',
      profileImage: ''
    });

    // Approved Provider Account
    const providerUser = await User.create({
      fullName: 'Aman Sharma',
      email: 'provider@gharseva.com',
      password: 'Password123',
      phone: '+919888888888',
      role: 'provider',
      profileImage: ''
    });

    // Pending Provider Account (starts as customer with application pending)
    const pendingProviderUser = await User.create({
      fullName: 'Vikram Singh',
      email: 'pending@gharseva.com',
      password: 'Password123',
      phone: '+919777777777',
      role: 'customer', // remains customer until approved
      profileImage: ''
    });

    console.log('Seeded Users (Admin, Customer, Approved Provider, Pending Provider).');

    // 3. Seed Provider Applications
    // Approved provider application
    await ProviderApplication.create({
      userId: providerUser._id,
      category: 'Electrician',
      experience: 5,
      skills: ['Wiring', 'Switchboards', 'Inverters', 'Home Lighting'],
      documents: ['/uploads/doc_id_proof.pdf', '/uploads/license.pdf'],
      status: 'approved'
    });

    // Pending provider application
    await ProviderApplication.create({
      userId: pendingProviderUser._id,
      category: 'Plumber',
      experience: 3,
      skills: ['Leakage repairs', 'Drain unblocking', 'Fixture replacements'],
      documents: ['/uploads/pending_id_proof.pdf'],
      status: 'pending'
    });

    console.log('Seeded Provider Applications.');

    // 4. Seed Address for Customer
    const address = await Address.create({
      userId: customerUser._id,
      fullName: 'Ravi Kumar',
      phone: '+919876543210',
      houseNo: 'Flat 402, Sector 15',
      area: 'C.B.D Belapur',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400614',
      isDefault: true
    });

    console.log('Seeded Customer Address.');

    // 5. Seed Services for Approved Provider (Electrician category)
    const electricianCategory = categories.find(c => c.name === 'Electrician');
    const cleanerCategory = categories.find(c => c.name === 'Cleaner');

    const service1 = await Service.create({
      providerId: providerUser._id,
      categoryId: electricianCategory._id,
      serviceTitle: 'Ceiling Fan Installation & Repair',
      description: 'Professional setup, mounting, and wiring connection for ceiling fans. Includes troubleshooting noise, speed control, or coil replacement issues.',
      price: 349,
      serviceImage: '',
      averageRating: 4.8,
      totalReviews: 5
    });

    const service2 = await Service.create({
      providerId: providerUser._id,
      categoryId: electricianCategory._id,
      serviceTitle: 'Complete House Wiring Inspection',
      description: 'Comprehensive testing of switches, sockets, safety circuit breakers (MCBs), and main lines. Find and repair short circuits or earthing issues.',
      price: 999,
      serviceImage: '',
      averageRating: 4.5,
      totalReviews: 2
    });

    console.log('Seeded Service Listings.');

    // 6. Seed Bookings
    // Completed Booking
    const booking1 = await Booking.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: service1._id,
      bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      addressId: address._id,
      bookingStatus: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Accepted Booking
    const booking2 = await Booking.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: service2._id,
      bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      addressId: address._id,
      bookingStatus: 'accepted',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // Pending Booking
    const booking3 = await Booking.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: service1._id,
      bookingDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days in future
      addressId: address._id,
      bookingStatus: 'pending',
      createdAt: new Date()
    });

    console.log('Seeded Bookings (Completed, Accepted, Pending).');

    // 7. Seed Reviews
    await Review.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: service1._id,
      bookingId: booking1._id,
      rating: 5,
      reviewText: 'Aman arrived on time, was extremely polite, and resolved my fan rotation issues very quickly. Highly recommend!'
    });

    console.log('Seeded Service Review.');

    // 8. Seed Earnings for Completed Booking
    await Earning.create({
      providerId: providerUser._id,
      bookingId: booking1._id,
      amount: service1.price,
      providerAmount: Math.round(service1.price * 0.95),
      adminAmount: Math.round(service1.price * 0.05),
      status: 'pending'
    });

    console.log('Seeded Earnings.');

    // 9. Seed System Notifications
    await Notification.create({
      userId: customerUser._id,
      type: 'booking_completed',
      title: 'Service Completed',
      message: `Your booking for "${service1.serviceTitle}" has been completed.`
    });

    await Notification.create({
      userId: providerUser._id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `You have a pending booking request for "${service1.serviceTitle}" scheduled on ${booking3.bookingDate.toDateString()}.`
    });

    console.log('Seeded Notifications.');

    // 10. Seed Activity Logs
    await ActivityLog.create({
      userId: adminUser._id,
      action: 'SYSTEM_SEED',
      description: 'System database seeded with default categories and mock accounts.'
    });

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
