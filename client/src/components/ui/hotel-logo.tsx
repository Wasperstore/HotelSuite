import { useState } from "react";
import { Hotel, Building2, Upload, Edit, X, Check, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface HotelLogoProps {
  hotel?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  editable?: boolean;
  className?: string;
}

interface LogoUploadData {
  logoUrl: string;
}

export default function HotelLogo({ 
  hotel, 
  size = 'md', 
  showName = false, 
  editable = false,
  className = "" 
}: HotelLogoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState(hotel?.logoUrl || '');
  const [previewUrl, setPreviewUrl] = useState('');

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const updateLogoMutation = useMutation({
    mutationFn: async (data: LogoUploadData) => {
      const res = await apiRequest("PATCH", `/api/hotels/${hotel?.id}/logo`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });
      setIsEditing(false);
      toast({
        title: "Logo Updated",
        description: "Hotel logo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveLogo = () => {
    if (!logoUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid logo URL.",
        variant: "destructive",
      });
      return;
    }
    updateLogoMutation.mutate({ logoUrl: logoUrl.trim() });
  };

  const handleCancel = () => {
    setLogoUrl(hotel?.logoUrl || '');
    setPreviewUrl('');
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload to a CDN
      // For now, we'll use a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        setLogoUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!hotel && !editable) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center ${className}`}>
        <Hotel className={`${iconSizeClasses[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Display/Edit */}
      <div className="relative group">
        {isEditing ? (
          <div className="space-y-3">
            <Card className="p-4">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Or Upload File</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      data-testid="input-logo-file"
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>

                {(previewUrl || logoUrl) && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className={`${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden`}>
                      <img 
                        src={previewUrl || logoUrl} 
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={() => {
                          toast({
                            title: "Invalid Image",
                            description: "Could not load the image. Please check the URL.",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleSaveLogo}
                    disabled={updateLogoMutation.isPending}
                    data-testid="button-save-logo"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {updateLogoMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancel}
                    data-testid="button-cancel-logo"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="relative">
            {hotel?.logoUrl ? (
              <img 
                src={hotel.logoUrl} 
                alt={`${hotel.name} logo`}
                className={`${sizeClasses[size]} object-contain rounded-lg border border-gray-200`}
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
                data-testid="img-hotel-logo"
              />
            ) : null}
            
            <div className={`${hotel?.logoUrl ? 'hidden' : ''} ${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}>
              <Building2 className={`${iconSizeClasses[size]} text-white`} />
            </div>

            {editable && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-1 -right-1 p-1 h-6 w-6 bg-white shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-logo"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hotel Name */}
      {showName && hotel?.name && (
        <div>
          <h1 className={`font-bold text-gray-900 ${textSizeClasses[size]}`} data-testid="text-hotel-name">
            {hotel.name}
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-sm text-gray-500" data-testid="text-hotel-subtitle">
              Hotel Management System
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Utility component for dashboard headers
export function DashboardHeader({ 
  hotel, 
  title, 
  subtitle, 
  children,
  editable = false 
}: {
  hotel?: any;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  editable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <HotelLogo 
          hotel={hotel} 
          size="lg" 
          showName={true}
          editable={editable}
        />
        {(title || subtitle) && (
          <div className="border-l border-gray-300 pl-4">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900" data-testid="text-dashboard-title">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500" data-testid="text-dashboard-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-3">
          {children}
        </div>
      )}
    </div>
  );
}