import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Building, 
  Bed, 
  Utensils,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  Sparkles,
  Coffee,
  Shield
} from "lucide-react";
import type { Hotel } from "@shared/schema";

interface ComprehensiveHotelEditorProps {
  hotel: Hotel;
  onClose: () => void;
}

interface RoomType {
  id?: string;
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

interface Facility {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
}

interface Service {
  id: string;
  name: string;
  enabled: boolean;
  price?: number;
}

export default function ComprehensiveHotelEditor({ hotel, onClose }: ComprehensiveHotelEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: hotel.name,
    slug: hotel.slug,
    address: hotel.address || "",
    phone: hotel.phone || "",
    email: hotel.email || "",
    website: hotel.website || "",
    description: hotel.description || "",
    currency: hotel.currency || "NGN",
    defaultLanguage: hotel.defaultLanguage || "en",
    totalRooms: hotel.totalRooms,
    maxStaff: hotel.maxStaff || 10,
  });

  // Room Types State
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { name: "Standard Room", capacity: 2, basePrice: 25000, amenities: ["wifi", "ac", "tv"] },
    { name: "Deluxe Suite", capacity: 4, basePrice: 45000, amenities: ["wifi", "ac", "tv", "minibar", "balcony"] },
    { name: "Executive Suite", capacity: 6, basePrice: 75000, amenities: ["wifi", "ac", "tv", "minibar", "balcony", "workspace"] },
  ]);

  // Facilities State
  const [facilities, setFacilities] = useState<Facility[]>([
    { id: "restaurant", name: "Restaurant", icon: Utensils, enabled: true },
    { id: "parking", name: "Parking", icon: Car, enabled: true },
    { id: "wifi", name: "Free WiFi", icon: Wifi, enabled: true },
    { id: "gym", name: "Fitness Center", icon: Dumbbell, enabled: false },
    { id: "pool", name: "Swimming Pool", icon: Waves, enabled: false },
    { id: "spa", name: "Spa & Wellness", icon: Sparkles, enabled: false },
    { id: "bar", name: "Bar & Lounge", icon: Coffee, enabled: false },
    { id: "security", name: "24/7 Security", icon: Shield, enabled: true },
  ]);

  // Services State
  const [services, setServices] = useState<Service[]>([
    { id: "roomservice", name: "24/7 Room Service", enabled: true, price: 2000 },
    { id: "laundry", name: "Laundry Service", enabled: true, price: 1500 },
    { id: "airport", name: "Airport Transfer", enabled: false, price: 5000 },
    { id: "concierge", name: "Concierge Service", enabled: false },
    { id: "housekeeping", name: "Daily Housekeeping", enabled: true },
    { id: "breakfast", name: "Continental Breakfast", enabled: false, price: 3000 },
  ]);

  const updateHotelMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/hotels/${hotel.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Hotel Updated",
        description: "Hotel information has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData = {
      ...basicInfo,
      roomTypes: roomTypes,
      facilities: facilities.filter(f => f.enabled).map(f => ({ id: f.id, name: f.name })),
      services: services.filter(s => s.enabled).map(s => ({ id: s.id, name: s.name, price: s.price })),
    };
    
    updateHotelMutation.mutate(updateData);
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { name: "", capacity: 2, basePrice: 20000, amenities: [] }]);
  };

  const updateRoomType = (index: number, field: string, value: any) => {
    const updated = [...roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setRoomTypes(updated);
  };

  const removeRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index));
  };

  const toggleFacility = (facilityId: string) => {
    setFacilities(facilities.map(f => 
      f.id === facilityId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const toggleService = (serviceId: string) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const updateServicePrice = (serviceId: string, price: number) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, price } : s
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Edit Hotel: {hotel.name}</h2>
              <p className="text-sm text-gray-600">Comprehensive hotel management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSave}
              disabled={updateHotelMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-save-hotel"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateHotelMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={onClose} data-testid="button-close-editor">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger value="basic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="rooms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Room Types
              </TabsTrigger>
              <TabsTrigger value="facilities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Facilities
              </TabsTrigger>
              <TabsTrigger value="services" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name *</Label>
                  <Input
                    id="hotelName"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                    required
                    data-testid="input-hotel-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelSlug">Hotel Slug *</Label>
                  <Input
                    id="hotelSlug"
                    value={basicInfo.slug}
                    onChange={(e) => setBasicInfo({...basicInfo, slug: e.target.value})}
                    required
                    data-testid="input-hotel-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelAddress">Address</Label>
                  <Input
                    id="hotelAddress"
                    value={basicInfo.address}
                    onChange={(e) => setBasicInfo({...basicInfo, address: e.target.value})}
                    data-testid="input-hotel-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelPhone">Phone</Label>
                  <Input
                    id="hotelPhone"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                    data-testid="input-hotel-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelEmail">Email</Label>
                  <Input
                    id="hotelEmail"
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                    data-testid="input-hotel-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelWebsite">Website</Label>
                  <Input
                    id="hotelWebsite"
                    value={basicInfo.website}
                    onChange={(e) => setBasicInfo({...basicInfo, website: e.target.value})}
                    data-testid="input-hotel-website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={basicInfo.currency} onValueChange={(value) => setBasicInfo({...basicInfo, currency: value})}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select value={basicInfo.defaultLanguage} onValueChange={(value) => setBasicInfo({...basicInfo, defaultLanguage: value})}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRooms">Total Rooms *</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    value={basicInfo.totalRooms || 0}
                    onChange={(e) => setBasicInfo({...basicInfo, totalRooms: parseInt(e.target.value)})}
                    required
                    data-testid="input-total-rooms"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStaff">Maximum Staff</Label>
                  <Input
                    id="maxStaff"
                    type="number"
                    value={basicInfo.maxStaff}
                    onChange={(e) => setBasicInfo({...basicInfo, maxStaff: parseInt(e.target.value)})}
                    data-testid="input-max-staff"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Room Types</h3>
                <Button onClick={addRoomType} data-testid="button-add-room-type">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room Type
                </Button>
              </div>
              
              <div className="space-y-4">
                {roomTypes.map((roomType, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Room Name</Label>
                        <Input
                          value={roomType.name}
                          onChange={(e) => updateRoomType(index, "name", e.target.value)}
                          placeholder="e.g., Deluxe Suite"
                          data-testid={`input-room-name-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input
                          type="number"
                          value={roomType.capacity}
                          onChange={(e) => updateRoomType(index, "capacity", parseInt(e.target.value))}
                          min="1"
                          data-testid={`input-room-capacity-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Base Price (₦)</Label>
                        <Input
                          type="number"
                          value={roomType.basePrice}
                          onChange={(e) => updateRoomType(index, "basePrice", parseInt(e.target.value))}
                          min="0"
                          data-testid={`input-room-price-${index}`}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRoomType(index)}
                        data-testid={`button-remove-room-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="facilities" className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Hotel Facilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((facility) => {
                  const IconComponent = facility.icon;
                  return (
                    <Card key={facility.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${facility.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <IconComponent className={`w-5 h-5 ${facility.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>
                          <span className="font-medium">{facility.name}</span>
                        </div>
                        <Switch
                          checked={facility.enabled}
                          onCheckedChange={() => toggleFacility(facility.id)}
                          data-testid={`switch-facility-${facility.id}`}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="services" className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Hotel Services</h3>
              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={() => toggleService(service.id)}
                            data-testid={`switch-service-${service.id}`}
                          />
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </div>
                      {service.price !== undefined && service.enabled && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Price (₦):</Label>
                          <Input
                            type="number"
                            value={service.price || 0}
                            onChange={(e) => updateServicePrice(service.id, parseInt(e.target.value))}
                            className="w-24"
                            min="0"
                            data-testid={`input-service-price-${service.id}`}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}