import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Users, TrendingUp, Settings, Calendar, BarChart3, Hotel } from "lucide-react";

const dashboardTabs = [
  { id: "super-admin", label: "Super Admin", active: true },
  { id: "hotel-manager", label: "Hotel Manager", active: false },
  { id: "front-desk", label: "Front Desk", active: false }
];

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Building, label: "Hotels", active: false },
  { icon: Users, label: "Owners", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: Settings, label: "Settings", active: false }
];

const statsData = [
  { label: "Total Hotels", value: "127", icon: Building, color: "success" },
  { label: "Active Users", value: "2,847", icon: Users, color: "blue" }
];

const recentHotels = [
  { name: "Grand Palace Hotel", owner: "John Smith", status: "active" },
  { name: "Ocean View Resort", owner: "Sarah Johnson", status: "pending" }
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("super-admin");

  return (
    <section className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4" data-testid="dashboard-title">
            Role-Based Dashboards for Every Team Member
          </h2>
          <p className="text-xl text-gray-600" data-testid="dashboard-subtitle">
            Each role gets a unique interface designed for their specific workflows and responsibilities.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {dashboardTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`px-6 py-4 text-sm font-medium rounded-none border-b-2 ${
                  activeTab === tab.id
                    ? "text-brand-red border-brand-red bg-white"
                    : "text-gray-600 border-transparent hover:text-brand-red"
                }`}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Dashboard Content */}
          <div className="flex h-96">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white p-6">
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                    <Hotel className="text-white text-sm" />
                  </div>
                  <span className="font-semibold">Super Admin</span>
                </div>
              </div>
              <nav className="space-y-3">
                {sidebarItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={index}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                        item.active
                          ? "text-white bg-brand-red"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                      data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <IconComponent className="text-sm" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 bg-bg-primary">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2" data-testid="dashboard-content-title">
                  Platform Overview
                </h3>
                <p className="text-gray-600">Manage all hotels and users across the platform</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsData.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200" data-testid={`stat-${index}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 ${stat.color === 'success' ? 'bg-green-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={stat.color === 'success' ? 'text-success' : 'text-blue-600'} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-text-primary mb-3">Recent Hotel Registrations</h4>
                <div className="space-y-3">
                  {recentHotels.map((hotel, index) => (
                    <div key={index} className="flex items-center justify-between py-2" data-testid={`hotel-${index}`}>
                      <div>
                        <p className="font-medium text-text-primary">{hotel.name}</p>
                        <p className="text-sm text-gray-600">Owner: {hotel.owner}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        hotel.status === 'active' 
                          ? 'bg-green-100 text-success' 
                          : 'bg-yellow-100 text-warning'
                      }`}>
                        {hotel.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
