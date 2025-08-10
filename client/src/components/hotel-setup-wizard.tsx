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
import { HOTEL_TEMPLATES, getTemplateById } from "../../../shared/hotel-templates";
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
  Palette,
  Settings,
  Upload,
  Save,
  Copy,
  UserPlus
} from "lucide-react";

interface RoomTypeData {
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

interface WizardData {
  ownerId: string;
  newOwner: {
    fullName: string;
    email: string;
    username: string;
    phone: string;
    password: string;
  };
  ownerType: 'existing' | 'new';
  selectedTemplate: string;
  hotelInfo: {
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    totalRooms: number;
    currency: string;
    defaultLanguage: string;
    latitude?: number;
    longitude?: number;
    logoUrl?: string;
  };
  roomTypes: RoomTypeData[];
  facilities: string[];
  services: string[];
  subscriptionPlan: string;
  billingCycle: string;
  domainType: 'subdomain' | 'custom';
  customDomain: string;
  sendWelcomeEmail: boolean;
}

const iconMap = {
  Crown,
  Briefcase, 
  Heart,
  Palette
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Building;
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
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

  const updateWizardData = (step: keyof WizardData, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [step]: { ...(prev[step] as any), ...data }
    }));
  };

  // Save draft data to localStorage
  const saveDraft = () => {
    localStorage.setItem('hotel-setup-draft', JSON.stringify({
      data: wizardData,
      step: currentStep,
      timestamp: Date.now()
    }));
  };

  // Load draft data on component mount
  useEffect(() => {
    const draft = localStorage.getItem('hotel-setup-draft');
    if (draft) {
      try {
        const { data, step, timestamp } = JSON.parse(draft);
        // Only load if draft is less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setWizardData(data);
          setCurrentStep(step);
          toast({
            title: "Draft Restored",
            description: `Your hotel setup progress from ${new Date(timestamp).toLocaleString()} has been restored.`
          });
        } else {
          // Clean up old drafts
          localStorage.removeItem('hotel-setup-draft');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      saveDraft(); // Save progress after each step
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveDraft();
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setWizardData(prev => ({
        ...prev,
        selectedTemplate: template.id,
        roomTypes: template.roomTypes.map(room => ({
          name: room.name,
          capacity: room.capacity,
          basePrice: room.basePrice,
          amenities: room.amenities
        })),
        facilities: [...template.facilities],
        services: [...template.services],
        hotelInfo: {
          ...prev.hotelInfo,
          currency: template.defaultSettings.currency,
          defaultLanguage: template.defaultSettings.language,
          totalRooms: prev.hotelInfo.totalRooms || template.roomTypes.length * 5 // Estimate rooms per type
        },
        subscriptionPlan: prev.subscriptionPlan || template.recommendedPlan
      }));
    }
  };

  const handleCustomTemplateSelect = () => {
    setWizardData(prev => ({
      ...prev,
      selectedTemplate: 'custom',
      roomTypes: [],
      facilities: [],
      services: [],
      hotelInfo: {
        ...prev.hotelInfo,
        currency: 'NGN',
        defaultLanguage: 'en'
      },
      subscriptionPlan: prev.subscriptionPlan || 'starter'
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
    setIsLoading(true);
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

      // Get selected plan for staffLimit calculation
      const selectedPlan = subscriptionPlans.find(p => p.id === wizardData.subscriptionPlan);

      // Create hotel
      const hotelData = {
        name: wizardData.hotelInfo.name,
        slug: slug,
        address: wizardData.hotelInfo.address,
        phone: wizardData.hotelInfo.phone,
        email: wizardData.hotelInfo.email,
        totalRooms: wizardData.hotelInfo.totalRooms,
        maxStaff: selectedPlan?.staffLimit === -1 ? 100 : selectedPlan?.staffLimit || 50,
        description: `${wizardData.selectedTemplate ? getTemplateById(wizardData.selectedTemplate)?.description : 'Modern hotel'} located in ${wizardData.hotelInfo.city}, ${wizardData.hotelInfo.country}`,
        facilities: wizardData.facilities,
        services: wizardData.services,
        amenities: [], // Will be populated from facilities and services
        currency: wizardData.hotelInfo.currency,
        defaultLanguage: wizardData.hotelInfo.defaultLanguage,
        website: wizardData.hotelInfo.website,
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
        
        // Get selected plan for success message
        const selectedPlan = subscriptionPlans.find(p => p.id === wizardData.subscriptionPlan);
        
        toast({
          title: "🎉 Hotel Created Successfully!",
          description: `${wizardData.hotelInfo.name} is ready with ${selectedPlan?.name} plan (${wizardData.roomTypes.length} room types configured)`
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        
        // Clear draft after successful creation
        localStorage.removeItem('hotel-setup-draft');
        
        onClose();
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create hotel');
      }
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create hotel",
        variant: "destructive",
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search & Select Hotel Owner</Label>
                  <Select 
                    value={wizardData.ownerId} 
                    onValueChange={(value) => setWizardData(prev => ({ ...prev, ownerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Search and choose an existing owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedOwners.map((owner: any) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{owner.fullName}</span>
                            <span className="text-sm text-gray-500">{owner.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {wizardData.ownerId && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Selected Owner Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {(() => {
                        const selectedOwner = unassignedOwners.find((o: any) => o.id === wizardData.ownerId);
                        return selectedOwner ? (
                          <div className="space-y-1 text-sm">
                            <div><strong>Name:</strong> {selectedOwner.fullName}</div>
                            <div><strong>Email:</strong> {selectedOwner.email}</div>
                            <div><strong>Username:</strong> {selectedOwner.username}</div>
                            <div><strong>Account Created:</strong> {new Date(selectedOwner.createdAt).toLocaleDateString()}</div>
                            <div><strong>Status:</strong> <Badge variant="secondary">Available for Hotel Assignment</Badge></div>
                          </div>
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>
                )}
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
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Choose Hotel Template</h3>
              <p className="text-gray-600">Select a template to get started quickly or customize from scratch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOTEL_TEMPLATES.map((template) => {
                const IconComponent = getIconComponent(template.icon);
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${wizardData.selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <IconComponent className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        <Badge variant="secondary" className="mb-2">
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>{template.roomTypes.length} Room Types</div>
                          <div>{template.facilities.length} Facilities</div>
                          <div>₦{template.roomTypes[0]?.basePrice.toLocaleString()}/night starting</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg border-dashed border-2 ${wizardData.selectedTemplate === 'custom' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
                onClick={handleCustomTemplateSelect}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Custom Setup</h4>
                    <p className="text-sm text-gray-600 mb-4">Start from scratch and configure everything manually</p>
                    <Badge variant="outline" className="mb-2">
                      Flexible
                    </Badge>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>Full control over configuration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {wizardData.selectedTemplate && wizardData.selectedTemplate !== 'custom' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const template = getTemplateById(wizardData.selectedTemplate);
                    return template ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Room Types</h5>
                          <div className="space-y-2">
                            {template.roomTypes.map((room, index) => (
                              <div key={index} className="p-2 bg-white rounded border">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{room.name}</span>
                                  <span className="text-sm text-green-600">₦{room.basePrice.toLocaleString()}/night</span>
                                </div>
                                <p className="text-xs text-gray-600">Capacity: {room.capacity} guests</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Included Features</h5>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Facilities:</p>
                              <p className="text-sm text-gray-600">{template.facilities.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Services:</p>
                              <p className="text-sm text-gray-600">{template.services.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Recommended Plan:</p>
                              <Badge variant="secondary">{subscriptionPlans.find(p => p.id === template.recommendedPlan)?.name || 'Professional'}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
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
                      const slug = name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      updateWizardData('hotelInfo', { name, slug });
                    }}
                    placeholder="Grand Paradise Resort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hotel Slug *</Label>
                  <Input
                    value={wizardData.hotelInfo.slug}
                    onChange={(e) => updateWizardData('hotelInfo', { slug: e.target.value })}
                    placeholder="grand-paradise-resort"
                  />
                  <p className="text-xs text-gray-500">
                    Your hotel will be accessible at: {wizardData.hotelInfo.slug}.luxuryhotelsaas.com
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={wizardData.hotelInfo.address}
                  onChange={(e) => updateWizardData('hotelInfo', { address: e.target.value })}
                  placeholder="123 Paradise Street, Victoria Island"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={wizardData.hotelInfo.city}
                    onChange={(e) => updateWizardData('hotelInfo', { city: e.target.value })}
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
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
                      <SelectItem value="Egypt">Egypt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Rooms *</Label>
                  <Input
                    type="number"
                    value={wizardData.hotelInfo.totalRooms || ''}
                    onChange={(e) => updateWizardData('hotelInfo', { totalRooms: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={wizardData.hotelInfo.phone}
                    onChange={(e) => updateWizardData('hotelInfo', { phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={wizardData.hotelInfo.email}
                    onChange={(e) => updateWizardData('hotelInfo', { email: e.target.value })}
                    placeholder="info@grandparadise.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={wizardData.hotelInfo.website}
                    onChange={(e) => updateWizardData('hotelInfo', { website: e.target.value })}
                    placeholder="https://www.grandparadise.com"
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
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="GHS">Ghanaian Cedi (₵)</SelectItem>
                      <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hotel Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop your logo here, or click to browse</p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
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
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Room Type #{index + 1}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newRoomTypes = wizardData.roomTypes.filter((_, i) => i !== index);
                          setWizardData(prev => ({ ...prev, roomTypes: newRoomTypes }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
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
                        <Label>Capacity (Guests) *</Label>
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
                        <Label>Base Price ({wizardData.hotelInfo.currency}) *</Label>
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
                    <div className="mt-4 space-y-2">
                      <Label>Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Ocean View', 'Room Service', 'Safe', 'Hair Dryer', 'Bathtub'].map((amenity) => (
                          <Button
                            key={amenity}
                            variant={room.amenities.includes(amenity) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newRoomTypes = [...wizardData.roomTypes];
                              if (newRoomTypes[index].amenities.includes(amenity)) {
                                newRoomTypes[index].amenities = newRoomTypes[index].amenities.filter(a => a !== amenity);
                              } else {
                                newRoomTypes[index].amenities.push(amenity);
                              }
                              setWizardData(prev => ({ ...prev, roomTypes: newRoomTypes }));
                            }}
                          >
                            {amenity}
                          </Button>
                        ))}
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
              
              <div className="col-span-2 space-y-2">
                <Label>Hotel Logo (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload hotel logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>GPS Latitude (Optional)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="6.5244"
                  onChange={(e) => updateWizardData('hotelInfo', { latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>GPS Longitude (Optional)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="3.3792"
                  onChange={(e) => updateWizardData('hotelInfo', { longitude: parseFloat(e.target.value) })}
                />
              </div>
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
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Bar', 'Conference Hall',
                      'Business Center', 'Parking', 'Garden', 'Rooftop Terrace', 'Kids Play Area',
                      'Library', 'Gift Shop', 'ATM', 'Currency Exchange', 'Car Rental'
                    ].map((facility) => (
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
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      '24/7 Concierge', 'Room Service', 'Laundry', 'Airport Transfer', 'Tour Services',
                      'Babysitting', 'Medical Services', 'Luggage Storage', 'Wake-up Service',
                      'Newspaper Delivery', 'Shoe Shine', 'Butler Service', 'Personal Shopping',
                      'Event Planning', 'Photography', 'Translation Services'
                    ].map((service) => (
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
                    getTemplateById(wizardData.selectedTemplate)?.name || 'None'}</div>
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
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-xs text-gray-500">
                <Save className="w-3 h-3 mr-1" />
                Auto-saving progress
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
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