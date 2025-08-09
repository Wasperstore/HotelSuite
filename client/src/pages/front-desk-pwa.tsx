import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Wifi, 
  WifiOff, 
  UserPlus, 
  UserMinus, 
  QrCode, 
  Printer, 
  CreditCard,
  Key,
  Bell,
  Settings,
  Users,
  Bed,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Phone,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Room, Booking, User } from "@shared/schema";
import { useState, useEffect } from "react";
import React from "react";

const checkInSchema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email required"),
  guestPhone: z.string().min(10, "Valid phone number required"),
  roomId: z.string().min(1, "Room selection required"),
  numberOfGuests: z.number().min(1, "At least 1 guest required"),
  specialRequests: z.string().optional(),
});

const checkOutSchema = z.object({
  bookingId: z.string().min(1, "Booking selection required"),
  totalBill: z.number().min(0, "Valid bill amount required"),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "PAYSTACK"]),
});

type CheckInData = z.infer<typeof checkInSchema>;
type CheckOutData = z.infer<typeof checkOutSchema>;

export default function FrontDeskPWA() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const userHotel = user?.hotelId;

  // PWA offline capabilities
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync offline data when back online
      syncOfflineData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    setSyncPending(true);
    try {
      // Sync offline bookings, check-ins, check-outs
      const offlineData = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
      for (const booking of offlineData) {
        await apiRequest('POST', '/api/bookings', booking);
      }
      localStorage.removeItem('offlineBookings');
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "bookings"] });
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncPending(false);
    }
  };

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/hotels", userHotel, "rooms"],
    enabled: !!userHotel,
  });

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/hotels", userHotel, "bookings"],
    enabled: !!userHotel,
  });

  const checkInForm = useForm<CheckInData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      roomId: "",
      numberOfGuests: 1,
      specialRequests: "",
    }
  });

  const checkOutForm = useForm<CheckOutData>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      bookingId: "",
      totalBill: 0,
      paymentMethod: "CASH",
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: CheckInData) => {
      const bookingData = {
        ...data,
        hotelId: userHotel,
        checkinDate: new Date(),
        checkoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        status: 'confirmed',
        totalAmount: 0, // Calculate based on room price
      };

      if (isOffline) {
        // Store offline for sync later
        const offlineBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
        offlineBookings.push({ ...bookingData, id: Date.now().toString(), offline: true });
        localStorage.setItem('offlineBookings', JSON.stringify(offlineBookings));
        return bookingData;
      } else {
        const res = await apiRequest("POST", `/api/hotels/${userHotel}/bookings`, bookingData);
        return await res.json();
      }
    },
    onSuccess: () => {
      if (!isOffline) {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "bookings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "rooms"] });
      }
      setShowCheckIn(false);
      checkInForm.reset();
      toast({
        title: "Success",
        description: isOffline ? "Check-in saved offline. Will sync when online." : "Guest checked in successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (data: CheckOutData) => {
      const res = await apiRequest("PATCH", `/api/bookings/${data.bookingId}/checkout`, {
        totalBill: data.totalBill,
        paymentMethod: data.paymentMethod,
        checkoutDate: new Date(),
        status: 'completed',
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "rooms"] });
      setShowCheckOut(false);
      checkOutForm.reset();
      toast({
        title: "Success",
        description: "Guest checked out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCheckIn = (data: CheckInData) => {
    checkInMutation.mutate(data);
  };

  const onCheckOut = (data: CheckOutData) => {
    checkOutMutation.mutate(data);
  };

  const availableRooms = rooms?.filter(room => room.status === 'available') || [];
  const occupiedRooms = rooms?.filter(room => room.status === 'occupied') || [];
  const todayCheckIns = bookings?.filter(booking => 
    new Date(booking.checkinDate).toDateString() === new Date().toDateString() &&
    booking.status === 'confirmed'
  ) || [];
  const todayCheckOuts = bookings?.filter(booking => 
    new Date(booking.checkoutDate).toDateString() === new Date().toDateString() &&
    booking.status === 'confirmed'
  ) || [];

  if (!userHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have permission to access the Front Desk system.
            </p>
            <Button onClick={() => logoutMutation.mutate()} variant="outline">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Front Desk</h1>
              <p className="text-sm text-gray-500">Hotel Management System</p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Offline Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isOffline ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            
            {/* Sync Status */}
            {syncPending && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Syncing...</span>
              </div>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              {user?.fullName}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bed className="w-8 h-8 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600" data-testid="text-available-rooms">
                  {availableRooms.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Occupied Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-600" data-testid="text-occupied-rooms">
                  {occupiedRooms.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserPlus className="w-8 h-8 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-600" data-testid="text-checkins-today">
                  {todayCheckIns.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Check-outs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserMinus className="w-8 h-8 text-orange-600 mr-2" />
                <span className="text-2xl font-bold text-orange-600" data-testid="text-checkouts-today">
                  {todayCheckOuts.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
            <DialogTrigger asChild>
              <Button className="h-16 flex flex-col items-center space-y-2" data-testid="button-checkin">
                <UserPlus className="w-6 h-6" />
                <span>Check In</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Guest Check-in</DialogTitle>
              </DialogHeader>
              <Form {...checkInForm}>
                <form onSubmit={checkInForm.handleSubmit(onCheckIn)} className="space-y-4">
                  <FormField
                    control={checkInForm.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-guest-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkInForm.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-guest-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkInForm.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-guest-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkInForm.control}
                    name="roomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-room">
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms.map(room => (
                              <SelectItem key={room.id} value={room.id}>
                                Room {room.number} - {room.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={checkInMutation.isPending} 
                      className="flex-1"
                      data-testid="button-submit-checkin"
                    >
                      {checkInMutation.isPending ? "Processing..." : "Check In"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCheckIn(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCheckOut} onOpenChange={setShowCheckOut}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-2" data-testid="button-checkout">
                <UserMinus className="w-6 h-6" />
                <span>Check Out</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Guest Check-out</DialogTitle>
              </DialogHeader>
              <Form {...checkOutForm}>
                <form onSubmit={checkOutForm.handleSubmit(onCheckOut)} className="space-y-4">
                  <FormField
                    control={checkOutForm.control}
                    name="bookingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Booking</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-booking">
                              <SelectValue placeholder="Select booking to check out" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bookings?.filter(b => b.status === 'confirmed').map(booking => (
                              <SelectItem key={booking.id} value={booking.id}>
                                {booking.guestName} - Room {booking.roomId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkOutForm.control}
                    name="totalBill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Bill (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-total-bill" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkOutForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CARD">Card</SelectItem>
                            <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="PAYSTACK">Paystack</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={checkOutMutation.isPending} 
                      className="flex-1"
                      data-testid="button-submit-checkout"
                    >
                      {checkOutMutation.isPending ? "Processing..." : "Check Out"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCheckOut(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="h-16 flex flex-col items-center space-y-2" data-testid="button-qr-checkin">
            <QrCode className="w-6 h-6" />
            <span>QR Check-in</span>
          </Button>

          <Button variant="outline" className="h-16 flex flex-col items-center space-y-2" data-testid="button-print">
            <Printer className="w-6 h-6" />
            <span>Print Receipt</span>
          </Button>
        </div>

        {/* Room Status Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {rooms?.map((room) => (
                <div 
                  key={room.id} 
                  className={`p-3 rounded-lg border text-center ${
                    room.status === 'available' 
                      ? 'bg-green-50 border-green-200' 
                      : room.status === 'occupied'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                  data-testid={`room-status-${room.id}`}
                >
                  <div className="font-medium text-gray-900">Room {room.number}</div>
                  <div className="text-sm text-gray-600 capitalize">{room.type.toLowerCase()}</div>
                  <Badge 
                    variant={room.status === 'available' ? 'default' : 'secondary'} 
                    className="mt-1"
                  >
                    {room.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}