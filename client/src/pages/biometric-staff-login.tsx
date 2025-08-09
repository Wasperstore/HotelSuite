import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Fingerprint, 
  Camera, 
  Scan,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Clock,
  Smartphone
} from "lucide-react";

interface BiometricData {
  type: 'FINGERPRINT' | 'FACE' | 'IRIS';
  template: string;
  confidence: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  lastLogin: Date;
  biometricEnabled: boolean;
}

export default function BiometricStaffLogin() {
  const { toast } = useToast();
  const { loginMutation } = useAuth();
  const [authStep, setAuthStep] = useState<'select' | 'fingerprint' | 'face' | 'pin' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    // Check if device supports biometric authentication
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check for WebAuthn support (modern biometric API)
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricSupported(available);
      }
      
      // Also check for other biometric APIs
      if (navigator.credentials && 'create' in navigator.credentials) {
        setBiometricSupported(true);
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
      setBiometricSupported(false);
    }
  };

  const mockStaff: StaffMember[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'FRONT_DESK',
      department: 'Reception',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      biometricEnabled: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'HOUSEKEEPING',
      department: 'Housekeeping',
      lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      biometricEnabled: true
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'MAINTENANCE',
      department: 'Engineering',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      biometricEnabled: false
    }
  ];

  const handleFingerprintAuth = async () => {
    if (!selectedStaff) return;
    
    setLoading(true);
    setAuthStep('fingerprint');

    try {
      // Simulate fingerprint scanning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would:
      // 1. Capture fingerprint data
      // 2. Compare with stored templates
      // 3. Return match confidence score
      
      const mockBiometric: BiometricData = {
        type: 'FINGERPRINT',
        template: 'encrypted_fingerprint_template',
        confidence: 0.95
      };

      if (mockBiometric.confidence > 0.8) {
        await authenticateStaff(selectedStaff, 'BIOMETRIC_FINGERPRINT');
        setAuthStep('success');
        
        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${selectedStaff.name}!`,
        });
      } else {
        throw new Error('Fingerprint match confidence too low');
      }
      
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Fingerprint not recognized. Please try PIN login.",
        variant: "destructive",
      });
      setAuthStep('pin');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceAuth = async () => {
    if (!selectedStaff) return;
    
    setLoading(true);
    setAuthStep('face');

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // In real implementation, this would:
      // 1. Capture facial features
      // 2. Use ML model for recognition
      // 3. Compare with stored templates
      
      // Simulate face recognition
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Clean up camera stream
      stream.getTracks().forEach(track => track.stop());
      
      const mockBiometric: BiometricData = {
        type: 'FACE',
        template: 'encrypted_face_template',
        confidence: 0.92
      };

      if (mockBiometric.confidence > 0.85) {
        await authenticateStaff(selectedStaff, 'BIOMETRIC_FACE');
        setAuthStep('success');
        
        toast({
          title: "Authentication Successful",
          description: `Face recognized. Welcome, ${selectedStaff.name}!`,
        });
      } else {
        throw new Error('Face recognition confidence too low');
      }
      
    } catch (error) {
      toast({
        title: "Face Recognition Failed",
        description: "Unable to recognize face. Please try PIN login.",
        variant: "destructive",
      });
      setAuthStep('pin');
    } finally {
      setLoading(false);
    }
  };

  const handlePinAuth = async () => {
    if (!selectedStaff || !pinCode) return;
    
    setLoading(true);

    try {
      // Validate PIN (in real app, this would hash and compare)
      if (pinCode.length === 4) {
        await authenticateStaff(selectedStaff, 'PIN');
        setAuthStep('success');
        
        toast({
          title: "Authentication Successful",
          description: `PIN verified. Welcome, ${selectedStaff.name}!`,
        });
      } else {
        throw new Error('Invalid PIN');
      }
      
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const authenticateStaff = async (staff: StaffMember, method: string) => {
    // Log authentication attempt
    await fetch('/api/auth/biometric-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffId: staff.id,
        method,
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        success: true
      })
    });
    
    // Perform actual login
    // This would integrate with your authentication system
    console.log(`Staff ${staff.name} authenticated via ${method}`);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'FRONT_DESK': 'bg-blue-100 text-blue-800',
      'HOUSEKEEPING': 'bg-green-100 text-green-800',
      'MAINTENANCE': 'bg-orange-100 text-orange-800',
      'ACCOUNTING': 'bg-purple-100 text-purple-800',
      'POS_STAFF': 'bg-pink-100 text-pink-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8 max-w-md space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Staff Authentication</span>
          </CardTitle>
          <p className="text-gray-600">Secure biometric login for hotel staff</p>
        </CardHeader>
      </Card>

      {authStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Staff Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockStaff.map((staff) => (
              <div
                key={staff.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStaff?.id === staff.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStaff(staff)}
                data-testid={`staff-${staff.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-gray-600">{staff.department}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getRoleColor(staff.role)}>
                      {staff.role.replace('_', ' ')}
                    </Badge>
                    {staff.biometricEnabled && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span>Biometric Enabled</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Last login: {staff.lastLogin.toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            {selectedStaff && (
              <div className="pt-4">
                <h4 className="font-medium mb-3">Authentication Methods</h4>
                <div className="space-y-2">
                  {selectedStaff.biometricEnabled && biometricSupported && (
                    <>
                      <Button
                        onClick={handleFingerprintAuth}
                        className="w-full justify-start"
                        variant="outline"
                        data-testid="button-fingerprint-auth"
                      >
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Fingerprint Authentication
                      </Button>
                      
                      <Button
                        onClick={handleFaceAuth}
                        className="w-full justify-start"
                        variant="outline"
                        data-testid="button-face-auth"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Face Recognition
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => setAuthStep('pin')}
                    className="w-full justify-start"
                    variant="outline"
                    data-testid="button-pin-auth"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    PIN Authentication
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {authStep === 'fingerprint' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Fingerprint Authentication</CardTitle>
            <p className="text-gray-600">Place your finger on the scanner</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="relative">
              <Fingerprint className={`w-24 h-24 mx-auto ${loading ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              {loading ? 'Scanning fingerprint...' : 'Touch the sensor to authenticate'}
            </p>
            
            <Button
              onClick={() => setAuthStep('select')}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'face' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Face Recognition</CardTitle>
            <p className="text-gray-600">Position your face in front of the camera</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="relative">
              <Camera className={`w-24 h-24 mx-auto ${loading ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan className="w-8 h-8 animate-pulse text-blue-600" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              {loading ? 'Analyzing facial features...' : 'Look directly at the camera'}
            </p>
            
            <Button
              onClick={() => setAuthStep('select')}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {authStep === 'pin' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>PIN Authentication</CardTitle>
            <p className="text-gray-600">Enter your 4-digit PIN</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-2xl tracking-widest"
                maxLength={4}
                data-testid="input-pin-code"
              />
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handlePinAuth}
                disabled={pinCode.length !== 4 || loading}
                className="w-full"
                data-testid="button-verify-pin"
              >
                {loading ? 'Verifying...' : 'Verify PIN'}
              </Button>
              
              <Button
                onClick={() => setAuthStep('select')}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {authStep === 'success' && selectedStaff && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Authentication Successful
              </h3>
              <p className="text-green-700">Welcome back, {selectedStaff.name}!</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Logging you in to your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Support Info */}
      {!biometricSupported && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Limited Biometric Support</p>
              <p className="text-yellow-700">
                This device doesn't support advanced biometric authentication. 
                PIN login is available as an alternative.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}