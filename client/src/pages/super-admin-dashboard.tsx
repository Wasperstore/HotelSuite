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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, TrendingUp, Settings, Plus, Search, Filter, MoreHorizontal, Hotel as HotelIcon, BarChart3, UserPlus, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Hotel, User } from "@shared/schema";

const createHotelSchema = z.object({
  name: z.string().min(2, "Hotel name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  domain: z.string().optional(),
  ownerId: z.string().min(1, "Please select an owner"),
  status: z.enum(["active", "inactive", "pending"])
});

type CreateHotelData = z.infer<typeof createHotelSchema>;

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/super-admin", active: true },
  { icon: Building2, label: "Hotels", href: "/super-admin/hotels", active: false },
  { icon: Users, label: "Owners", href: "/super-admin/owners", active: false },
  { icon: Users, label: "Users", href: "/super-admin/users", active: false },
  { icon: Settings, label: "Settings", href: "/super-admin/settings", active: false }
];

export default function SuperAdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [createHotelOpen, setCreateHotelOpen] = useState(false);

  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/admin/hotels"],
    enabled: !!user
  });

  const createHotelMutation = useMutation({
    mutationFn: async (data: CreateHotelData) => {
      const res = await apiRequest("POST", "/api/admin/hotels", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });
      toast({
        title: "Hotel created successfully",
        description: "The hotel has been added to the platform.",
      });
      setCreateHotelOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create hotel",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<CreateHotelData>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: {
      name: "",
      slug: "",
      domain: "",
      ownerId: "",
      status: "active"
    }
  });

  const onCreateHotel = (data: CreateHotelData) => {
    createHotelMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "DEVELOPER_ADMIN") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Super Admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <HotelIcon className="text-white text-sm" />
            </div>
            <span className="font-semibold">Super Admin</span>
          </div>
          
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
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || "Admin"}</p>
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
                Platform Overview
              </h1>
              <p className="text-gray-600">Manage all hotels and users across the platform</p>
            </div>
            
            <Dialog open={createHotelOpen} onOpenChange={setCreateHotelOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-brand" data-testid="button-create-hotel">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hotel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Hotel</DialogTitle>
                  <DialogDescription>
                    Add a new hotel to the platform. Make sure to assign an owner.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateHotel)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-hotel-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="hotel-name-slug"
                              data-testid="input-hotel-slug"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Domain (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="hotel.com"
                              data-testid="input-hotel-domain"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-hotel-owner">
                                <SelectValue placeholder="Select owner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="temp-owner-1">John Smith (john@example.com)</SelectItem>
                              <SelectItem value="temp-owner-2">Sarah Johnson (sarah@example.com)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-hotel-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
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
                        onClick={() => setCreateHotelOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="gradient-brand"
                        disabled={createHotelMutation.isPending}
                        data-testid="button-create"
                      >
                        {createHotelMutation.isPending ? "Creating..." : "Create Hotel"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="stat-hotels">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {hotels?.length || 0}
                    </p>
                    <p className="text-sm text-success">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-text-primary">2,847</p>
                    <p className="text-sm text-success">+8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-text-primary">$24,890</p>
                    <p className="text-sm text-success">+15% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-brand-purple" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-bookings">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-text-primary">1,256</p>
                    <p className="text-sm text-success">+6% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-brand-red" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Hotels */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Hotel Registrations</CardTitle>
                  <CardDescription>
                    Latest hotels added to the platform
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hotelsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading hotels...</div>
              ) : hotels && hotels.length > 0 ? (
                <div className="space-y-4">
                  {hotels.slice(0, 5).map((hotel, index) => (
                    <div key={hotel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`hotel-${index}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
                          <Building className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{hotel.name}</p>
                          <p className="text-sm text-gray-600">{hotel.slug}.luxuryhotelsaas.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={hotel.status === 'active' ? 'default' : 'secondary'}
                          className={hotel.status === 'active' ? 'bg-success' : ''}
                        >
                          {hotel.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No hotels registered yet</p>
                  <Button 
                    onClick={() => setCreateHotelOpen(true)}
                    className="gradient-brand"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Hotel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}