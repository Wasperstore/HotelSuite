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
import { Building, Users, TrendingUp, Settings, Plus, Search, Filter, MoreHorizontal, Hotel as HotelIcon, BarChart3, UserPlus, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Hotel, User } from "@shared/schema";
import { useState } from "react";

const createOwnerSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
});

const createHotelSchema = z.object({
  name: z.string().min(2, "Hotel name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  ownerId: z.string().min(1, "Please select an owner"),
});

type CreateOwnerData = z.infer<typeof createOwnerSchema>;
type CreateHotelData = z.infer<typeof createHotelSchema>;

export default function SuperAdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [showCreateHotel, setShowCreateHotel] = useState(false);

  // Fetch hotels data
  const { data: hotels, isLoading: hotelsLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/admin/hotels"],
  });

  // Fetch users data  
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch unassigned owners
  const { data: unassignedOwners } = useQuery<User[]>({
    queryKey: ["/api/admin/unassigned-owners"],
  });

  const ownerForm = useForm<CreateOwnerData>({
    resolver: zodResolver(createOwnerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      username: "",
    }
  });

  const hotelForm = useForm<CreateHotelData>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: {
      name: "",
      slug: "",
      ownerId: "",
    }
  });

  const createOwnerMutation = useMutation({
    mutationFn: async (data: CreateOwnerData) => {
      const res = await apiRequest("POST", "/api/admin/hotel-owners", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unassigned-owners"] });
      setShowCreateOwner(false);
      ownerForm.reset();
      toast({
        title: "Success",
        description: "Hotel Owner created successfully",
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

  const createHotelMutation = useMutation({
    mutationFn: async (data: CreateHotelData) => {
      const res = await apiRequest("POST", "/api/admin/hotels", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unassigned-owners"] });
      setShowCreateHotel(false);
      hotelForm.reset();
      toast({
        title: "Success",
        description: "Hotel created successfully",
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

  const onCreateOwner = (data: CreateOwnerData) => {
    createOwnerMutation.mutate(data);
  };

  const onCreateHotel = (data: CreateHotelData) => {
    createHotelMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg flex items-center justify-center">
              <HotelIcon className="text-white text-sm" />
            </div>
            <span className="font-semibold">Super Admin</span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-2 p-2 rounded bg-gray-800 text-white">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Building className="w-4 h-4" />
              <span>Hotels</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800">
              <Users className="w-4 h-4" />
              <span>Users</span>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage hotels and users across the platform</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showCreateOwner} onOpenChange={setShowCreateOwner}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-owner">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Owner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Hotel Owner</DialogTitle>
                </DialogHeader>
                <Form {...ownerForm}>
                  <form onSubmit={ownerForm.handleSubmit(onCreateOwner)} className="space-y-4">
                    <FormField
                      control={ownerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-owner-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ownerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-owner-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ownerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-owner-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createOwnerMutation.isPending} data-testid="button-submit-owner">
                      {createOwnerMutation.isPending ? "Creating..." : "Create Owner"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateHotel} onOpenChange={setShowCreateHotel}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-hotel">
                  <Building2 className="w-4 h-4 mr-2" />
                  Create Hotel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Hotel</DialogTitle>
                </DialogHeader>
                <Form {...hotelForm}>
                  <form onSubmit={hotelForm.handleSubmit(onCreateHotel)} className="space-y-4">
                    <FormField
                      control={hotelForm.control}
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
                      control={hotelForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-hotel-slug" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelForm.control}
                      name="ownerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel Owner</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-hotel-owner">
                                <SelectValue placeholder="Select an unassigned owner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {unassignedOwners?.map((owner) => (
                                <SelectItem key={owner.id} value={owner.id}>
                                  {owner.fullName} ({owner.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createHotelMutation.isPending} data-testid="button-submit-hotel">
                      {createHotelMutation.isPending ? "Creating..." : "Create Hotel"}
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
              <CardTitle className="text-sm font-medium" data-testid="text-total-hotels">
                Total Hotels
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-hotels-count">
                {hotels?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid="text-total-users">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-users-count">
                {users?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid="text-unassigned-owners">
                Unassigned Owners
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-unassigned-count">
                {unassignedOwners?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Hotels
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotels?.filter(h => h.status === 'active')?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotels Table */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Hotels</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hotelsLoading ? (
              <div>Loading hotels...</div>
            ) : (
              <div className="space-y-2">
                {hotels?.map((hotel) => (
                  <div key={hotel.id} className="flex items-center justify-between p-3 border rounded" data-testid={`card-hotel-${hotel.id}`}>
                    <div>
                      <h3 className="font-medium" data-testid={`text-hotel-name-${hotel.id}`}>
                        {hotel.name}
                      </h3>
                      <p className="text-sm text-gray-500" data-testid={`text-hotel-slug-${hotel.id}`}>
                        {hotel.slug}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={hotel.status === 'active' ? 'default' : 'secondary'}>
                        {hotel.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!hotels || hotels.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No hotels found. Create your first hotel to get started.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}