import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Hotel, 
  User, 
  insertHotelSchema, 
  insertUserSchema 
} from "@shared/schema";
import { 
  Building, 
  Users, 
  DollarSign, 
  Activity,
  Plus,
  Search,
  UserPlus,
  Settings,
  BarChart3,
  Crown,
  Shield,
  CreditCard,
  FileText,
  MessageSquare,
  Database,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Download,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Bell,
  Zap,
  Server,
  HardDrive
} from "lucide-react";

interface SystemStats {
  totalHotels: number;
  activeUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  supportTicketsPending: number;
  apiUptime: number;
  dbUsage: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  signups: number;
}

interface SupportTicket {
  id: string;
  hotelName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'closed';
  createdAt: Date;
  assignedTo?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  roomLimit: number;
  staffLimit: number;
  isActive: boolean;
}

export default function EnhancedSuperAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data - in real app, this would come from APIs
  const systemStats: SystemStats = {
    totalHotels: 47,
    activeUsers: 234,
    activeSubscriptions: 42,
    monthlyRevenue: 2450000, // ₦2.45M
    supportTicketsPending: 8,
    apiUptime: 99.9,
    dbUsage: 67.3
  };

  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 1800000, signups: 8 },
    { month: 'Feb', revenue: 2100000, signups: 12 },
    { month: 'Mar', revenue: 2450000, signups: 15 },
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      hotelName: 'Lagos Grand Hotel',
      subject: 'Payment gateway integration issue',
      priority: 'high',
      status: 'open',
      createdAt: new Date(),
      assignedTo: 'Support Team'
    },
    {
      id: '2',
      hotelName: 'Abuja Luxury Suites',
      subject: 'Room booking synchronization problem',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000),
    }
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: '1',
      name: 'Starter',
      price: 35000,
      currency: 'NGN',
      interval: 'monthly',
      features: ['Up to 20 rooms', 'Basic reporting', 'Email support'],
      roomLimit: 20,
      staffLimit: 5,
      isActive: true
    },
    {
      id: '2',
      name: 'Professional',
      price: 75000,
      currency: 'NGN',
      interval: 'monthly',
      features: ['Up to 100 rooms', 'Advanced analytics', 'Priority support', 'API access'],
      roomLimit: 100,
      staffLimit: 25,
      isActive: true
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 120000,
      currency: 'NGN',
      interval: 'monthly',
      features: ['Unlimited rooms', 'Custom integrations', '24/7 support', 'White-label'],
      roomLimit: -1,
      staffLimit: -1,
      isActive: true
    }
  ];

  const { data: hotels = [] } = useQuery({
    queryKey: ["/api/admin/hotels"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Crown className="w-3 h-3 mr-1" />
              System Administrator
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search hotels, users, invoices..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-global"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2">3</Badge>
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
                data-testid="nav-overview"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Overview
              </Button>
              
              <Button 
                variant={activeTab === "users" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
                data-testid="nav-users"
              >
                <Users className="w-4 h-4 mr-3" />
                Users & Roles
              </Button>
              
              <Button 
                variant={activeTab === "hotels" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("hotels")}
                data-testid="nav-hotels"
              >
                <Building className="w-4 h-4 mr-3" />
                Hotels
              </Button>
              
              <Button 
                variant={activeTab === "billing" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("billing")}
                data-testid="nav-billing"
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Billing
              </Button>
              
              <Button 
                variant={activeTab === "reports" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("reports")}
                data-testid="nav-reports"
              >
                <FileText className="w-4 h-4 mr-3" />
                Reports
              </Button>
              
              <Button 
                variant={activeTab === "support" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("support")}
                data-testid="nav-support"
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Support
              </Button>
              
              <Button 
                variant={activeTab === "system" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("system")}
                data-testid="nav-system"
              >
                <Database className="w-4 h-4 mr-3" />
                System
              </Button>
              
              <Button 
                variant={activeTab === "tools" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("tools")}
                data-testid="nav-tools"
              >
                <Zap className="w-4 h-4 mr-3" />
                Tools
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.totalHotels}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.activeSubscriptions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₦{(systemStats.monthlyRevenue / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.supportTicketsPending}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Revenue Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{data.month} 2025</p>
                            <p className="text-sm text-gray-600">{data.signups} new hotels</p>
                          </div>
                          <p className="text-lg font-bold text-green-600">₦{(data.revenue / 1000000).toFixed(1)}M</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Server className="w-4 h-4 mr-2 text-green-600" />
                        <span>API Uptime</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{systemStats.apiUptime}%</span>
                        <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-2 text-blue-600" />
                        <span>Database Usage</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{systemStats.dbUsage}%</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full ml-2">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${systemStats.dbUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh System Status
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">New hotel registered</p>
                        <p className="text-sm text-gray-600">Golden Gate Resort - Lagos</p>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">Payment received</p>
                        <p className="text-sm text-gray-600">Abuja Luxury Suites - ₦75,000</p>
                      </div>
                      <span className="text-xs text-gray-500">4 hours ago</span>
                    </div>
                    
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">Support ticket created</p>
                        <p className="text-sm text-gray-600">Payment gateway integration issue</p>
                      </div>
                      <span className="text-xs text-gray-500">6 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Support & Communication</h2>
                <div className="flex space-x-2">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Newsletter
                  </Button>
                </div>
              </div>

              {/* Support Tickets */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Support Tickets</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Hotel: {ticket.hotelName}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                          {ticket.assignedTo && <span>Assigned to: {ticket.assignedTo}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Subscription & Billing</h2>
                <div className="flex space-x-2">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Plan
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Subscription Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-3">
                          ₦{plan.price.toLocaleString()}/{plan.interval.slice(0, -2)}
                        </p>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm">
                            <strong>Rooms:</strong> {plan.roomLimit === -1 ? 'Unlimited' : plan.roomLimit}
                          </p>
                          <p className="text-sm">
                            <strong>Staff:</strong> {plan.staffLimit === -1 ? 'Unlimited' : plan.staffLimit}
                          </p>
                        </div>
                        <ul className="text-sm space-y-1 mb-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}