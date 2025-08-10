import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Room } from "@shared/schema";
import HotelLogo, { DashboardHeader } from "@/components/ui/hotel-logo";
import { 
  Bed, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  User,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function HousekeepingDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const userHotel = user?.hotelId;

  // Fetch rooms for housekeeping
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/hotels", userHotel, "rooms"],
    enabled: !!userHotel,
  });

  const updateRoomStatusMutation = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/rooms/${roomId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "rooms"] });
      toast({
        title: "Success",
        description: "Room status updated successfully",
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

  const roomsToClean = rooms?.filter(room => 
    room.status === 'dirty' || room.status === 'cleaning'
  ) || [];
  
  const cleanRooms = rooms?.filter(room => room.status === 'available') || [];
  const maintenanceRooms = rooms?.filter(room => room.status === 'maintenance') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'dirty': return 'bg-red-100 text-red-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'dirty': return AlertCircle;
      case 'cleaning': return Clock;
      default: return Bed;
    }
  };

  if (!userHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have permission to access the Housekeeping dashboard.
            </p>
            <Button onClick={() => logoutMutation.mutate()} variant="outline" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Housekeeping Dashboard</h1>
              <p className="text-sm text-gray-500">Room cleaning and maintenance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.fullName}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  data-testid="button-settings-menu"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Cleaning Preferences
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Task Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout"
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rooms to Clean</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600 mr-2" />
                <span className="text-2xl font-bold text-red-600" data-testid="text-rooms-to-clean">
                  {roomsToClean.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Clean Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600" data-testid="text-clean-rooms">
                  {cleanRooms.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bed className="w-8 h-8 text-gray-600 mr-2" />
                <span className="text-2xl font-bold text-gray-600" data-testid="text-maintenance-rooms">
                  {maintenanceRooms.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bed className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-600" data-testid="text-total-rooms">
                  {rooms?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Cleaning List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Priority Cleaning Required</CardTitle>
          </CardHeader>
          <CardContent>
            {roomsToClean.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p>All rooms are clean! Great job!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomsToClean.map((room) => {
                  const StatusIcon = getStatusIcon(room.status);
                  return (
                    <Card 
                      key={room.id} 
                      className="border-l-4 border-l-red-500"
                      data-testid={`room-card-${room.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-5 h-5 text-red-600" />
                            <span className="font-medium">Room {room.number}</span>
                          </div>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 capitalize">
                          {room.type.replace('_', ' ')}
                        </p>
                        <div className="flex space-x-2">
                          {room.status === 'dirty' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateRoomStatusMutation.mutate({ 
                                roomId: room.id, 
                                status: 'cleaning' 
                              })}
                              disabled={updateRoomStatusMutation.isPending}
                              data-testid={`button-start-cleaning-${room.id}`}
                            >
                              Start Cleaning
                            </Button>
                          )}
                          {room.status === 'cleaning' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateRoomStatusMutation.mutate({ 
                                roomId: room.id, 
                                status: 'available' 
                              })}
                              disabled={updateRoomStatusMutation.isPending}
                              data-testid={`button-finish-cleaning-${room.id}`}
                            >
                              Mark Clean
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateRoomStatusMutation.mutate({ 
                              roomId: room.id, 
                              status: 'maintenance' 
                            })}
                            disabled={updateRoomStatusMutation.isPending}
                            data-testid={`button-report-maintenance-${room.id}`}
                          >
                            Report Issue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Rooms Overview */}
        <Card>
          <CardHeader>
            <CardTitle>All Rooms Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {rooms?.map((room) => {
                const StatusIcon = getStatusIcon(room.status);
                return (
                  <div 
                    key={room.id} 
                    className={`p-3 rounded-lg border text-center ${
                      room.status === 'available' 
                        ? 'bg-green-50 border-green-200' 
                        : room.status === 'occupied'
                        ? 'bg-blue-50 border-blue-200'
                        : room.status === 'dirty'
                        ? 'bg-red-50 border-red-200'
                        : room.status === 'cleaning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    data-testid={`room-overview-${room.id}`}
                  >
                    <StatusIcon className={`w-6 h-6 mx-auto mb-2 ${
                      room.status === 'available' ? 'text-green-600' :
                      room.status === 'occupied' ? 'text-blue-600' :
                      room.status === 'dirty' ? 'text-red-600' :
                      room.status === 'cleaning' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                    <div className="font-medium text-gray-900">Room {room.number}</div>
                    <div className="text-xs text-gray-600 capitalize mt-1">
                      {room.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}