import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
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
import type { Hotel, Room } from "@shared/schema";
import HotelLogo from "@/components/ui/hotel-logo";

export default function TenantDashboard() {
  const { hotelSlug } = useParams();
  const { user, logoutMutation } = useAuth();

  // Fetch hotel data by slug
  const { data: hotel, isLoading: hotelLoading } = useQuery<Hotel>({
    queryKey: ["/api/public/hotels", hotelSlug],
  });

  // Fetch available rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/public/hotels", hotelSlug, "rooms"],
    enabled: !!hotelSlug,
  });

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
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <HotelLogo hotel={hotel} size="md" showName={true} />
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Welcome, {user.fullName}</Badge>
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
                        Account Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Preferences
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
              ) : (
                <Button asChild data-testid="button-guest-login">
                  <a href="/auth">Guest Login</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {hotel.name}
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Experience luxury and comfort in the heart of Nigeria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" data-testid="button-book-now">
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600" data-testid="button-check-in">
                <QrCode className="w-5 h-5 mr-2" />
                QR Check-in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Available Rooms */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Rooms</h2>
            <p className="text-xl text-gray-600">Choose from our selection of comfortable accommodations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.slice(0, 6).map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-room-${room.id}`}>
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Bed className="w-16 h-16 text-blue-600 opacity-50" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle data-testid={`text-room-number-${room.id}`}>Room {room.number}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">{room.type.toLowerCase()}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">₦{room.price.toLocaleString()}</span>
                      <span className="text-gray-500">/night</span>
                    </div>
                    <Button data-testid={`button-book-room-${room.id}`}>
                      Book Now
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    Up to {room.capacity} guests
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {availableRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Rooms Available</h3>
              <p className="text-gray-600">Please check back later or contact us for assistance.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <HotelIcon className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl">{hotel.name}</span>
              </div>
              <p className="text-gray-400 mb-4">
                Experience luxury and comfort in the heart of Nigeria
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +234 123 456 7890
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  info@{hotelSlug}.com
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Lagos, Nigeria
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Book a Room</a>
                <a href="#" className="block hover:text-white transition-colors">Check-in</a>
                <a href="#" className="block hover:text-white transition-colors">Services</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {hotel.name}. All rights reserved. Powered by LuxuryHotelSaaS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}