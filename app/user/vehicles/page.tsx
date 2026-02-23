"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Car,
  MoreVertical,
  Calendar,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { Customer } from "@/firebase/types";
import { useGetVehiclesByServiceId, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/firebase/hooks/useVehicle";
import { Vehicle } from "@/firebase/types";
import { colors, colorClasses } from "@/lib/colors";

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Form state for new vehicle
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleCompany, setVehicleCompany] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike" | "other" | null>("car");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get serviceId
  const serviceId = userData?.serviceId || "";
  
  // Get customers for the service (to select customer when creating vehicle)
  const { data: customers = [] } = useGetCustomersByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Get vehicles for the service
  const { data: vehicles = [], isLoading, error } = useGetVehiclesByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Mutations
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        setVehicleName("");
        setVehicleYear("");
        setVehicleCompany("");
        setVehicleModel("");
        setVehicleColor("");
        setVehicleNumber("");
        setVehicleType("car");
        setSelectedCustomerId("");
        setFormError("");
      }, 0);
    }
  }, [isDialogOpen]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!serviceId) {
      setFormError("Service ID not found. Please try again.");
      return;
    }

    if (!selectedCustomerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (!vehicleNumber) {
      setFormError("Vehicle number is required.");
      return;
    }

    try {
      await createVehicleMutation.mutateAsync({
        customerId: selectedCustomerId,
        serviceId,
        vehicleData: {
          vehicleName: vehicleName || null,
          vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : null,
          vehicleCompany: vehicleCompany || null,
          vehicleModel: vehicleModel || null,
          vehicleColor: vehicleColor || null,
          vehicleNumber: vehicleNumber || null,
          vehicleType: vehicleType,
        },
      });
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to create vehicle. Please try again.");
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicleId);
        setIsDetailModalOpen(false);
        setSelectedVehicle(null);
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to delete vehicle.");
      }
    }
  };

  const handleRowClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleName(vehicle.vehicleName || "");
    setVehicleYear(vehicle.vehicleYear?.toString() || "");
    setVehicleCompany(vehicle.vehicleCompany || "");
    setVehicleModel(vehicle.vehicleModel || "");
    setVehicleColor(vehicle.vehicleColor || "");
    setVehicleNumber(vehicle.vehicleNumber || "");
    setVehicleType(vehicle.vehicleType || "car");
    setSelectedCustomerId(vehicle.customerId);
    setIsEditDialogOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedVehicle) {
      setFormError("No vehicle selected.");
      return;
    }

    if (!vehicleNumber) {
      setFormError("Vehicle number is required.");
      return;
    }

    try {
      await updateVehicleMutation.mutateAsync({
        vehicleId: selectedVehicle.vehicleId,
        data: {
          vehicleName: vehicleName || null,
          vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : null,
          vehicleCompany: vehicleCompany || null,
          vehicleModel: vehicleModel || null,
          vehicleColor: vehicleColor || null,
          vehicleNumber: vehicleNumber || null,
          vehicleType: vehicleType,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to update vehicle. Please try again.");
    }
  };

  // Reset form when edit dialog closes
  useEffect(() => {
    if (!isEditDialogOpen) {
      setTimeout(() => {
        setVehicleName("");
        setVehicleYear("");
        setVehicleCompany("");
        setVehicleModel("");
        setVehicleColor("");
        setVehicleNumber("");
        setVehicleType("car");
        setSelectedCustomerId("");
        setFormError("");
        setSelectedVehicle(null);
      }, 0);
    }
  }, [isEditDialogOpen]);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date 
        ? date 
        : (date as { toDate?: () => Date; seconds?: number }).toDate?.() 
        || new Date((date as { seconds: number }).seconds * 1000);
      return dateObj.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer?.customerName || customerId.substring(0, 8) + "...";
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "car":
        return (
          <Badge className={colorClasses.badgeInfo}>
            Car
          </Badge>
        );
      case "bike":
        return (
          <Badge className={colorClasses.badgeSuccess}>
            Bike
          </Badge>
        );
      case "other":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Other
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch =
      vehicle.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle.vehicleCompany?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle.vehicleModel?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesType =
      typeFilter === "all" ||
      (vehicle.vehicleType === typeFilter || false);
    return matchesSearch && matchesType;
  });

  const carsCount = vehicles.filter((v: Vehicle) => v.vehicleType === "car").length;
  const bikesCount = vehicles.filter((v: Vehicle) => v.vehicleType === "bike").length;
  const otherCount = vehicles.filter((v: Vehicle) => v.vehicleType === "other").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            VEHICLE_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_VEHICLE_RECORDS_AND_DETAILS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
              <Plus className="h-4 w-4" />
              NEW VEHICLE
            </Button>
          </DialogTrigger>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                ADD_NEW_VEHICLE
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Register a new vehicle in the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateVehicle} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Customer *
                  </label>
                  <SearchableSelect
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                    placeholder="Select customer"
                    searchPlaceholder="Search customers..."
                    items={customers.map((customer) => ({
                      value: customer.customerId,
                      label: customer.customerName || customer.customerId,
                    }))}
                    triggerStyle={{ backgroundColor: colors.background.input }}
                    triggerClassName={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    contentStyle={{ backgroundColor: colors.background.surface }}
                    contentClassName={colorClasses.borderInput}
                    itemClassName="text-white font-mono"
                    emptyMessage="No customers found"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Number *
                  </label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Type
                  </label>
                  <Select
                    value={vehicleType || "car"}
                    onValueChange={(value) => setVehicleType(value as "car" | "bike" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="car" className="text-white font-mono ">Car</SelectItem>
                      <SelectItem value="bike" className="text-white font-mono ">Bike</SelectItem>
                      <SelectItem value="other" className="text-white font-mono ">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Company
                  </label>
                  <Input
                    value={vehicleCompany}
                    onChange={(e) => setVehicleCompany(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Model
                  </label>
                  <Input
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Year
                  </label>
                  <Input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Color
                  </label>
                  <Input
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Red"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Name
                  </label>
                  <Input
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="My Car"
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDialogOpen(false)}
                    className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textRed}`}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVehicleMutation.isPending}
                    className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                  >
                    {createVehicleMutation.isPending ? "CREATING..." : "CREATE"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                EDIT_VEHICLE
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                Update vehicle information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Number *
                  </label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Type
                  </label>
                  <Select
                    value={vehicleType || "car"}
                    onValueChange={(value) => setVehicleType(value as "car" | "bike" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="car" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Car</SelectItem>
                      <SelectItem value="bike" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Bike</SelectItem>
                      <SelectItem value="other" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Company
                  </label>
                  <Input
                    value={vehicleCompany}
                    onChange={(e) => setVehicleCompany(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Model
                  </label>
                  <Input
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Year
                  </label>
                  <Input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Color
                  </label>
                  <Input
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Red"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Name
                  </label>
                  <Input
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="My Car"
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1 font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                    style={{ color: '#ffffff' }}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateVehicleMutation.isPending}
                    className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50"
                  >
                    {updateVehicleMutation.isPending ? "UPDATING..." : "UPDATE"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Total Vehicles
                </p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "..." : vehicles.length}
                </p>
              </div>
              <Car className={`h-8 w-8 ${colorClasses.textBlue}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Cars
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textBlue}`}>
                  {isLoading ? "..." : carsCount}
                </p>
              </div>
              <Car className={`h-8 w-8 ${colorClasses.textBlue}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Bikes
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textCyan}`}>
                  {isLoading ? "..." : bikesCount}
                </p>
              </div>
              <Car className={`h-8 w-8 ${colorClasses.textCyan}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Other
                </p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "..." : otherCount}
                </p>
              </div>
              <Car className={`h-8 w-8 ${colorClasses.textMuted}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <Input
                placeholder="Search by number, company, model, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm text-white"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type"  className="text-white"/>
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_VEHICLES
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredVehicles.length} vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Vehicle Number
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Company / Model
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Year
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Color
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Type
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Registered
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#94a3b8] font-mono">
                    Loading vehicles...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#ef4444] font-mono">
                    Error loading vehicles. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#94a3b8] font-mono">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle: Vehicle) => (
                  <TableRow
                    key={vehicle.vehicleId}
                    className="border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleRowClick(vehicle)}
                  >
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {vehicle.vehicleNumber || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {vehicle.vehicleCompany && vehicle.vehicleModel
                        ? `${vehicle.vehicleCompany} ${vehicle.vehicleModel}`
                        : vehicle.vehicleCompany || vehicle.vehicleModel || vehicle.vehicleName || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {vehicle.vehicleYear || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {vehicle.vehicleColor || "N/A"}
                    </TableCell>
                    <TableCell>{getTypeBadge(vehicle.vehicleType)}</TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {vehicle.createdAt 
                        ? (() => {
                            try {
                              const date = vehicle.createdAt instanceof Date 
                                ? vehicle.createdAt 
                                : (vehicle.createdAt as { toDate?: () => Date; seconds?: number }).toDate?.() 
                                || new Date((vehicle.createdAt as { seconds: number }).seconds * 1000);
                              return date.toLocaleDateString();
                            } catch {
                              return "N/A";
                            }
                          })()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#3b82f6]/20"
                          >
                            <MoreVertical className="h-4 w-4 text-[#94a3b8]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#25282c] border-white/10"
                        >
                          <DropdownMenuLabel className="font-mono text-xs text-white">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(vehicle);
                            }}
                            className="font-mono text-xs hover:bg-white/10 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2 text-[#22d3ee]" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="font-mono text-xs hover:bg-white/10 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVehicle(vehicle);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2 text-[#3b82f6]" />
                            Edit Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10 text-white" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVehicle(vehicle.vehicleId);
                            }}
                            className="font-mono text-xs text-[#ef4444] hover:bg-[#ef4444]/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vehicle Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#3b82f6]">
              VEHICLE_DETAILS
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8] font-mono text-xs">
              View and manage vehicle information
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle ID
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleId}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle Number
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleNumber || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Customer
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {getCustomerName(selectedVehicle.customerId)}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Type
                  </label>
                  <div className="px-4 py-3">
                    {getTypeBadge(selectedVehicle.vehicleType)}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Company
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleCompany || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Model
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleModel || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Year
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleYear || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Color
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedVehicle.vehicleColor || "N/A"}
                  </div>
                </div>
                {selectedVehicle.vehicleName && (
                  <div className="col-span-2">
                    <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                      Vehicle Name
                    </label>
                    <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                      {selectedVehicle.vehicleName}
                    </div>
                  </div>
                )}
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Created At
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {formatDate(selectedVehicle.createdAt)}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Updated At
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {formatDate(selectedVehicle.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    if (selectedVehicle) {
                      handleEditVehicle(selectedVehicle);
                    }
                  }}
                  className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#3b82f6] text-white hover:bg-[#2563eb] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  EDIT VEHICLE
                </Button>
                <Button
                  onClick={() => handleDeleteVehicle(selectedVehicle.vehicleId)}
                  disabled={deleteVehicleMutation.isPending}
                  className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#ef4444] text-white hover:bg-[#dc2626] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteVehicleMutation.isPending ? "DELETING..." : "DELETE"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
