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
  HardDrive,
  X
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
  const [showCreateHotelForm, setShowCreateHotelForm] = useState(false);
  const [showCreateSystemUserForm, setShowCreateSystemUserForm] = useState(false);
  const [showCreateHotelOwnerForm, setShowCreateHotelOwnerForm] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const { data: hotels = [] } = useQuery({
    queryKey: ["/api/admin/hotels"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Fetch system statistics
  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/system-stats"],
  });

  // Fetch revenue data
  const { data: revenueData = [] } = useQuery({
    queryKey: ["/api/admin/revenue-data"],
  });

  // Fetch support tickets
  const { data: supportTickets = [] } = useQuery({
    queryKey: ["/api/admin/support-tickets"],
  });

  // Fetch subscription plans
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["/api/admin/subscription-plans"],
  });

  // Default values for when API data isn't loaded yet
  const defaultStats: SystemStats = {
    totalHotels: 0,
    activeUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    supportTicketsPending: 0,
    apiUptime: 0,
    dbUsage: 0
  };

  const stats = systemStats || defaultStats;

  // Filter hotels based on search and status
  const filteredHotels = (hotels as any[]).filter((hotel: any) => {
    const matchesSearch = !searchQuery || 
      hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || hotel.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Hotel management handlers
  const handleCreateHotel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const hotelData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        totalRooms: parseInt(formData.get('totalRooms') as string) || 0,
        maxStaff: parseInt(formData.get('maxStaff') as string) || 0,
        ownerId: formData.get('ownerId') as string,
        status: 'active' as const
      };

      const response = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Hotel created successfully"
        });
        setShowCreateHotelForm(false);
        // Refresh the hotels list
        window.location.reload();
      } else {
        throw new Error('Failed to create hotel');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create hotel",
        variant: "destructive"
      });
    }
  };

  const exportHotelsData = () => {
    const csvData = [
      ['Name', 'Slug', 'Address', 'Phone', 'Email', 'Rooms', 'Max Staff', 'Status', 'Created'],
      ...filteredHotels.map((hotel: any) => [
        hotel.name || '',
        hotel.slug || '',
        hotel.address || '',
        hotel.phone || '',
        hotel.email || '',
        hotel.totalRooms || 0,
        hotel.maxStaff || 0,
        hotel.status || 'active',
        new Date(hotel.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotels-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${filteredHotels.length} hotels to CSV`
    });
  };

  // User management handlers
  const handleCreateSystemUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const userData = {
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        fullName: formData.get('fullName') as string,
        role: formData.get('role') as string,
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "System user created successfully"
        });
        setShowCreateSystemUserForm(false);
        // Refresh users list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create system user",
        variant: "destructive"
      });
    }
  };

  const handleCreateHotelOwner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const ownerData = {
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        role: 'HOTEL_OWNER' as const,
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Hotel owner created successfully"
        });
        setShowCreateHotelOwnerForm(false);
        // Refresh users list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create hotel owner');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create hotel owner",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        });
        // Refresh users list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  // Filter users based on search and role
  const filteredSystemUsers = (users as any[]).filter((user: any) => {
    const isSystemUser = ['SUPER_ADMIN', 'DEVELOPER_ADMIN', 'SUPPORT'].includes(user.role);
    const matchesSearch = !userSearchQuery || 
      user.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesFilter = userRoleFilter === 'all' || user.role === userRoleFilter;
    
    return isSystemUser && matchesSearch && matchesFilter;
  });

  const filteredHotelOwners = (users as any[]).filter((user: any) => {
    const isHotelOwner = user.role === 'HOTEL_OWNER';
    const matchesSearch = !userSearchQuery || 
      user.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    return isHotelOwner && matchesSearch;
  });

  const filteredStaffUsers = (users as any[]).filter((user: any) => {
    const isStaff = !['SUPER_ADMIN', 'DEVELOPER_ADMIN', 'SUPPORT', 'HOTEL_OWNER', 'GUEST'].includes(user.role);
    const matchesSearch = !userSearchQuery || 
      user.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    return isStaff && matchesSearch;
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
                        <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
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
                        <p className="text-2xl font-bold text-gray-900">₦{(stats.monthlyRevenue / 1000000).toFixed(1)}M</p>
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
                        <p className="text-2xl font-bold text-gray-900">{stats.supportTicketsPending}</p>
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
                        <span className="font-medium">{stats.apiUptime}%</span>
                        <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-2 text-blue-600" />
                        <span>Database Usage</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{stats.dbUsage}%</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full ml-2">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${stats.dbUsage}%` }}
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

              <Tabs defaultValue="tickets">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4">

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
                          <Button variant="outline" size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Support Staff
                          </Button>
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
                                <Select>
                                  <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Assign" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="support1">Support Team</SelectItem>
                                    <SelectItem value="support2">Tech Support</SelectItem>
                                    <SelectItem value="support3">Billing Support</SelectItem>
                                  </SelectContent>
                                </Select>
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
                </TabsContent>

                <TabsContent value="announcements" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>System Announcements</CardTitle>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Announcement
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="default">System Update</Badge>
                            <div className="flex space-x-2">
                              <span className="text-xs text-gray-500">Active</span>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">New Payment Integration Features</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Stripe integration now available for international hotels. Enhanced payment processing with multi-currency support.
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Published: 2 days ago</span>
                            <span>Sent to: 47 hotels</span>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary">Feature Release</Badge>
                            <div className="flex space-x-2">
                              <span className="text-xs text-gray-500">Draft</span>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">Mobile Room Key System Available</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            QR-based digital room access for enhanced guest experience. Contactless check-in now possible.
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Created: 1 week ago</span>
                            <Button variant="outline" size="sm">Publish Now</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Email Newsletter Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-medium">Monthly Newsletter</p>
                            <p className="text-sm text-gray-600">47 recipients</p>
                            <Button size="sm" className="mt-2">Send Now</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <p className="font-medium">Feature Updates</p>
                            <p className="text-sm text-gray-600">42 subscribers</p>
                            <Button size="sm" className="mt-2" variant="outline">Schedule</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                            <p className="font-medium">Critical Updates</p>
                            <p className="text-sm text-gray-600">All hotels</p>
                            <Button size="sm" className="mt-2" variant="outline">Draft</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>System Audit Logs</CardTitle>
                          <p className="text-sm text-gray-600">Track every system change by any user</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Advanced Filters
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Logs
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            id: '1',
                            action: 'Hotel Created',
                            user: 'Super Admin',
                            userEmail: 'admin@luxuryhotelsaas.com',
                            target: 'Lagos Grand Hotel',
                            timestamp: new Date(Date.now() - 3600000),
                            details: 'Created new hotel with 25 rooms, assigned to john.doe@email.com',
                            ip: '192.168.1.1'
                          },
                          {
                            id: '2',
                            action: 'User Role Changed',
                            user: 'Super Admin',
                            userEmail: 'admin@luxuryhotelsaas.com',
                            target: 'john.doe@hotel.com',
                            timestamp: new Date(Date.now() - 7200000),
                            details: 'Changed role from FRONT_DESK to HOTEL_MANAGER',
                            ip: '192.168.1.1'
                          },
                          {
                            id: '3',
                            action: 'Payment Processed',
                            user: 'System',
                            userEmail: 'system@luxuryhotelsaas.com',
                            target: 'Abuja Luxury Suites',
                            timestamp: new Date(Date.now() - 10800000),
                            details: 'Monthly subscription payment ₦75,000 via Paystack',
                            ip: 'webhook'
                          },
                          {
                            id: '4',
                            action: 'API Key Updated',
                            user: 'Developer Admin',
                            userEmail: 'dev@luxuryhotelsaas.com',
                            target: 'Paystack Integration',
                            timestamp: new Date(Date.now() - 14400000),
                            details: 'Updated Paystack secret key for production environment',
                            ip: '10.0.0.45'
                          },
                          {
                            id: '5',
                            action: 'Subscription Plan Modified',
                            user: 'Super Admin',
                            userEmail: 'admin@luxuryhotelsaas.com',
                            target: 'Professional Plan',
                            timestamp: new Date(Date.now() - 18000000),
                            details: 'Updated room limit from 75 to 100, price unchanged',
                            ip: '192.168.1.1'
                          }
                        ].map((log) => (
                          <div key={log.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium">{log.action}</h4>
                                    <Badge 
                                      variant={
                                        log.action.includes('Created') ? 'default' :
                                        log.action.includes('Updated') || log.action.includes('Modified') ? 'secondary' :
                                        log.action.includes('Payment') ? 'outline' : 'destructive'
                                      }
                                    >
                                      {log.user}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">{log.user}</span> ({log.userEmail}) → {log.target}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2">{log.details}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                                    <span>IP: {log.ip}</span>
                                    <span>•</span>
                                    <span>{log.timestamp.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Previous</Button>
                          <span className="text-sm text-gray-600">Page 1 of 24</span>
                          <Button variant="outline" size="sm">Next</Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Show:</span>
                          <Select defaultValue="10">
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User & Role Management</h2>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowCreateSystemUserForm(true)} data-testid="button-add-system-user">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add System User
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateHotelOwnerForm(true)} data-testid="button-create-hotel-owner">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hotel Owner
                  </Button>
                </div>
              </div>

{showCreateSystemUserForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Add System User</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateSystemUserForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSystemUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="userFullName">Full Name *</Label>
                          <Input
                            id="userFullName"
                            name="fullName"
                            placeholder="John Doe"
                            required
                            data-testid="input-user-fullname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userUsername">Username *</Label>
                          <Input
                            id="userUsername"
                            name="username"
                            placeholder="johndoe"
                            required
                            data-testid="input-user-username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">Email *</Label>
                          <Input
                            id="userEmail"
                            name="email"
                            type="email"
                            placeholder="john@luxuryhotelsaas.com"
                            required
                            data-testid="input-user-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userPassword">Password *</Label>
                          <Input
                            id="userPassword"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            data-testid="input-user-password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userRole">System Role *</Label>
                          <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" data-testid="select-user-role" required>
                            <option value="">Select system role</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="DEVELOPER_ADMIN">Developer Admin</option>
                            <option value="SUPPORT">Support Staff</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateSystemUserForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-system-user">
                          Create System User
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {showCreateHotelOwnerForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Create Hotel Owner</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateHotelOwnerForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateHotelOwner} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ownerFullName">Full Name *</Label>
                          <Input
                            id="ownerFullName"
                            name="fullName"
                            placeholder="Jane Smith"
                            required
                            data-testid="input-owner-fullname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerUsername">Username *</Label>
                          <Input
                            id="ownerUsername"
                            name="username"
                            placeholder="janesmith"
                            required
                            data-testid="input-owner-username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerEmail">Email *</Label>
                          <Input
                            id="ownerEmail"
                            name="email"
                            type="email"
                            placeholder="jane@hotelexample.com"
                            required
                            data-testid="input-owner-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPhone">Phone</Label>
                          <Input
                            id="ownerPhone"
                            name="phone"
                            placeholder="+234 901 234 5678"
                            data-testid="input-owner-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPassword">Initial Password *</Label>
                          <Input
                            id="ownerPassword"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            data-testid="input-owner-password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateHotelOwnerForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-hotel-owner">
                          Create Hotel Owner
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="system-users">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="system-users">System Users ({filteredSystemUsers.length})</TabsTrigger>
                  <TabsTrigger value="hotel-owners">Hotel Owners ({filteredHotelOwners.length})</TabsTrigger>
                  <TabsTrigger value="staff-directory">Staff Directory ({filteredStaffUsers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="system-users" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>System Users ({filteredSystemUsers.length} users)</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search users..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="pl-8 w-64"
                              data-testid="input-search-system-users"
                            />
                          </div>
                          <Select value={userRoleFilter} onValueChange={setUserRoleFilter} data-testid="select-system-user-filter">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                              <SelectItem value="DEVELOPER_ADMIN">Developer</SelectItem>
                              <SelectItem value="SUPPORT">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredSystemUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No system users found</p>
                          <p className="text-sm text-gray-400">
                            {userSearchQuery || userRoleFilter !== 'all' 
                              ? 'Try adjusting your search or filters'
                              : 'Create your first system user to get started'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredSystemUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`system-user-card-${user.id}`}>
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium" data-testid={`system-user-name-${user.id}`}>{user.fullName}</h4>
                                  <p className="text-sm text-gray-600" data-testid={`system-user-email-${user.id}`}>{user.email}</p>
                                  <p className="text-xs text-gray-500">@{user.username}</p>
                                  <Badge className="mt-1" variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                                    {user.role.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" data-testid={`button-edit-system-user-${user.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  data-testid={`button-delete-system-user-${user.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hotel-owners" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Hotel Owners ({filteredHotelOwners.length} owners)</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search owners..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="pl-8 w-64"
                              data-testid="input-search-hotel-owners"
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredHotelOwners.length === 0 ? (
                        <div className="text-center py-8">
                          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No hotel owners found</p>
                          <p className="text-sm text-gray-400">
                            {userSearchQuery 
                              ? 'Try adjusting your search terms'
                              : 'Create your first hotel owner to get started'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredHotelOwners.map((owner: any) => {
                            const ownerHotel = (hotels as any[]).find((h: any) => h.id === owner.hotelId);
                            return (
                            <div key={owner.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`hotel-owner-card-${owner.id}`}>
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Crown className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium" data-testid={`hotel-owner-name-${owner.id}`}>{owner.fullName}</h4>
                                  <p className="text-sm text-gray-600" data-testid={`hotel-owner-email-${owner.id}`}>{owner.email}</p>
                                  <p className="text-xs text-gray-500">@{owner.username}</p>
                                  {owner.phone && <p className="text-xs text-gray-500">{owner.phone}</p>}
                                  <div className="flex items-center mt-1 space-x-2">
                                    <Badge variant="outline">Hotel Owner</Badge>
                                    {owner.hotelId && ownerHotel ? (
                                      <Badge variant="default" data-testid={`hotel-assigned-${owner.id}`}>
                                        {ownerHotel.name}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" data-testid={`hotel-unassigned-${owner.id}`}>
                                        No Hotel Assigned
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" data-testid={`button-view-hotel-owner-${owner.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-edit-hotel-owner-${owner.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(owner.id, owner.email)}
                                  data-testid={`button-delete-hotel-owner-${owner.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="staff-directory" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>All Hotel Staff ({filteredStaffUsers.length} staff)</CardTitle>
                          <p className="text-sm text-gray-600">View and manage staff across all hotels</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search staff..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="pl-8 w-64"
                              data-testid="input-search-staff"
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredStaffUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No hotel staff found</p>
                          <p className="text-sm text-gray-400">
                            {userSearchQuery 
                              ? 'Try adjusting your search terms'
                              : 'Hotel staff are created by Hotel Owners and Managers'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredStaffUsers.map((staff: any) => {
                            const hotel = (hotels as any[]).find((h: any) => h.id === staff.hotelId);
                            return (
                              <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`staff-card-${staff.id}`}>
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium" data-testid={`staff-name-${staff.id}`}>{staff.fullName}</h4>
                                    <p className="text-sm text-gray-600" data-testid={`staff-email-${staff.id}`}>{staff.email}</p>
                                    <p className="text-xs text-gray-500">@{staff.username}</p>
                                    <div className="flex items-center mt-1 space-x-2">
                                      <Badge data-testid={`staff-role-${staff.id}`}>{staff.role.replace('_', ' ')}</Badge>
                                      {hotel ? (
                                        <Badge variant="outline" data-testid={`staff-hotel-${staff.id}`}>{hotel.name}</Badge>
                                      ) : (
                                        <Badge variant="secondary">No Hotel</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(staff.id, staff.email)}
                                  data-testid={`button-delete-staff-${staff.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Hotel Management</h2>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowCreateHotelForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hotel
                  </Button>
                  <Button variant="outline" onClick={() => exportHotelsData()}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Hotels
                  </Button>
                </div>
              </div>

{showCreateHotelForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Create New Hotel</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateHotelForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateHotel} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hotelName">Hotel Name *</Label>
                          <Input
                            id="hotelName"
                            name="name"
                            placeholder="Lagos Grand Hotel"
                            required
                            data-testid="input-hotel-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hotelSlug">Hotel Slug *</Label>
                          <Input
                            id="hotelSlug"
                            name="slug"
                            placeholder="lagos-grand-hotel"
                            required
                            data-testid="input-hotel-slug"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hotelAddress">Address *</Label>
                          <Input
                            id="hotelAddress"
                            name="address"
                            placeholder="1 Victoria Island, Lagos, Nigeria"
                            required
                            data-testid="input-hotel-address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hotelPhone">Phone</Label>
                          <Input
                            id="hotelPhone"
                            name="phone"
                            placeholder="+234 1 234 5678"
                            data-testid="input-hotel-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hotelEmail">Email</Label>
                          <Input
                            id="hotelEmail"
                            name="email"
                            type="email"
                            placeholder="info@lagosgrand.com"
                            data-testid="input-hotel-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="totalRooms">Total Rooms *</Label>
                          <Input
                            id="totalRooms"
                            name="totalRooms"
                            type="number"
                            placeholder="25"
                            min="1"
                            required
                            data-testid="input-total-rooms"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxStaff">Max Staff</Label>
                          <Input
                            id="maxStaff"
                            name="maxStaff"
                            type="number"
                            placeholder="10"
                            min="1"
                            data-testid="input-max-staff"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hotelOwner">Assign Owner</Label>
                          <Select name="ownerId" data-testid="select-hotel-owner">
                            <SelectTrigger>
                              <SelectValue placeholder="Select hotel owner" />
                            </SelectTrigger>
                            <SelectContent>
                              {(users as any[])
                                .filter((u: any) => u.role === 'HOTEL_OWNER' && !u.hotelId)
                                .map((owner: any) => (
                                  <SelectItem key={owner.id} value={owner.id}>
                                    {owner.email} - {owner.username}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateHotelForm(false)} data-testid="button-cancel-hotel">
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-create-hotel">
                          Create Hotel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hotels List ({filteredHotels.length} hotels)</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search hotels..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 w-64"
                          data-testid="input-search-hotels"
                        />
                      </div>
                      <Select value={selectedFilter} onValueChange={setSelectedFilter} data-testid="select-hotel-filter">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredHotels.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No hotels found</p>
                      <p className="text-sm text-gray-400">
                        {searchQuery || selectedFilter !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'Create your first hotel to get started'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredHotels.map((hotel: any) => {
                        const owner = (users as any[]).find((u: any) => u.hotelId === hotel.id && u.role === 'HOTEL_OWNER');
                        return (
                        <div key={hotel.id} className="border rounded-lg p-4" data-testid={`hotel-card-${hotel.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Building className="w-8 h-8 text-blue-600" />
                              <div>
                                <h3 className="font-semibold" data-testid={`hotel-name-${hotel.id}`}>{hotel.name}</h3>
                                <p className="text-sm text-gray-600" data-testid={`hotel-address-${hotel.id}`}>{hotel.address}</p>
                                <p className="text-xs text-gray-500">Slug: {hotel.slug}</p>
                                {owner && <p className="text-xs text-blue-600">Owner: {owner.email}</p>}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={
                                  hotel.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  hotel.status === 'trial' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }
                                data-testid={`hotel-status-${hotel.id}`}
                              >
                                {hotel.status}
                              </Badge>
                              <Button variant="outline" size="sm" data-testid={`button-view-hotel-${hotel.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-edit-hotel-${hotel.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600" data-testid={`button-delete-hotel-${hotel.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Rooms:</span>
                              <span className="ml-1 font-medium">{hotel.totalRooms || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Max Staff:</span>
                              <span className="ml-1 font-medium">{hotel.maxStaff || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <span className="ml-1 font-medium">{hotel.email || 'Not set'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <span className="ml-1 font-medium">{hotel.phone || 'Not set'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <span className="ml-1 font-medium">{new Date(hotel.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                  
                  {filteredHotels.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <span className="text-sm text-gray-600">Page 1 of 1</span>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <Select defaultValue="10">
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
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

              <Tabs defaultValue="plans">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="usage">Usage Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-4">
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
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { id: 'INV-001', hotel: 'Lagos Grand Hotel', amount: 75000, status: 'paid', date: '2025-01-09' },
                          { id: 'INV-002', hotel: 'Abuja Luxury Suites', amount: 120000, status: 'pending', date: '2025-01-08' },
                          { id: 'INV-003', hotel: 'Port Harcourt Resort', amount: 35000, status: 'overdue', date: '2025-01-05' }
                        ].map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{invoice.id}</h4>
                              <p className="text-sm text-gray-600">{invoice.hotel}</p>
                              <p className="text-sm text-gray-500">{invoice.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₦{invoice.amount.toLocaleString()}</p>
                              <Badge 
                                variant={
                                  invoice.status === 'paid' ? 'default' : 
                                  invoice.status === 'pending' ? 'secondary' : 'destructive'
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                              <div className="ml-4">
                                <p className="text-sm text-gray-600">Successful</p>
                                <p className="text-2xl font-bold">156</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <Clock className="h-8 w-8 text-yellow-600" />
                              <div className="ml-4">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold">23</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <AlertTriangle className="h-8 w-8 text-red-600" />
                              <div className="ml-4">
                                <p className="text-sm text-gray-600">Failed</p>
                                <p className="text-2xl font-bold">7</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry Failed Payments
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hotels.slice(0, 5).map((hotel) => (
                          <div key={hotel.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{hotel.name}</h4>
                              <Badge variant="outline">Professional Plan</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Rooms Used:</span>
                                <div className="font-medium">15 / 100</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Staff:</span>
                                <div className="font-medium">8 / 25</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Storage:</span>
                                <div className="font-medium">2.3 GB / 10 GB</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-green-600">₦2.45M</p>
                      <p className="text-sm text-green-600">+18.5% from last month</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Avg Occupancy</p>
                      <p className="text-3xl font-bold text-blue-600">73%</p>
                      <p className="text-sm text-blue-600">+5.2% from last month</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Building className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Active Hotels</p>
                      <p className="text-3xl font-bold text-purple-600">{hotels.length}</p>
                      <p className="text-sm text-purple-600">+3 new this month</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-orange-600">1,234</p>
                      <p className="text-sm text-orange-600">+12.3% from last month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Hotels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hotels.slice(0, 5).map((hotel, index) => (
                        <div key={hotel.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{hotel.name}</p>
                              <p className="text-sm text-gray-600">{Math.floor(Math.random() * 50 + 20)} bookings</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₦{(Math.random() * 500000 + 100000).toFixed(0)}</p>
                            <p className="text-sm text-gray-600">revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { source: 'Direct Bookings', percentage: 45, count: 555 },
                        { source: 'Booking.com', percentage: 28, count: 345 },
                        { source: 'Airbnb', percentage: 18, count: 222 },
                        { source: 'Expedia', percentage: 9, count: 112 }
                      ].map((item) => (
                        <div key={item.source} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                            <span>{item.source}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{item.count} bookings</span>
                            <span className="font-medium">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    System Config
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Main Domain</Label>
                      <Input value="luxuryhotelsaas.com" readOnly />
                    </div>
                    <div>
                      <Label>Admin Domain</Label>
                      <Input value="admin.luxuryhotelsaas.com" readOnly />
                    </div>
                    <div>
                      <Label>API Domain</Label>
                      <Input value="api.luxuryhotelsaas.com" readOnly />
                    </div>
                    <Button className="w-full">Update Domain Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Keys Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Paystack Secret Key</Label>
                      <div className="flex space-x-2">
                        <Input type="password" placeholder="sk_test_..." />
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Flutterwave Secret Key</Label>
                      <div className="flex space-x-2">
                        <Input type="password" placeholder="FLWSECK_TEST-..." />
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp API Token</Label>
                      <div className="flex space-x-2">
                        <Input type="password" placeholder="EAAx..." />
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Health & Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Server className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">API Status</p>
                      <p className="text-green-600 font-bold">Operational</p>
                      <p className="text-sm text-gray-600">99.9% uptime</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Database</p>
                      <p className="text-blue-600 font-bold">Connected</p>
                      <p className="text-sm text-gray-600">67% usage</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Globe className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">CDN</p>
                      <p className="text-purple-600 font-bold">Active</p>
                      <p className="text-sm text-gray-600">Global coverage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Advanced Tools</h2>
                <Badge variant="secondary">Developer Tools</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Hotels Data
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Bulk Hotel Import
                    </Button>
                    <Button className="w-full" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Hotel Migration Tool
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Developer Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      API Test Console
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Building className="w-4 h-4 mr-2" />
                      Create Sandbox Hotel
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Beta Features Toggle
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Database className="w-8 h-8 mb-2" />
                      <span>Database Backup</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <RefreshCw className="w-8 h-8 mb-2" />
                      <span>Clear Cache</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Activity className="w-8 h-8 mb-2" />
                      <span>Run Diagnostics</span>
                    </Button>
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