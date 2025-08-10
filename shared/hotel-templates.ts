// Hotel Templates Configuration
// This file defines the standard hotel templates that can be selected during setup

export interface HotelTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'luxury' | 'business' | 'budget' | 'boutique' | 'custom';
  
  // Pre-configured facilities
  facilities: string[];
  
  // Pre-configured services  
  services: string[];
  
  // Pre-configured room types with pricing
  roomTypes: Array<{
    name: string;
    type: string;
    capacity: number;
    basePrice: number;
    currency: string;
    amenities: string[];
    description?: string;
  }>;
  
  // Recommended subscription plan
  recommendedPlan: 'starter' | 'professional' | 'enterprise';
  
  // Default settings
  defaultSettings: {
    currency: string;
    language: string;
    maxStaff: number;
    checkInTime: string;
    checkOutTime: string;
  };
}

export const HOTEL_TEMPLATES: HotelTemplate[] = [
  {
    id: 'luxury-resort',
    name: 'Luxury Resort',
    description: 'High-end resort with premium amenities and world-class service',
    icon: 'Crown',
    category: 'luxury',
    facilities: [
      'Spa & Wellness Center',
      'Infinity Pool',
      'Private Beach Access',
      'Fitness Center',
      'Multiple Restaurants',
      'Pool Villas',
      'Conference Facilities',
      'Kids Club',
      'Tennis Court',
      'Golf Course Access'
    ],
    services: [
      'Butler Service',
      '24/7 Concierge',
      'Room Service',
      'Spa Treatments',
      'Airport Limousine',
      'Private Chef',
      'Yacht Charter',
      'Personal Shopping',
      'Tour Guide Services',
      'Laundry & Dry Cleaning'
    ],
    roomTypes: [
      {
        name: 'Garden View Room',
        type: 'standard',
        capacity: 2,
        basePrice: 100000,
        currency: 'NGN',
        amenities: ['King Bed', 'Garden View', 'Mini Bar', 'WiFi', 'AC', 'Balcony'],
        description: 'Elegant room overlooking beautiful tropical gardens'
      },
      {
        name: 'Ocean View Suite',
        type: 'suite',
        capacity: 3,
        basePrice: 150000,
        currency: 'NGN',
        amenities: ['King Bed', 'Ocean View', 'Living Area', 'Mini Bar', 'WiFi', 'AC', 'Private Balcony'],
        description: 'Spacious suite with stunning ocean views'
      },
      {
        name: 'Pool Villa',
        type: 'villa',
        capacity: 4,
        basePrice: 250000,
        currency: 'NGN',
        amenities: ['King Bed', 'Private Pool', 'Butler Service', 'Garden View', 'Kitchen', 'WiFi', 'AC'],
        description: 'Luxurious villa with private pool and dedicated butler'
      },
      {
        name: 'Presidential Suite',
        type: 'presidential',
        capacity: 6,
        basePrice: 500000,
        currency: 'NGN',
        amenities: ['Master Bedroom', 'Ocean View', 'Private Pool', 'Butler Service', 'Kitchen', 'Living Room', 'Dining Area'],
        description: 'Ultimate luxury accommodation with unparalleled amenities'
      }
    ],
    recommendedPlan: 'enterprise',
    defaultSettings: {
      currency: 'NGN',
      language: 'en',
      maxStaff: 50,
      checkInTime: '15:00',
      checkOutTime: '12:00'
    }
  },
  
  {
    id: 'business-hotel',
    name: 'Business Hotel',
    description: 'Professional hotel designed for business travelers and corporate events',
    icon: 'Briefcase',
    category: 'business',
    facilities: [
      'Business Center',
      'Conference Halls',
      'Meeting Rooms',
      'Executive Lounge',
      'Fitness Center',
      'Restaurant',
      'High-Speed Internet',
      'Parking Garage',
      'Airport Shuttle'
    ],
    services: [
      'Express Check-in/out',
      'Airport Transfer',
      'Laundry Service',
      'Room Service',
      'Wake-up Calls',
      'Currency Exchange',
      'Business Support',
      'Event Planning',
      'Equipment Rental'
    ],
    roomTypes: [
      {
        name: 'Standard Room',
        type: 'standard',
        capacity: 2,
        basePrice: 50000,
        currency: 'NGN',
        amenities: ['Queen Bed', 'Work Desk', 'High-Speed WiFi', 'TV', 'AC', 'Coffee Machine'],
        description: 'Comfortable room perfect for business travelers'
      },
      {
        name: 'Executive Suite',
        type: 'executive',
        capacity: 2,
        basePrice: 80000,
        currency: 'NGN',
        amenities: ['King Bed', 'Separate Living Area', 'Work Desk', 'High-Speed WiFi', 'TV', 'AC', 'Coffee Machine', 'Mini Bar'],
        description: 'Spacious suite with separate work and relaxation areas'
      },
      {
        name: 'Business Suite',
        type: 'business',
        capacity: 4,
        basePrice: 120000,
        currency: 'NGN',
        amenities: ['King Bed', 'Meeting Area', 'Work Desk', 'High-Speed WiFi', 'TV', 'AC', 'Coffee Machine', 'Mini Bar', 'Printer'],
        description: 'Premium suite with dedicated meeting space'
      }
    ],
    recommendedPlan: 'professional',
    defaultSettings: {
      currency: 'NGN',
      language: 'en',
      maxStaff: 25,
      checkInTime: '14:00',
      checkOutTime: '12:00'
    }
  },
  
  {
    id: 'budget-hotel',
    name: 'Budget Hotel',
    description: 'Affordable accommodation with essential amenities and friendly service',
    icon: 'Heart',
    category: 'budget',
    facilities: [
      'Reception Lobby',
      'Free WiFi',
      'Parking',
      'Breakfast Area',
      'Vending Machines',
      'Luggage Storage'
    ],
    services: [
      'Continental Breakfast',
      'Free WiFi',
      'Daily Housekeeping',
      'Parking',
      'Tourist Information',
      'Luggage Storage'
    ],
    roomTypes: [
      {
        name: 'Single Room',
        type: 'single',
        capacity: 1,
        basePrice: 15000,
        currency: 'NGN',
        amenities: ['Single Bed', 'WiFi', 'TV', 'AC', 'Private Bathroom'],
        description: 'Cozy single room with essential amenities'
      },
      {
        name: 'Double Room',
        type: 'double',
        capacity: 2,
        basePrice: 25000,
        currency: 'NGN',
        amenities: ['Double Bed', 'WiFi', 'TV', 'AC', 'Private Bathroom', 'Work Desk'],
        description: 'Comfortable double room for couples or business travelers'
      },
      {
        name: 'Family Room',
        type: 'family',
        capacity: 4,
        basePrice: 40000,
        currency: 'NGN',
        amenities: ['Double Bed', 'Bunk Bed', 'WiFi', 'TV', 'AC', 'Private Bathroom', 'Mini Fridge'],
        description: 'Spacious room perfect for families with children'
      }
    ],
    recommendedPlan: 'starter',
    defaultSettings: {
      currency: 'NGN',
      language: 'en',
      maxStaff: 10,
      checkInTime: '14:00',
      checkOutTime: '11:00'
    }
  },
  
  {
    id: 'boutique-hotel',
    name: 'Boutique Hotel',
    description: 'Unique, stylish hotel with personalized service and distinctive character',
    icon: 'Palette',
    category: 'boutique',
    facilities: [
      'Art Gallery',
      'Designer Lobby',
      'Rooftop Terrace',
      'Boutique Shop',
      'Wine Bar',
      'Library Lounge',
      'Garden Courtyard'
    ],
    services: [
      'Personal Concierge',
      'Local Experience Tours',
      'Art Curation',
      'Bespoke Experiences',
      'Private Dining',
      'Cultural Events',
      'Artisan Shopping',
      'Photography Services'
    ],
    roomTypes: [
      {
        name: 'Artisan Room',
        type: 'standard',
        capacity: 2,
        basePrice: 70000,
        currency: 'NGN',
        amenities: ['Queen Bed', 'Local Art', 'Designer Furniture', 'Premium Toiletries', 'WiFi', 'AC', 'City View'],
        description: 'Uniquely designed room featuring local artisan works'
      },
      {
        name: 'Themed Suite',
        type: 'themed',
        capacity: 2,
        basePrice: 120000,
        currency: 'NGN',
        amenities: ['King Bed', 'Unique Design Theme', 'Premium Amenities', 'Local Art', 'WiFi', 'AC', 'City View', 'Mini Bar'],
        description: 'One-of-a-kind suite with distinctive thematic design'
      },
      {
        name: 'Penthouse Suite',
        type: 'penthouse',
        capacity: 4,
        basePrice: 200000,
        currency: 'NGN',
        amenities: ['King Bed', 'Rooftop Access', 'Premium Design', 'City Views', 'Kitchen', 'Living Area', 'WiFi', 'AC'],
        description: 'Exclusive penthouse with rooftop access and panoramic views'
      }
    ],
    recommendedPlan: 'professional',
    defaultSettings: {
      currency: 'NGN',
      language: 'en',
      maxStaff: 20,
      checkInTime: '15:00',
      checkOutTime: '12:00'
    }
  }
];

export const getTemplateById = (id: string): HotelTemplate | undefined => {
  return HOTEL_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: HotelTemplate['category']): HotelTemplate[] => {
  return HOTEL_TEMPLATES.filter(template => template.category === category);
};

export const getAllTemplates = (): HotelTemplate[] => {
  return HOTEL_TEMPLATES;
};