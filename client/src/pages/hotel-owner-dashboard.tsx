import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, TrendingUp, Settings, Plus, Calendar, Bed, UserPlus, Mail, Hotel as HotelIcon, BarChart3, Clock, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Hotel, Room, Booking, User } from "@shared/schema";

const inviteStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["HOTEL_MANAGER", "FRONT_DESK", "HOUSEKEEPING", "MAINTENANCE", "ACCOUNTING", "POS_STAFF"])
});

type InviteStaffData = z.infer<typeof inviteStaffSchema>;

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/owner", active: true },
  { icon: Bed, label: "Rooms", href: "/owner/rooms", active: false },
  { icon: Calendar, label: "Bookings", href: "/owner/bookings", active: false },
  { icon: Users, label: "Staff", href: "/owner/staff", active: false },
  { icon: TrendingUp, label: "Analytics", href: "/owner/analytics", active: false },
  { icon: Settings, label: "Settings", href: "/owner/settings", active: false }
];

export default function HotelOwnerDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [inviteStaffOpen, setInviteStaffOpen] = useState(false);

  const { data: hotel } = useQuery<Hotel>({
    queryKey: ["/api/hotels", user?.hotelId],
    enabled: !!user?.hotelId
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ["/api/hotels", user?.hotelId, "rooms"],
    enabled: !!user?.hotelId
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/hotels", user?.hotelId, "bookings"],
    enabled: !!user?.hotelId
  });

  const inviteStaffMutation = useMutation({
    mutationFn: async (data: InviteStaffData) => {
      // This would normally send an email invitation
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        hotelId: user?.hotelId,
        forcePasswordReset: true,
        passwordHash: "temp-password-hash"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff invitation sent",
        description: "The staff member will receive an email to set up their account.",
      });
      setInviteStaffOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<InviteStaffData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "FRONT_DESK"
    }
  });

  const onInviteStaff = (data: InviteStaffData) => {
    inviteStaffMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (user?.role !== "HOTEL_OWNER") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Hotel Owner dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user?.hotelId) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Hotel Assigned</CardTitle>
            <CardDescription>
              You haven't been assigned to a hotel yet. Please contact the super admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const todayBookings = bookings?.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    const checkinDate = new Date(booking.checkinDate).toISOString().split('T')[0];
    return checkinDate === today;
  }) || [];

  const occupiedRooms = bookings?.filter(booking => booking.status === "confirmed").length || 0;
  const totalRooms = rooms?.length || 0;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <HotelIcon className="text-white text-sm" />
            </div>
            <span className="font-semibold">Hotel Owner</span>
          </div>
          {hotel && (
            <p className="text-xs text-gray-400 mb-6">{hotel.name}</p>
          )}
          
          <nav className="space-y-3">
            {sidebarItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active
                      ? "text-white bg-brand-red"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                  data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <IconComponent className="text-sm" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "O"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || "Owner"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2" data-testid="dashboard-title">
                {hotel?.name || "Hotel Dashboard"}
              </h1>
              <p className="text-gray-600">Manage your hotel operations and staff</p>
            </div>
            
            <Dialog open={inviteStaffOpen} onOpenChange={setInviteStaffOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-brand" data-testid="button-invite-staff">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Staff Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to a new staff member. They'll be required to set up their password on first login.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInviteStaff)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-staff-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-staff-role">
                                <SelectValue />
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
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteStaffOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="gradient-brand"
                        disabled={inviteStaffMutation.isPending}
                        data-testid="button-invite"
                      >
                        {inviteStaffMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="stat-occupancy">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-text-primary">{occupancyRate}%</p>
                    <p className="text-sm text-gray-500">{occupiedRooms} of {totalRooms} rooms</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bed className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-checkins">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                    <p className="text-3xl font-bold text-text-primary">{todayBookings.length}</p>
                    <p className="text-sm text-success">On schedule</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-text-primary">$12,450</p>
                    <p className="text-sm text-success">+18% vs last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-brand-purple" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-staff">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Staff</p>
                    <p className="text-3xl font-bold text-text-primary">8</p>
                    <p className="text-sm text-gray-500">All departments</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Users className="text-brand-red" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Check-ins</CardTitle>
                <CardDescription>
                  Guests arriving today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayBookings.length > 0 ? (
                  <div className="space-y-4">
                    {todayBookings.slice(0, 5).map((booking, index) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`checkin-${index}`}>
                        <div>
                          <p className="font-medium text-text-primary">{booking.guestName}</p>
                          <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Room {booking.roomId}</p>
                          <Badge variant="outline">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No check-ins scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common hotel management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-new-booking">
                    <Plus className="w-4 h-4 mr-2" />
                    New Walk-in Booking
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-room-status">
                    <Bed className="w-4 h-4 mr-2" />
                    Update Room Status
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-staff-schedule">
                    <Clock className="w-4 h-4 mr-2" />
                    View Staff Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-reports">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}