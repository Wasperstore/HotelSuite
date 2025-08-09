import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import HotelOwnerDashboard from "@/pages/hotel-owner-dashboard";
import TenantDashboard from "@/pages/tenant-dashboard";
import FrontDeskPWA from "@/pages/front-desk-pwa";
import GeneratorTracker from "@/pages/generator-tracker";
import GuestBooking from "@/pages/guest-booking";
import TenantRoleRouter from "@/pages/tenant-role-router";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/super-admin" component={SuperAdminDashboard} />
      <ProtectedRoute path="/owner" component={HotelOwnerDashboard} />
      <ProtectedRoute path="/front-desk" component={FrontDeskPWA} />
      <ProtectedRoute path="/generator" component={GeneratorTracker} />
      {/* Tenant-based routing for {hotel-slug} */}
      <Route path="/:hotelSlug/book" component={GuestBooking} />
      <ProtectedRoute path="/:hotelSlug/:role" component={TenantRoleRouter} />
      <Route path="/:hotelSlug" component={TenantDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
