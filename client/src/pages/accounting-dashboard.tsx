import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp,
  FileText,
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

export default function AccountingDashboard() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Accounting Dashboard</h1>
              <p className="text-sm text-gray-500">Financial management and reporting</p>
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
              <DropdownMenuContent align="end" className="w-48 z-[60]">
                <DropdownMenuItem disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Financial Preferences
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Calculator className="w-4 h-4 mr-2" />
                  Report Settings
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
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Accounting Dashboard</h2>
          <p className="text-gray-600">
            This dashboard is under development. Coming soon: financial reports, revenue tracking, and expense management.
          </p>
        </div>
      </div>
    </div>
  );
}