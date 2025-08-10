import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Building, 
  User, 
  MapPin, 
  Bed, 
  Coffee, 
  CreditCard, 
  Globe, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Crown,
  Star,
  Briefcase,
  Heart,
  Palette
} from "lucide-react";

interface HotelTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  facilities: string[];
  roomTypes: Array<{
    name: string;
    capacity: number;
    basePrice: number;
    amenities: string[];
  }>;
  services: string[];
}

const hotelTemplates: HotelTemplate[] = [
  {
    id: 'luxury-resort',
    name: 'Luxury Resort',
    description: 'High-end resort with premium amenities and services',
    icon: Crown,
    facilities: ['Spa', 'Pool', 'Gym', 'Restaurants', 'Villas', 'Beach Access'],
    roomTypes: [
      { name: 'Deluxe Suite', capacity: 2, basePrice: 150000, amenities: ['King Bed', 'Ocean View', 'Mini Bar'] },
      { name: 'Pool Villa', capacity: 4, basePrice: 250000, amenities: ['Private Pool', 'Butler Service', 'Garden View'] },
      { name: 'Garden View Room', capacity: 2, basePrice: 100000, amenities: ['Queen Bed', 'Garden View', 'Balcony'] }
    ],
    services: ['Butler Service', '24/7 Concierge', 'Room Service', 'Spa Treatments', 'Airport Pickup']
  },
  {
    id: 'business-hotel',
    name: 'Business Hotel',
    description: 'Professional hotel for business travelers',
    icon: Briefcase,
    facilities: ['Conference Hall', 'Meeting Rooms', 'Business Center', 'Gym', 'Restaurant'],
    roomTypes: [
      { name: 'Executive Suite', capacity: 2, basePrice: 80000, amenities: ['Work Desk', 'High-Speed WiFi', 'Coffee Machine'] },
      { name: 'Standard Room', capacity: 2, basePrice: 50000, amenities: ['Queen Bed', 'Work Desk', 'WiFi'] }
    ],
    services: ['Express Check-in', 'Airport Pickup', 'Laundry Service', 'Business Center', 'Meeting Facilities']
  },
  {
    id: 'budget-hotel',
    name: 'Budget Hotel',
    description: 'Affordable accommodation with essential amenities',
    icon: Heart,
    facilities: ['Lobby', 'Parking', 'Free WiFi', 'Reception'],
    roomTypes: [
      { name: 'Single Room', capacity: 1, basePrice: 15000, amenities: ['Single Bed', 'WiFi', 'TV'] },
      { name: 'Double Room', capacity: 2, basePrice: 25000, amenities: ['Double Bed', 'WiFi', 'TV', 'AC'] }
    ],
    services: ['Breakfast', 'WiFi', 'Parking', 'Reception']
  },
  {
    id: 'boutique-hotel',
    name: 'Boutique Hotel',
    description: 'Unique, stylish hotel with personalized service',
    icon: Palette,
    facilities: ['Art Gallery', 'Designer Lobby', 'Rooftop Bar', 'Boutique Shop'],
    roomTypes: [
      { name: 'Themed Suite', capacity: 2, basePrice: 120000, amenities: ['Unique Design', 'Premium Amenities', 'City View'] },
      { name: 'Standard Room', capacity: 2, basePrice: 70000, amenities: ['Designer Furniture', 'Local Art', 'Premium Toiletries'] }
    ],
    services: ['Personal Concierge', 'Local Tours', 'Art Curation', 'Bespoke Experiences']
  }
];

const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 35000,
    currency: 'NGN',
    roomLimit: 20,
    staffLimit: 5,
    features: ['Basic Reporting', 'Email Support', 'Room Management', 'Basic Booking']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 75000,
    currency: 'NGN',
    roomLimit: 100,
    staffLimit: 25,
    features: ['Advanced Analytics', 'Priority Support', 'API Access', 'OTA Integration', 'Staff Management']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 120000,
    currency: 'NGN',
    roomLimit: -1,
    staffLimit: -1,
    features: ['Unlimited Everything', '24/7 Support', 'Custom Integrations', 'White-label', 'Priority Features']
  }
];

interface HotelSetupWizardProps {
  onClose: () => void;
}

export default function HotelSetupWizard({ onClose }: HotelSetupWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    // Step 1: Owner Selection
    ownerId: '',
    newOwner: {
      fullName: '',
      email: '',
      username: '',
      phone: '',
      password: ''
    },
    ownerType: 'existing', // 'existing' or 'new'
    
    // Step 2: Template Selection
    selectedTemplate: '',
    
    // Step 3: Basic Hotel Info
    hotelInfo: {
      name: '',
      slug: '',
      address: '',
      city: '',
      country: 'Nigeria',
      phone: '',
      email: '',
      website: '',
      totalRooms: 0,
      currency: 'NGN',
      defaultLanguage: 'en'
    },
    
    // Step 4: Rooms Configuration
    roomTypes: [],
    
    // Step 5: Facilities & Services
    facilities: [],
    services: [],
    
    // Step 6: Subscription Plan
    subscriptionPlan: '',
    billingCycle: 'monthly',
    
    // Step 7: Domain Setup
    domainType: 'subdomain', // 'subdomain' or 'custom'
    customDomain: '',
    
    // Step 8: Review
    sendWelcomeEmail: true
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const unassignedOwners = (users as any[]).filter((u: any) => u.role === 'HOTEL_OWNER' && !u.hotelId);

  const totalSteps = 8;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateWizardData = (step: string, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof typeof prev], ...data }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (template: HotelTemplate) => {
    setWizardData(prev => ({
      ...prev,
      selectedTemplate: template.id,
      roomTypes: template.roomTypes,
      facilities: template.facilities,
      services: template.services
    }));
  };

  const handleCreateOwner = async () => {
    try {
      const response = await fetch('/api/admin/hotel-owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardData.newOwner)
      });

      if (response.ok) {
        const newOwner = await response.json();
        setWizardData(prev => ({
          ...prev,
          ownerId: newOwner.id
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        return newOwner;
      } else {
        throw new Error('Failed to create owner');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create hotel owner",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCompleteSetup = async () => {
    try {
      // Create owner if new
      if (wizardData.ownerType === 'new') {
        await handleCreateOwner();
      }

      // Generate slug from hotel name if not provided
      const slug = wizardData.hotelInfo.slug || 
        wizardData.hotelInfo.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      // Create hotel
      const hotelData = {
        name: wizardData.hotelInfo.name,
        slug: slug,
        address: wizardData.hotelInfo.address,
        phone: wizardData.hotelInfo.phone,
        email: wizardData.hotelInfo.email,
        totalRooms: wizardData.hotelInfo.totalRooms,
        maxStaff: 50, // Default based on subscription
        description: `${wizardData.selectedTemplate ? hotelTemplates.find(t => t.id === wizardData.selectedTemplate)?.description : 'Modern hotel'} located in ${wizardData.hotelInfo.city}, ${wizardData.hotelInfo.country}`,
        ownerId: wizardData.ownerId,
        status: 'active'
      };

      const response = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelData)
      });

      if (response.ok) {
        const newHotel = await response.json();
        
        toast({
          title: "Success!",
          description: `Hotel "${wizardData.hotelInfo.name}" has been created successfully`
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels'] });
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create hotel');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete hotel setup",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select or Create Hotel Owner</h3>
              <p className="text-gray-600">Choose an existing owner or create a new one</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${wizardData.ownerType === 'existing' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, ownerType: 'existing' }))}
              >
                <CardContent className="p-4 text-center">
                  <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Existing Owner</h4>
                  <p className="text-sm text-gray-600">Select from existing hotel owners</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${wizardData.ownerType === 'new' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, ownerType: 'new' }))}
              >
                <CardContent className="p-4 text-center">
                  <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">New Owner</h4>
                  <p className="text-sm text-gray-600">Create a new hotel owner</p>
                </CardContent>
              </Card>
            </div>

            {wizardData.ownerType === 'existing' && (
              <div className="space-y-2">
                <Label>Select Existing Owner</Label>
                <Select 
                  value={wizardData.ownerId} 
                  onValueChange={(value) => setWizardData(prev => ({ ...prev, ownerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an unassigned owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedOwners.map((owner: any) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.fullName} - {owner.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {wizardData.ownerType === 'new' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={wizardData.newOwner.fullName}
                      onChange={(e) => updateWizardData('newOwner', { fullName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={wizardData.newOwner.email}
                      onChange={(e) => updateWizardData('newOwner', { email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input
                      value={wizardData.newOwner.username}
                      onChange={(e) => updateWizardData('newOwner', { username: e.target.value })}
                      placeholder="johnsmith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={wizardData.newOwner.phone}
                      onChange={(e) => updateWizardData('newOwner', { phone: e.target.value })}
                      placeholder="+234 123 456 7890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Temporary Password *</Label>
                  <Input
                    type="password"
                    value={wizardData.newOwner.password}
                    onChange={(e) => updateWizardData('newOwner', { password: e.target.value })}
                    placeholder="Auto-generated password"
                  />
                  <p className="text-sm text-gray-600">Owner will be required to change this on first login</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Choose Hotel Template</h3>
              <p className="text-gray-600">Select a template to pre-configure your hotel</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {hotelTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all ${wizardData.selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <Icon className="w-6 h-6 text-blue-600 mr-2" />
                        <h4 className="font-medium">{template.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Facilities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.facilities.slice(0, 3).map((facility) => (
                              <Badge key={facility} variant="secondary" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                            {template.facilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.facilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card 
              className={`cursor-pointer transition-all ${wizardData.selectedTemplate === 'custom' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setWizardData(prev => ({ ...prev, selectedTemplate: 'custom', roomTypes: [], facilities: [], services: [] }))}
            >
              <CardContent className="p-4 text-center">
                <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Custom Setup</h4>
                <p className="text-sm text-gray-600">Configure everything from scratch</p>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Basic Hotel Information</h3>
              <p className="text-gray-600">Enter your hotel's essential details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Name *</Label>
                <Input
                  value={wizardData.hotelInfo.name}
                  onChange={(e) => updateWizardData('hotelInfo', { name: e.target.value })}
                  placeholder="Grand Lagos Hotel"
                />
              </div>
              <div className="space-y-2">
                <Label>Hotel Slug *</Label>
                <Input
                  value={wizardData.hotelInfo.slug}
                  onChange={(e) => updateWizardData('hotelInfo', { slug: e.target.value })}
                  placeholder="grand-lagos-hotel"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address *</Label>
                <Input
                  value={wizardData.hotelInfo.address}
                  onChange={(e) => updateWizardData('hotelInfo', { address: e.target.value })}
                  placeholder="123 Victoria Island, Lagos, Nigeria"
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={wizardData.hotelInfo.city}
                  onChange={(e) => updateWizardData('hotelInfo', { city: e.target.value })}
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={wizardData.hotelInfo.country}
                  onValueChange={(value) => updateWizardData('hotelInfo', { country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={wizardData.hotelInfo.phone}
                  onChange={(e) => updateWizardData('hotelInfo', { phone: e.target.value })}
                  placeholder="+234 123 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={wizardData.hotelInfo.email}
                  onChange={(e) => updateWizardData('hotelInfo', { email: e.target.value })}
                  placeholder="contact@grandlagos.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Rooms *</Label>
                <Input
                  type="number"
                  value={wizardData.hotelInfo.totalRooms}
                  onChange={(e) => updateWizardData('hotelInfo', { totalRooms: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={wizardData.hotelInfo.currency}
                  onValueChange={(value) => updateWizardData('hotelInfo', { currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                    <SelectItem value="GHS">GHS (Ghanaian Cedi)</SelectItem>
                    <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                    <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={wizardData.hotelInfo.website}
                  onChange={(e) => updateWizardData('hotelInfo', { website: e.target.value })}
                  placeholder="https://grandlagos.com"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bed className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Room Configuration</h3>
              <p className="text-gray-600">
                {wizardData.selectedTemplate !== 'custom' ? 'Review and adjust room types from your template' : 'Add your room types'}
              </p>
            </div>

            <div className="space-y-4">
              {wizardData.roomTypes.map((room: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Room Name</Label>
                        <Input
                          value={room.name}
                          onChange={(e) => {
                            const newRooms = [...wizardData.roomTypes];
                            newRooms[index] = { ...room, name: e.target.value };
                            setWizardData(prev => ({ ...prev, roomTypes: newRooms }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Capacity</Label>
                        <Input
                          type="number"
                          value={room.capacity}
                          onChange={(e) => {
                            const newRooms = [...wizardData.roomTypes];
                            newRooms[index] = { ...room, capacity: parseInt(e.target.value) || 0 };
                            setWizardData(prev => ({ ...prev, roomTypes: newRooms }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Base Price ({wizardData.hotelInfo.currency})</Label>
                        <Input
                          type="number"
                          value={room.basePrice}
                          onChange={(e) => {
                            const newRooms = [...wizardData.roomTypes];
                            newRooms[index] = { ...room, basePrice: parseInt(e.target.value) || 0 };
                            setWizardData(prev => ({ ...prev, roomTypes: newRooms }));
                          }}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newRooms = wizardData.roomTypes.filter((_, i) => i !== index);
                          setWizardData(prev => ({ ...prev, roomTypes: newRooms }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((amenity: string, amenityIndex: number) => (
                          <Badge key={amenityIndex} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                variant="outline" 
                onClick={() => {
                  const newRoom = {
                    name: '',
                    capacity: 2,
                    basePrice: 50000,
                    amenities: ['WiFi', 'TV', 'AC']
                  };
                  setWizardData(prev => ({ ...prev, roomTypes: [...prev.roomTypes, newRoom] }));
                }}
                className="w-full"
              >
                Add Room Type
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Coffee className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Facilities & Services</h3>
              <p className="text-gray-600">Configure what your hotel offers</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Facilities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Parking', 'WiFi', 'Conference Hall', 'Business Center', 'Beach Access', 'Garden', 'Playground'].map((facility) => (
                    <label key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={wizardData.facilities.includes(facility)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWizardData(prev => ({ ...prev, facilities: [...prev.facilities, facility] }));
                          } else {
                            setWizardData(prev => ({ ...prev, facilities: prev.facilities.filter(f => f !== facility) }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Services</h4>
                <div className="grid grid-cols-1 gap-2">
                  {['Room Service', 'Laundry', 'Airport Pickup', 'Concierge', 'Butler Service', 'Spa Treatments', 'Tour Booking', 'Car Rental', 'Breakfast', 'Express Check-in'].map((service) => (
                    <label key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={wizardData.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWizardData(prev => ({ ...prev, services: [...prev.services, service] }));
                          } else {
                            setWizardData(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Subscription Plan</h3>
              <p className="text-gray-600">Choose the right plan for your hotel</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${wizardData.subscriptionPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setWizardData(prev => ({ ...prev, subscriptionPlan: plan.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-2xl font-bold text-green-600">
                          ₦{plan.price.toLocaleString()}/month
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Rooms: {plan.roomLimit === -1 ? 'Unlimited' : plan.roomLimit}</div>
                        <div>Staff: {plan.staffLimit === -1 ? 'Unlimited' : plan.staffLimit}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <Label>Billing Cycle</Label>
                <Select 
                  value={wizardData.billingCycle}
                  onValueChange={(value) => setWizardData(prev => ({ ...prev, billingCycle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly (10% discount)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Domain & Access Setup</h3>
              <p className="text-gray-600">Configure how guests will access your hotel</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${wizardData.domainType === 'subdomain' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, domainType: 'subdomain' }))}
              >
                <CardContent className="p-4 text-center">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Default Subdomain</h4>
                  <p className="text-sm text-gray-600 mb-2">Quick setup with automatic domain</p>
                  <div className="bg-gray-100 p-2 rounded text-sm">
                    {wizardData.hotelInfo.slug || 'your-hotel'}.luxuryhotelsaas.com
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${wizardData.domainType === 'custom' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, domainType: 'custom' }))}
              >
                <CardContent className="p-4 text-center">
                  <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">Custom Domain</h4>
                  <p className="text-sm text-gray-600">Use your own domain name</p>
                </CardContent>
              </Card>
            </div>

            {wizardData.domainType === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input
                    value={wizardData.customDomain}
                    onChange={(e) => setWizardData(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="grandlagos.com"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">DNS Setup Instructions</h5>
                  <p className="text-sm text-gray-600 mb-2">Add these DNS records to your domain:</p>
                  <div className="space-y-1 text-sm font-mono">
                    <div>Type: CNAME</div>
                    <div>Name: @</div>
                    <div>Value: hotels.luxuryhotelsaas.com</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Review & Launch</h3>
              <p className="text-gray-600">Review your settings before creating the hotel</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {wizardData.hotelInfo.name}</div>
                  <div><strong>Address:</strong> {wizardData.hotelInfo.address}</div>
                  <div><strong>Rooms:</strong> {wizardData.hotelInfo.totalRooms}</div>
                  <div><strong>Template:</strong> {wizardData.selectedTemplate === 'custom' ? 'Custom Setup' : 
                    hotelTemplates.find(t => t.id === wizardData.selectedTemplate)?.name || 'None'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Owner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {wizardData.ownerType === 'existing' ? (
                    <div><strong>Owner:</strong> {unassignedOwners.find(o => o.id === wizardData.ownerId)?.fullName || 'Selected Owner'}</div>
                  ) : (
                    <div><strong>New Owner:</strong> {wizardData.newOwner.fullName} ({wizardData.newOwner.email})</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Subscription & Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Plan:</strong> {subscriptionPlans.find(p => p.id === wizardData.subscriptionPlan)?.name || 'Not selected'}</div>
                  <div><strong>Domain:</strong> {wizardData.domainType === 'custom' ? wizardData.customDomain : 
                    `${wizardData.hotelInfo.slug || 'hotel'}.luxuryhotelsaas.com`}</div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={wizardData.sendWelcomeEmail}
                  onChange={(e) => setWizardData(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Send welcome email to hotel owner</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.ownerType === 'existing' ? !!wizardData.ownerId : 
          !!(wizardData.newOwner.fullName && wizardData.newOwner.email && wizardData.newOwner.username && wizardData.newOwner.password);
      case 2:
        return !!wizardData.selectedTemplate;
      case 3:
        return !!(wizardData.hotelInfo.name && wizardData.hotelInfo.address && wizardData.hotelInfo.totalRooms > 0);
      case 4:
        return wizardData.roomTypes.length > 0;
      case 5:
        return true; // Optional step
      case 6:
        return !!wizardData.subscriptionPlan;
      case 7:
        return wizardData.domainType === 'subdomain' || (wizardData.domainType === 'custom' && !!wizardData.customDomain);
      case 8:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hotel Setup Wizard</CardTitle>
              <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStep()}
        </CardContent>

        <div className="border-t p-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleCompleteSetup}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Hotel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}