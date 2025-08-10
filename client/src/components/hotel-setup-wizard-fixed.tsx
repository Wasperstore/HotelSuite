import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  X, 
  Save,
  User,
  Crown,
  Building,
  Bed,
  Coffee,
  CreditCard,
  Globe,
  Heart,
  Upload,
  Settings
} from 'lucide-react';
import { HOTEL_TEMPLATES } from '@shared/hotel-templates';
import { useToast } from '@/hooks/use-toast';

interface HotelSetupWizardProps {
  onClose: () => void;
  onComplete: (data: WizardData) => void;
  unassignedOwners: any[];
}

interface WizardData {
  ownerType: 'existing' | 'new';
  ownerId: number | null;
  newOwner: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  };
  selectedTemplate: string | null;
  hotelInfo: {
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    currency: string;
    totalRooms: number;
  };
  roomTypes: RoomTypeData[];
  facilities: string[];
  services: string[];
  subscriptionPlan: string | null;
  billingCycle: string;
  domainType: 'subdomain' | 'custom';
  customDomain: string;
  sendWelcomeEmail: boolean;
}

interface RoomTypeData {
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 35000,
    roomLimit: 20,
    staffLimit: 10,
    features: ['Basic PMS', 'Mobile Check-in', 'Payment Processing', 'Basic Reports']
  },
  {
    id: 'professional',
    name: 'Professional', 
    price: 75000,
    roomLimit: 100,
    staffLimit: 50,
    features: ['Advanced PMS', 'WhatsApp Integration', 'OTA Sync', 'Advanced Analytics', 'Generator Tracking']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 120000,
    roomLimit: -1,
    staffLimit: -1,
    features: ['Full Suite', 'Custom Domain', 'Multi-location', 'API Access', 'Priority Support', 'Biometric Auth']
  }
];

export function HotelSetupWizard({ onClose, onComplete, unassignedOwners }: HotelSetupWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [isLoading, setIsLoading] = useState(false);
  
  const [wizardData, setWizardData] = useState<WizardData>({
    ownerType: 'existing',
    ownerId: null,
    newOwner: {
      fullName: '',
      email: '',
      username: '',
      password: ''
    },
    selectedTemplate: null,
    hotelInfo: {
      name: '',
      slug: '',
      address: '',
      city: '',
      country: 'Nigeria',
      phone: '',
      email: '',
      website: '',
      currency: 'NGN',
      totalRooms: 0
    },
    roomTypes: [],
    facilities: [],
    services: [],
    subscriptionPlan: 'professional',
    billingCycle: 'monthly',
    domainType: 'subdomain',
    customDomain: '',
    sendWelcomeEmail: true
  });

  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    try {
      await onComplete(wizardData);
      toast({
        title: "Hotel Created Successfully!",
        description: "The hotel has been set up and is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "There was an error creating the hotel. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hotel Owner</h3>
              <p className="text-gray-600">Select or create the hotel owner account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${wizardData.ownerType === 'existing' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, ownerType: 'existing' }))}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <User className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold">Existing Owner</h4>
                    <p className="text-sm text-gray-600">Select from unassigned owners</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${wizardData.ownerType === 'new' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, ownerType: 'new' }))}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <User className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold">New Owner</h4>
                    <p className="text-sm text-gray-600">Create a new owner account</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {wizardData.ownerType === 'existing' && (
              <div className="space-y-2">
                <Label>Select Owner</Label>
                <Select value={wizardData.ownerId?.toString()} onValueChange={(value) => setWizardData(prev => ({ ...prev, ownerId: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedOwners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id.toString()}>
                        {owner.fullName} ({owner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {wizardData.ownerType === 'new' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={wizardData.newOwner.fullName}
                      onChange={(e) => setWizardData(prev => ({ ...prev, newOwner: { ...prev.newOwner, fullName: e.target.value } }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={wizardData.newOwner.email}
                      onChange={(e) => setWizardData(prev => ({ ...prev, newOwner: { ...prev.newOwner, email: e.target.value } }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input
                      value={wizardData.newOwner.username}
                      onChange={(e) => setWizardData(prev => ({ ...prev, newOwner: { ...prev.newOwner, username: e.target.value } }))}
                      placeholder="johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={wizardData.newOwner.password}
                      onChange={(e) => setWizardData(prev => ({ ...prev, newOwner: { ...prev.newOwner, password: e.target.value } }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hotel Template</h3>
              <p className="text-gray-600">Choose a template to get started quickly</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOTEL_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${wizardData.selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setWizardData(prev => ({ ...prev, selectedTemplate: template.id }))}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <Badge variant="secondary" className="mb-2">
                      {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg border-dashed border-2 ${wizardData.selectedTemplate === 'custom' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
                onClick={() => setWizardData(prev => ({ ...prev, selectedTemplate: 'custom' }))}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Custom Setup</h4>
                    <p className="text-sm text-gray-600">Start from scratch</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hotel Details</h3>
              <p className="text-gray-600">Basic information about your hotel</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hotel Name *</Label>
                  <Input
                    value={wizardData.hotelInfo.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, name, slug } }));
                    }}
                    placeholder="Grand Paradise Resort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hotel Slug *</Label>
                  <Input
                    value={wizardData.hotelInfo.slug}
                    onChange={(e) => setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, slug: e.target.value } }))}
                    placeholder="grand-paradise-resort"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={wizardData.hotelInfo.address}
                  onChange={(e) => setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, address: e.target.value } }))}
                  placeholder="123 Paradise Street, Victoria Island"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={wizardData.hotelInfo.city}
                    onChange={(e) => setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, city: e.target.value } }))}
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select value={wizardData.hotelInfo.country} onValueChange={(value) => setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, country: value } }))}>
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
                  <Label>Total Rooms *</Label>
                  <Input
                    type="number"
                    value={wizardData.hotelInfo.totalRooms || ''}
                    onChange={(e) => setWizardData(prev => ({ ...prev, hotelInfo: { ...prev.hotelInfo, totalRooms: parseInt(e.target.value) || 0 } }))}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bed className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Room Configuration</h3>
              <p className="text-gray-600">Define your room types and pricing</p>
            </div>

            <div className="space-y-6">
              {wizardData.roomTypes.map((room, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Room Type #{index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Room Name *</Label>
                        <Input
                          value={room.name}
                          onChange={(e) => {
                            const newRoomTypes = [...wizardData.roomTypes];
                            newRoomTypes[index].name = e.target.value;
                            setWizardData(prev => ({ ...prev, roomTypes: newRoomTypes }));
                          }}
                          placeholder="Deluxe Suite"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacity *</Label>
                        <Input
                          type="number"
                          value={room.capacity}
                          onChange={(e) => {
                            const newRoomTypes = [...wizardData.roomTypes];
                            newRoomTypes[index].capacity = parseInt(e.target.value) || 1;
                            setWizardData(prev => ({ ...prev, roomTypes: newRoomTypes }));
                          }}
                          placeholder="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Base Price *</Label>
                        <Input
                          type="number"
                          value={room.basePrice}
                          onChange={(e) => {
                            const newRoomTypes = [...wizardData.roomTypes];
                            newRoomTypes[index].basePrice = parseFloat(e.target.value) || 0;
                            setWizardData(prev => ({ ...prev, roomTypes: newRoomTypes }));
                          }}
                          placeholder="25000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6">
                  <Button 
                    variant="outline" 
                    className="w-full h-16"
                    onClick={() => {
                      const newRoom: RoomTypeData = {
                        name: '',
                        capacity: 2,
                        basePrice: 0,
                        amenities: []
                      };
                      setWizardData(prev => ({ ...prev, roomTypes: [...prev.roomTypes, newRoom] }));
                    }}
                  >
                    <Building className="w-6 h-6 mr-2" />
                    Add Room Type
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Coffee className="w-12 h-12 text-brown-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Facilities & Services</h3>
              <p className="text-gray-600">Select what your hotel offers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Bar', 'Conference Hall', 'Business Center', 'Parking'].map((facility) => (
                      <label key={facility} className="flex items-center space-x-2 cursor-pointer">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['24/7 Concierge', 'Room Service', 'Laundry', 'Airport Transfer', 'Tour Services', 'Babysitting', 'Medical Services'].map((service) => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer">
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
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Subscription Plan</h3>
              <p className="text-gray-600">Choose the right plan for your hotel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${wizardData.subscriptionPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setWizardData(prev => ({ ...prev, subscriptionPlan: plan.id }))}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h4 className="font-bold text-xl mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-green-600 mb-4">
                        ₦{plan.price.toLocaleString()}
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-left">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {wizardData.subscriptionPlan === plan.id && (
                        <Badge className="w-full">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Domain Setup</h3>
              <p className="text-gray-600">Configure your hotel's web presence</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${wizardData.domainType === 'subdomain' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, domainType: 'subdomain' }))}
              >
                <CardContent className="p-4 text-center">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Subdomain</h4>
                  <p className="text-sm text-gray-600">Use LuxuryHotelSaaS subdomain</p>
                  <div className="bg-gray-100 p-2 rounded text-sm mt-2">
                    {wizardData.hotelInfo.slug || 'your-hotel'}.luxuryhotelsaas.com
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${wizardData.domainType === 'custom' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setWizardData(prev => ({ ...prev, domainType: 'custom' }))}
              >
                <CardContent className="p-4 text-center">
                  <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium">Custom Domain</h4>
                  <p className="text-sm text-gray-600">Use your own domain</p>
                </CardContent>
              </Card>
            </div>

            {wizardData.domainType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Domain</Label>
                <Input
                  value={wizardData.customDomain}
                  onChange={(e) => setWizardData(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="www.grandparadise.com"
                />
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
        return true;
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
                disabled={!canProceed() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Hotel...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Hotel
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}