import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building, 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Hotel as HotelIcon, 
  BarChart3, 
  UserPlus, 
  Building2,
  Bed,
  DollarSign,
  Clock,
  Fuel,
  Wifi,
  WifiOff,
  QrCode,
  MessageSquare
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Hotel, Room, Booking, GeneratorLog, User } from "@shared/schema";
import HotelLogo, { DashboardHeader } from "@/components/ui/hotel-logo";
import PasswordResetModal from "@/components/password-reset-modal";

const createRoomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  type: z.enum(["STANDARD", "DELUXE", "SUITE", "PRESIDENTIAL"]),
  price: z.number().min(0, "Price must be positive"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  amenities: z.string().optional(),
});

const createStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["HOTEL_MANAGER", "FRONT_DESK", "HOUSEKEEPING", "MAINTENANCE", "ACCOUNTING", "POS_STAFF"]),
  pinCode: z.string().length(4, "PIN must be 4 digits").regex(/^\d+$/, "PIN must contain only numbers"),
});

type CreateRoomData = z.infer<typeof createRoomSchema>;
type CreateStaffData = z.infer<typeof createStaffSchema>;

export default function HotelOwnerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Check if user needs to reset password on first login
  useEffect(() => {
    if (user?.forcePasswordReset) {
      setShowPasswordReset(true);
    }
  }, [user]);
  const { toast } = useToast();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check if user has assigned hotel
  const userHotel = user?.hotelId;

  // Fetch hotel data
  const { data: hotel, isLoading: hotelLoading } = useQuery<Hotel>({
    queryKey: ["/api/hotels", userHotel],
    enabled: !!userHotel,
  });

  // Fetch rooms for this hotel
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/hotels", userHotel, "rooms"],
    enabled: !!userHotel,
  });

  // Fetch bookings for this hotel
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/hotels", userHotel, "bookings"],
    enabled: !!userHotel,
  });

  // Fetch generator logs
  const { data: generatorLogs, isLoading: generatorLoading } = useQuery<GeneratorLog[]>({
    queryKey: ["/api/hotels", userHotel, "generator-logs"],
    enabled: !!userHotel,
  });

  // Fetch hotel staff
  const { data: staff, isLoading: staffLoading } = useQuery<User[]>({
    queryKey: ["/api/hotels", userHotel, "staff"],
    enabled: !!userHotel,
  });

  const roomForm = useForm<CreateRoomData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      number: "",
      type: "STANDARD",
      price: 0,
      capacity: 1,
      amenities: "",
    }
  });

  const staffForm = useForm<CreateStaffData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "FRONT_DESK",
      pinCode: "",
    }
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: CreateRoomData) => {
      const res = await apiRequest("POST", `/api/hotels/${userHotel}/rooms`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "rooms"] });
      setShowCreateRoom(false);
      roomForm.reset();
      toast({
        title: "Success",
        description: "Room created successfully",
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

  const createStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffData) => {
      const res = await apiRequest("POST", `/api/hotels/${userHotel}/staff`, {
        ...data,
        hotelId: userHotel,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "staff"] });
      setShowCreateStaff(false);
      staffForm.reset();
      toast({
        title: "Success",
        description: "Staff member created successfully",
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

  const onCreateRoom = (data: CreateRoomData) => {
    createRoomMutation.mutate(data);
  };

  const onCreateStaff = (data: CreateStaffData) => {
    createStaffMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!userHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">No Hotel Assigned</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You haven't been assigned to a hotel yet. Please contact your system administrator.
            </p>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const occupiedRooms = rooms?.filter(room => room.status === 'occupied').length || 0;
  const totalRooms = rooms?.length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const todayBookings = bookings?.filter(booking => 
    new Date(booking.checkinDate).toDateString() === new Date().toDateString()
  ).length || 0;

  const monthlyRevenue = bookings?.reduce((total, booking) => {
    const bookingMonth = booking.createdAt ? new Date(booking.createdAt).getMonth() : new Date().getMonth();
    const currentMonth = new Date().getMonth();
    return bookingMonth === currentMonth ? total + (booking.totalAmount || 0) : total;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <HotelLogo hotel={hotel} size="sm" />
            <div>
              <span className="font-semibold block">{hotel?.name}</span>
              <span className="text-xs text-gray-400">Hotel Owner</span>
            </div>
          </div>
          
          {/* Offline Status Indicator */}
          <div className={`flex items-center space-x-2 p-2 rounded mb-4 ${
            isOffline ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="text-sm">
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-2 p-2 rounded bg-gray-800 text-white">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Bed className="w-4 h-4" />
              <span>Rooms</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Calendar className="w-4 h-4" />
              <span>Bookings</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Users className="w-4 h-4" />
              <span>Staff</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Fuel className="w-4 h-4" />
              <span>Generator</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <QrCode className="w-4 h-4" />
              <span>QR Features</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2 p-2 text-sm">
            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
            <span className="text-gray-300">{user?.fullName}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full text-gray-300 hover:text-white mt-2"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <DashboardHeader 
            hotel={hotel} 
            title="Hotel Dashboard"
            subtitle={currentDate}
            editable={true}
          />
          <div className="flex space-x-2">
            <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-room">
                  <Bed className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <Form {...roomForm}>
                  <form onSubmit={roomForm.handleSubmit(onCreateRoom)} className="space-y-4">
                    <FormField
                      control={roomForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-room-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roomForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-room-type">
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="DELUXE">Deluxe</SelectItem>
                              <SelectItem value="SUITE">Suite</SelectItem>
                              <SelectItem value="PRESIDENTIAL">Presidential</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roomForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Night (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-room-price" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roomForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity (Guests)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                              data-testid="input-room-capacity" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createRoomMutation.isPending} data-testid="button-submit-room">
                      {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateStaff} onOpenChange={setShowCreateStaff}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-create-staff">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Staff Member</DialogTitle>
                </DialogHeader>
                <Form {...staffForm}>
                  <form onSubmit={staffForm.handleSubmit(onCreateStaff)} className="space-y-4">
                    <FormField
                      control={staffForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-staff-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={staffForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-staff-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={staffForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-staff-role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HOTEL_MANAGER">Hotel Manager</SelectItem>
                              <SelectItem value="FRONT_DESK">Front Desk</SelectItem>
                              <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="ACCOUNTING">Accounting</SelectItem>
                              <SelectItem value="POS_STAFF">POS Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={staffForm.control}
                      name="pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4-Digit PIN Code</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              maxLength={4}
                              placeholder="1234"
                              data-testid="input-staff-pin" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createStaffMutation.isPending} data-testid="button-submit-staff">
                      {createStaffMutation.isPending ? "Creating..." : "Create Staff"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid="text-occupancy-rate">
                Occupancy Rate
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-occupancy-percent">
                {occupancyRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {occupiedRooms} of {totalRooms} rooms occupied
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid="text-todays-checkins">
                Today's Check-ins
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-checkins-count">
                {todayBookings}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid="text-monthly-revenue">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-revenue-amount">
                ₦{monthlyRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Staff Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staff?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div>Loading bookings...</div>
            ) : (
              <div className="space-y-2">
                {bookings?.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded" data-testid={`card-booking-${booking.id}`}>
                    <div>
                      <h3 className="font-medium" data-testid={`text-guest-name-${booking.id}`}>
                        {booking.guestName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Room {booking.roomId} • {new Date(booking.checkinDate).toLocaleDateString()} - {new Date(booking.checkoutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <span className="font-medium">₦{(booking.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found. Your first guest booking will appear here.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">QR Check-in</h3>
                <p className="text-sm text-gray-500">Generate QR codes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">WhatsApp</h3>
                <p className="text-sm text-gray-500">Send messages</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Fuel className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Generator</h3>
                <p className="text-sm text-gray-500">Track fuel usage</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-gray-500">View reports</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && user && (
        <PasswordResetModal
          user={user}
          onComplete={() => setShowPasswordReset(false)}
        />
      )}
    </div>
  );
}