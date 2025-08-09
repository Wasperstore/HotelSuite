import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShoppingCart, 
  CreditCard, 
  Receipt,
  Utensils,
  User,
  LogOut
} from "lucide-react";

export default function POSDashboard() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">POS Dashboard</h1>
              <p className="text-sm text-gray-500">Restaurant and room service orders</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.fullName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">POS Dashboard</h2>
          <p className="text-gray-600">
            This dashboard is under development. Coming soon: order management, billing, and inventory tracking.
          </p>
        </div>
      </div>
    </div>
  );
}