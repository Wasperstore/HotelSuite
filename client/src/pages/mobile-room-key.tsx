import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  QrCode, 
  Unlock, 
  Lock,
  Shield,
  Wifi,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface RoomKeyData {
  id: string;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  keyCode: string;
  isActive: boolean;
  expiresAt: Date;
}

export default function MobileRoomKey() {
  const { toast } = useToast();
  const [roomKey, setRoomKey] = useState<RoomKeyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  
  // Simulate loading room key data
  useEffect(() => {
    // In real implementation, this would fetch from API based on guest authentication
    const mockRoomKey: RoomKeyData = {
      id: "key_001",
      roomNumber: "301",
      guestName: "John Doe",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      keyCode: "ROOM301_" + Date.now().toString(36).toUpperCase(),
      isActive: true,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
    
    setTimeout(() => {
      setRoomKey(mockRoomKey);
    }, 1000);
  }, []);

  const handleUnlockRoom = async () => {
    if (!roomKey) return;
    
    setUnlocking(true);
    
    try {
      // Simulate room unlock via QR code or Bluetooth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Room Unlocked",
        description: `Room ${roomKey.roomNumber} has been unlocked successfully`,
      });
      
      // Log access attempt
      await logRoomAccess(roomKey.id, 'unlock_success');
      
    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: "Unable to unlock the room. Please contact front desk.",
        variant: "destructive",
      });
      
      await logRoomAccess(roomKey.id, 'unlock_failed');
    } finally {
      setUnlocking(false);
    }
  };

  const logRoomAccess = async (keyId: string, action: string) => {
    try {
      await fetch('/api/room-access/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId,
          action,
          timestamp: new Date().toISOString(),
          deviceInfo: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to log room access:', error);
    }
  };

  const generateQRKey = () => {
    if (!roomKey) return '';
    
    return JSON.stringify({
      type: 'ROOM_KEY',
      keyId: roomKey.id,
      roomNumber: roomKey.roomNumber,
      keyCode: roomKey.keyCode,
      timestamp: Date.now(),
      expiresAt: roomKey.expiresAt.getTime()
    });
  };

  if (!roomKey) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading your digital room key...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > roomKey.expiresAt;
  const isCheckedIn = new Date() >= roomKey.checkIn;

  return (
    <div className="container mx-auto py-8 max-w-md space-y-6">
      {/* Room Key Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-6 h-6" />
              <span className="text-lg font-semibold">Digital Room Key</span>
            </div>
            <Badge variant={roomKey.isActive && !isExpired ? "default" : "secondary"} className="bg-white text-blue-800">
              {roomKey.isActive && !isExpired ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Room Information */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Room {roomKey.roomNumber}</h2>
            <p className="text-blue-100">Welcome, {roomKey.guestName}</p>
          </div>

          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-lg">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <QrCode className="w-16 h-16 text-gray-600 mx-auto" />
                <p className="text-sm text-gray-600">QR Room Key</p>
                <p className="text-xs text-gray-500 font-mono">{roomKey.keyCode}</p>
              </div>
            </div>
          </div>

          {/* Unlock Button */}
          <Button 
            onClick={handleUnlockRoom}
            disabled={!roomKey.isActive || isExpired || !isCheckedIn || unlocking}
            className="w-full bg-white text-blue-600 hover:bg-gray-100 h-12 text-lg font-semibold"
            data-testid="button-unlock-room"
          >
            {unlocking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 mr-2" />
                Unlock Room
              </>
            )}
          </Button>

          {/* Status Messages */}
          {!isCheckedIn && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Check-in starts at {roomKey.checkIn.toLocaleTimeString()}</span>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">This key has expired. Please contact front desk.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stay Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Stay Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="font-semibold">{roomKey.checkIn.toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">{roomKey.checkIn.toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="font-semibold">{roomKey.checkOut.toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">{roomKey.checkOut.toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Key expires</span>
              <span className="text-sm font-medium">
                {roomKey.expiresAt.toLocaleDateString()} at {roomKey.expiresAt.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Services */}
      <Card>
        <CardHeader>
          <CardTitle>Hotel Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" data-testid="button-wifi-access">
            <Wifi className="w-4 h-4 mr-2" />
            WiFi Access Code
          </Button>
          
          <Button variant="outline" className="w-full justify-start" data-testid="button-room-service">
            <QrCode className="w-4 h-4 mr-2" />
            Room Service Menu
          </Button>
          
          <Button variant="outline" className="w-full justify-start" data-testid="button-concierge">
            <Shield className="w-4 h-4 mr-2" />
            Contact Concierge
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Security Notice</p>
            <p className="text-blue-700">
              Your digital room key is encrypted and expires automatically. 
              Do not share your key code with others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}