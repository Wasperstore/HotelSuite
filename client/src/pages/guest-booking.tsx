import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Hotel as HotelIcon, 
  Calendar, 
  Users, 
  Bed, 
  Phone, 
  Globe,
  QrCode,
  MessageCircle,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Tv,
  Wind,
  CheckCircle,
  CreditCard,
  User,
  Mail
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Hotel, Room } from "@shared/schema";

const bookingSchema = z.object({
  guestName: z.string().min(2, "Full name is required"),
  guestEmail: z.string().email("Valid email required"),
  guestPhone: z.string().min(10, "Valid phone number required"),
  checkinDate: z.string().min(1, "Check-in date required"),
  checkoutDate: z.string().min(1, "Check-out date required"),
  numberOfGuests: z.number().min(1, "At least 1 guest required"),
  roomId: z.string().min(1, "Room selection required"),
  specialRequests: z.string().optional(),
});

type BookingData = z.infer<typeof bookingSchema>;

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  restaurant: Utensils,
  tv: Tv,
  ac: Wind,
} as const;

export default function GuestBooking() {
  const { hotelSlug } = useParams();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Fetch hotel data by slug
  const { data: hotel, isLoading: hotelLoading } = useQuery<Hotel>({
    queryKey: ["/api/public/hotels", hotelSlug],
  });

  // Fetch available rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/public/hotels", hotelSlug, "rooms"],
    enabled: !!hotelSlug,
  });

  const bookingForm = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      checkinDate: "",
      checkoutDate: "",
      numberOfGuests: 1,
      roomId: "",
      specialRequests: "",
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      const bookingData = {
        ...data,
        hotelId: hotel?.id,
        checkinDate: new Date(data.checkinDate),
        checkoutDate: new Date(data.checkoutDate),
        totalAmount: selectedRoom?.price || 0,
        status: 'confirmed',
      };

      const res = await apiRequest("POST", `/api/public/hotels/${hotelSlug}/bookings`, bookingData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/hotels", hotelSlug, "rooms"] });
      setShowBookingForm(false);
      bookingForm.reset();
      toast({
        title: "Booking Confirmed!",
        description: "Your reservation has been successfully created. You'll receive a confirmation email shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitBooking = (data: BookingData) => {
    if (!selectedRoom) return;
    bookingMutation.mutate({ ...data, roomId: selectedRoom.id });
  };

  const calculateNights = (checkin: string, checkout: string) => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const checkinDate = bookingForm.watch("checkinDate");
  const checkoutDate = bookingForm.watch("checkoutDate");
  const numberOfNights = calculateNights(checkinDate, checkoutDate);
  const totalCost = selectedRoom && numberOfNights > 0 ? Number(selectedRoom.price) * numberOfNights : 0;

  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel information...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Hotel Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The hotel "{hotelSlug}" was not found or may not be active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableRooms = rooms?.filter(room => room.status === 'available') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HotelIcon className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-hotel-name">
                  {hotel.name}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  Luxury Hotel Experience
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {availableRooms.length} Available Rooms
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Book Your Stay</h2>
            <p className="text-xl opacity-90">Experience luxury and comfort in the heart of Africa</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Selection */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h3>
          {roomsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <Card 
                  key={room.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRoom?.id === room.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                  data-testid={`room-card-${room.id}`}
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                    <div className="absolute inset-0 bg-black opacity-20 rounded-t-lg"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="text-xl font-bold">Room {room.number}</h4>
                      <Badge variant="secondary" className="mt-1">
                        {room.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500">
                        Available
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-600 mb-2">
                          Up to {room.capacity || 2} guests
                        </p>
                        <div className="flex items-center space-x-3">
                          {room.amenities?.slice(0, 3).map((amenity, index) => {
                            const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Wifi;
                            return (
                              <div key={index} className="text-gray-500" title={amenity}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{Number(room.price).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>
                    {room.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                    <Button 
                      className="w-full" 
                      variant={selectedRoom?.id === room.id ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(room);
                        setShowBookingForm(true);
                      }}
                      data-testid={`button-select-room-${room.id}`}
                    >
                      {selectedRoom?.id === room.id ? "Selected" : "Select Room"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {availableRooms.length === 0 && !roomsLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Available Rooms</h3>
                <p className="text-gray-600">
                  All rooms are currently booked. Please try different dates or contact us directly.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Hotel
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form Dialog */}
        <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Complete Your Booking</DialogTitle>
            </DialogHeader>
            
            {selectedRoom && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">Room {selectedRoom.number}</h4>
                    <p className="text-gray-600 capitalize">{selectedRoom.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ₦{Number(selectedRoom.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                </div>
              </div>
            )}

            <Form {...bookingForm}>
              <form onSubmit={bookingForm.handleSubmit(onSubmitBooking)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={bookingForm.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-guest-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bookingForm.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-guest-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bookingForm.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-guest-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={bookingForm.control}
                    name="checkinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-in Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            min={new Date().toISOString().split('T')[0]}
                            data-testid="input-checkin-date" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bookingForm.control}
                    name="checkoutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-out Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            min={checkinDate || new Date().toISOString().split('T')[0]}
                            data-testid="input-checkout-date" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bookingForm.control}
                  name="numberOfGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Number of Guests
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-guests">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(selectedRoom?.capacity || 4)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any special requirements or requests..."
                          data-testid="textarea-special-requests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Booking Summary */}
                {numberOfNights > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Room rate per night:</span>
                        <span>₦{selectedRoom ? Number(selectedRoom.price).toLocaleString() : '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of nights:</span>
                        <span>{numberOfNights}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">₦{totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={bookingMutation.isPending || numberOfNights === 0} 
                    className="flex-1"
                    data-testid="button-submit-booking"
                  >
                    {bookingMutation.isPending ? "Processing..." : `Confirm Booking - ₦${totalCost.toLocaleString()}`}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowBookingForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}