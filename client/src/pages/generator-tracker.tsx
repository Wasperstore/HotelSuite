import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Fuel, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Plus,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GeneratorLog } from "@shared/schema";
import { useState } from "react";

const addFuelSchema = z.object({
  fuelAmount: z.number().min(0.1, "Fuel amount must be greater than 0"),
  costPerLiter: z.number().min(1, "Cost per liter is required"),
  totalCost: z.number().min(1, "Total cost is required"),
  supplier: z.string().min(2, "Supplier name is required"),
  notes: z.string().optional(),
});

const logUsageSchema = z.object({
  hoursRun: z.number().min(0.1, "Hours run must be greater than 0"),
  fuelConsumed: z.number().min(0.1, "Fuel consumed must be greater than 0"),
  maintenanceType: z.enum(["ROUTINE", "REPAIR", "SERVICE", "EMERGENCY"]).optional(),
  maintenanceNotes: z.string().optional(),
});

type AddFuelData = z.infer<typeof addFuelSchema>;
type LogUsageData = z.infer<typeof logUsageSchema>;

export default function GeneratorTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showLogUsage, setShowLogUsage] = useState(false);

  const userHotel = user?.hotelId;

  // Fetch generator logs
  const { data: generatorLogs, isLoading: logsLoading } = useQuery<GeneratorLog[]>({
    queryKey: ["/api/hotels", userHotel, "generator-logs"],
    enabled: !!userHotel,
  });

  const addFuelForm = useForm<AddFuelData>({
    resolver: zodResolver(addFuelSchema),
    defaultValues: {
      fuelAmount: 0,
      costPerLiter: 0,
      totalCost: 0,
      supplier: "",
      notes: "",
    }
  });

  const logUsageForm = useForm<LogUsageData>({
    resolver: zodResolver(logUsageSchema),
    defaultValues: {
      hoursRun: 0,
      fuelConsumed: 0,
      maintenanceType: undefined,
      maintenanceNotes: "",
    }
  });

  const addFuelMutation = useMutation({
    mutationFn: async (data: AddFuelData) => {
      const res = await apiRequest("POST", `/api/hotels/${userHotel}/generator-logs`, {
        ...data,
        hotelId: userHotel,
        logType: 'FUEL_PURCHASE',
        recordedBy: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "generator-logs"] });
      setShowAddFuel(false);
      addFuelForm.reset();
      toast({
        title: "Success",
        description: "Fuel purchase recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logUsageMutation = useMutation({
    mutationFn: async (data: LogUsageData) => {
      const res = await apiRequest("POST", `/api/hotels/${userHotel}/generator-logs`, {
        ...data,
        hotelId: userHotel,
        logType: 'USAGE',
        recordedBy: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", userHotel, "generator-logs"] });
      setShowLogUsage(false);
      logUsageForm.reset();
      toast({
        title: "Success",
        description: "Usage logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddFuel = (data: AddFuelData) => {
    addFuelMutation.mutate(data);
  };

  const onLogUsage = (data: LogUsageData) => {
    logUsageMutation.mutate(data);
  };

  // Calculate metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyLogs = generatorLogs?.filter(log => {
    const logDate = new Date(log.createdAt || new Date());
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  }) || [];

  const totalFuelPurchased = monthlyLogs
    .filter(log => log.logType === 'FUEL_PURCHASE')
    .reduce((sum, log) => sum + (log.fuelAmount || 0), 0);

  const totalFuelConsumed = monthlyLogs
    .filter(log => log.logType === 'USAGE')
    .reduce((sum, log) => sum + (log.fuelConsumed || 0), 0);

  const totalCost = monthlyLogs
    .filter(log => log.logType === 'FUEL_PURCHASE')
    .reduce((sum, log) => sum + (log.totalCost || 0), 0);

  const totalHours = monthlyLogs
    .filter(log => log.logType === 'USAGE')
    .reduce((sum, log) => sum + (log.hoursRun || 0), 0);

  const currentFuelLevel = totalFuelPurchased - totalFuelConsumed;
  const averageConsumption = totalHours > 0 ? totalFuelConsumed / totalHours : 0;

  if (!userHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have permission to access the Generator Tracker.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generator & Fuel Tracker</h1>
              <p className="text-gray-600">Monitor diesel consumption and costs</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showAddFuel} onOpenChange={setShowAddFuel}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-fuel">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Fuel Purchase</DialogTitle>
                </DialogHeader>
                <Form {...addFuelForm}>
                  <form onSubmit={addFuelForm.handleSubmit(onAddFuel)} className="space-y-4">
                    <FormField
                      control={addFuelForm.control}
                      name="fuelAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Amount (Liters)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-fuel-amount" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addFuelForm.control}
                      name="costPerLiter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost per Liter (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-cost-per-liter" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addFuelForm.control}
                      name="totalCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-total-cost" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addFuelForm.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-supplier" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={addFuelMutation.isPending} data-testid="button-submit-fuel">
                      {addFuelMutation.isPending ? "Recording..." : "Record Purchase"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showLogUsage} onOpenChange={setShowLogUsage}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-log-usage">
                  <Clock className="w-4 h-4 mr-2" />
                  Log Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Generator Usage</DialogTitle>
                </DialogHeader>
                <Form {...logUsageForm}>
                  <form onSubmit={logUsageForm.handleSubmit(onLogUsage)} className="space-y-4">
                    <FormField
                      control={logUsageForm.control}
                      name="hoursRun"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Run</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-hours-run" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={logUsageForm.control}
                      name="fuelConsumed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Consumed (Liters)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-fuel-consumed" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={logUsageForm.control}
                      name="maintenanceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Type (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-maintenance-type">
                                <SelectValue placeholder="Select maintenance type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ROUTINE">Routine</SelectItem>
                              <SelectItem value="REPAIR">Repair</SelectItem>
                              <SelectItem value="SERVICE">Service</SelectItem>
                              <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={logUsageMutation.isPending} data-testid="button-submit-usage">
                      {logUsageMutation.isPending ? "Logging..." : "Log Usage"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Fuel Level</CardTitle>
              <Fuel className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-current-fuel">
                {currentFuelLevel.toFixed(1)}L
              </div>
              <p className="text-xs text-muted-foreground">
                {currentFuelLevel < 50 ? (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Low fuel warning
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Good level
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-monthly-cost">
                ₦{totalCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's fuel expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600" data-testid="text-total-hours">
                {totalHours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Runtime this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Consumption</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-avg-consumption">
                {averageConsumption.toFixed(2)}L/h
              </div>
              <p className="text-xs text-muted-foreground">
                Liters per hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Activity</CardTitle>
              <Badge variant="outline">
                {generatorLogs?.length || 0} total records
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">Loading activity logs...</div>
            ) : (
              <div className="space-y-3">
                {generatorLogs?.slice(0, 10).map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      {log.logType === 'FUEL_PURCHASE' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Fuel className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {log.logType === 'FUEL_PURCHASE' 
                            ? `Fuel Purchase: ${log.fuelAmount}L` 
                            : `Usage: ${log.hoursRun}h runtime`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.logType === 'FUEL_PURCHASE' 
                            ? `₦${log.totalCost?.toLocaleString()} from ${log.supplier}`
                            : `Consumed ${log.fuelConsumed}L`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(log.createdAt || new Date()).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.createdAt || new Date()).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {(!generatorLogs || generatorLogs.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p>No generator activity recorded yet.</p>
                    <p className="text-sm">Start by adding a fuel purchase or logging usage.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}