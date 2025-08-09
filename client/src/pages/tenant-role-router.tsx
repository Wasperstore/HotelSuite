import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lazy, Suspense } from "react";
import type { Hotel } from "@shared/schema";

// Lazy load dashboard components
const FrontDeskPWA = lazy(() => import("./front-desk-pwa"));
const HousekeepingDashboard = lazy(() => import("./housekeeping-dashboard"));
const MaintenanceDashboard = lazy(() => import("./maintenance-dashboard"));
const AccountingDashboard = lazy(() => import("./accounting-dashboard"));
const POSDashboard = lazy(() => import("./pos-dashboard"));
const HotelOwnerDashboard = lazy(() => import("./hotel-owner-dashboard"));

export default function TenantRoleRouter() {
  const { hotelSlug, role } = useParams();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch hotel data to verify tenant access
  const { data: hotel, isLoading: hotelLoading } = useQuery<Hotel>({
    queryKey: ["/api/public/hotels", hotelSlug],
    enabled: !!hotelSlug,
  });

  if (authLoading || hotelLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

  // Check if user has permission for this hotel and role
  if (!user || user.hotelId !== hotel.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You don't have permission to access this hotel's {role} dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );

  // Route to appropriate dashboard based on role
  switch (role) {
    case 'owner':
      if (user.role !== 'HOTEL_OWNER') return <AccessDenied />;
      return <DashboardWrapper><HotelOwnerDashboard /></DashboardWrapper>;
    
    case 'manager':
      if (!['HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><HotelOwnerDashboard /></DashboardWrapper>; // Manager uses same dashboard as owner for now
    
    case 'frontdesk':
      if (!['FRONT_DESK', 'HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><FrontDeskPWA /></DashboardWrapper>;
    
    case 'housekeeping':
      if (!['HOUSEKEEPING', 'HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><HousekeepingDashboard /></DashboardWrapper>;
    
    case 'maintenance':
      if (!['MAINTENANCE', 'HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><MaintenanceDashboard /></DashboardWrapper>;
    
    case 'accounting':
      if (!['ACCOUNTING', 'HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><AccountingDashboard /></DashboardWrapper>;
    
    case 'pos':
      if (!['POS_STAFF', 'HOTEL_MANAGER', 'HOTEL_OWNER'].includes(user.role)) return <AccessDenied />;
      return <DashboardWrapper><POSDashboard /></DashboardWrapper>;
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-red-600">Invalid Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The role "{role}" is not valid for this hotel.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You don't have the required permissions to access this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}