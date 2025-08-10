// Hotel Templates for Setup Wizard
export interface HotelTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'luxury' | 'business' | 'budget' | 'boutique';
  roomTypes: {
    name: string;
    capacity: number;
    basePrice: number;
    amenities: string[];
  }[];
  facilities: string[];
  services: string[];
  defaultSettings: {
    currency: string;
    language: string;
  };
  recommendedPlan: string;
}

export const HOTEL_TEMPLATES: HotelTemplate[] = [
  {
    id: 'luxury-resort',
    name: 'Luxury Resort',
    description: 'Premium resort with full amenities and spa services',
    icon: 'Crown',
    category: 'luxury',
    roomTypes: [
      {
        name: 'Deluxe Suite',
        capacity: 2,
        basePrice: 50000,
        amenities: ['Ocean View', 'Private Balcony', 'Premium Minibar', 'King Size Bed', '24/7 Butler Service']
      },
      {
        name: 'Pool Villa',
        capacity: 4,
        basePrice: 120000,
        amenities: ['Private Pool', 'Garden View', 'Kitchen', 'Living Room', 'Premium Amenities']
      },
      {
        name: 'Garden View Room',
        capacity: 2,
        basePrice: 35000,
        amenities: ['Garden View', 'Standard Amenities', 'WiFi', 'Mini Fridge']
      }
    ],
    facilities: ['Spa', 'Swimming Pool', 'Fitness Center', 'Multiple Restaurants', 'Conference Hall', 'Kids Club'],
    services: ['Butler Service', '24/7 Concierge', 'Room Service', 'Airport Transfer', 'Laundry', 'Babysitting'],
    defaultSettings: {
      currency: 'NGN',
      language: 'en'
    },
    recommendedPlan: 'enterprise'
  },
  {
    id: 'business-hotel',
    name: 'Business Hotel',
    description: 'Modern hotel focused on business travelers',
    icon: 'Briefcase',
    category: 'business',
    roomTypes: [
      {
        name: 'Executive Suite',
        capacity: 2,
        basePrice: 25000,
        amenities: ['Work Desk', 'Meeting Area', 'Premium WiFi', 'Coffee Machine', 'City View']
      },
      {
        name: 'Standard Room',
        capacity: 2,
        basePrice: 15000,
        amenities: ['Work Desk', 'WiFi', 'Coffee Machine', 'Air Conditioning']
      }
    ],
    facilities: ['Conference Halls', 'Meeting Rooms', 'Business Center', 'Restaurant', 'Parking'],
    services: ['Airport Pickup', 'Express Check-in', 'Laundry', 'Room Service', 'Car Rental'],
    defaultSettings: {
      currency: 'NGN',
      language: 'en'
    },
    recommendedPlan: 'professional'
  },
  {
    id: 'budget-hotel',
    name: 'Budget Hotel',
    description: 'Affordable accommodation with essential amenities',
    icon: 'Heart',
    category: 'budget',
    roomTypes: [
      {
        name: 'Single Room',
        capacity: 1,
        basePrice: 8000,
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Private Bathroom']
      },
      {
        name: 'Double Room',
        capacity: 2,
        basePrice: 12000,
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Private Bathroom']
      }
    ],
    facilities: ['Lobby', 'Parking', 'Free WiFi', 'Reception'],
    services: ['Breakfast', 'Room Cleaning', 'Reception Service'],
    defaultSettings: {
      currency: 'NGN',
      language: 'en'
    },
    recommendedPlan: 'starter'
  },
  {
    id: 'boutique-hotel',
    name: 'Boutique Hotel',
    description: 'Unique, stylish hotel with personalized service',
    icon: 'Palette',
    category: 'boutique',
    roomTypes: [
      {
        name: 'Themed Suite',
        capacity: 2,
        basePrice: 30000,
        amenities: ['Unique Design', 'Premium Amenities', 'Art Collection', 'Custom Decor']
      },
      {
        name: 'Standard Room',
        capacity: 2,
        basePrice: 20000,
        amenities: ['Artistic Design', 'Premium Bed', 'WiFi', 'Mini Bar']
      }
    ],
    facilities: ['Art Gallery', 'Boutique Restaurant', 'Rooftop Terrace', 'Library'],
    services: ['Personal Concierge', 'Local Tours', 'Art Tours', 'Room Service', 'Custom Experiences'],
    defaultSettings: {
      currency: 'NGN',
      language: 'en'
    },
    recommendedPlan: 'professional'
  }
];

export const getTemplateById = (templateId: string): HotelTemplate | null => {
  return HOTEL_TEMPLATES.find(template => template.id === templateId) || null;
};

export const getTemplatesByCategory = (category: string): HotelTemplate[] => {
  return HOTEL_TEMPLATES.filter(template => template.category === category);
};

export const getAllTemplates = (): HotelTemplate[] => {
  return HOTEL_TEMPLATES;
};