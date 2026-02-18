"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Car,
  MoreVertical,
  Users,
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
import { useGetCustomersByServiceId, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/firebase/hooks/useCustomer";
import { useGetVehiclesByServiceId } from "@/firebase/hooks/useVehicle";
import { Customer } from "@/firebase/types";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form state for new customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerStatus, setCustomerStatus] = useState<"active" | "inactive" | "blocked" | null>("active");
  const [customerType, setCustomerType] = useState<"individual" | "company" | null>("individual");
  const [customerGender, setCustomerGender] = useState<"male" | "female" | "other" | null>(null);
  const [customerGSTNumber, setCustomerGSTNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get customers for the service
  const serviceId = userData?.serviceId || "";
  const { data: customers = [], isLoading, error } = useGetCustomersByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Get vehicles for the service to count vehicles per customer
  const { data: vehicles = [] } = useGetVehiclesByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Function to get vehicle count for a customer
  const getVehicleCount = (customerId: string) => {
    return vehicles.filter((vehicle) => vehicle.customerId === customerId).length;
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerAddress("");
        setCustomerStatus("active");
        setCustomerType("individual");
        setCustomerGender(null);
        setCustomerGSTNumber("");
        setCustomerNotes("");
        setFormError("");
      }, 0);
    }
  }, [isDialogOpen]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!serviceId) {
      setFormError("Service ID not found. Please try again.");
      return;
    }

    if (!customerName) {
      setFormError("Customer name is required.");
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        serviceId,
        customerData: {
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          customerAddress: customerAddress || null,
          customerStatus: customerStatus,
          customerType: customerType,
          customerGender: customerGender,
          customerGSTNumber: customerGSTNumber || null,
          customerNotes: customerNotes || null,
          jobCount: 0,
          jobId: null,
        },
      });
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to create customer. Please try again.");
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomerMutation.mutateAsync(customerId);
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to delete customer.");
      }
    }
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.customerName || "");
    setCustomerEmail(customer.customerEmail || "");
    setCustomerPhone(customer.customerPhone || "");
    setCustomerAddress(customer.customerAddress || "");
    setCustomerStatus(customer.customerStatus || "active");
    setCustomerType(customer.customerType || "individual");
    setCustomerGender(customer.customerGender || null);
    setCustomerGSTNumber(customer.customerGSTNumber || "");
    setCustomerNotes(customer.customerNotes || "");
    setIsEditDialogOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedCustomer) {
      setFormError("No customer selected.");
      return;
    }

    if (!customerName) {
      setFormError("Customer name is required.");
      return;
    }

    try {
      await updateCustomerMutation.mutateAsync({
        customerId: selectedCustomer.customerId,
        data: {
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          customerAddress: customerAddress || null,
          customerStatus: customerStatus,
          customerType: customerType,
          customerGender: customerGender,
          customerGSTNumber: customerGSTNumber || null,
          customerNotes: customerNotes || null,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to update customer. Please try again.");
    }
  };

  // Reset form when edit dialog closes
  useEffect(() => {
    if (!isEditDialogOpen) {
      setTimeout(() => {
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerAddress("");
        setCustomerStatus("active");
        setCustomerType("individual");
        setCustomerGender(null);
        setCustomerGSTNumber("");
        setCustomerNotes("");
        setFormError("");
        setSelectedCustomer(null);
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-[#94a3b8]/20 text-[#94a3b8] hover:bg-[#94a3b8]/30">
            Inactive
          </Badge>
        );
      case "blocked":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Blocked
          </Badge>
        );
      default:
        return <Badge className="bg-[#94a3b8]/20 text-[#94a3b8]">Unknown</Badge>;
    }
  };

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch =
      customer.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (customer.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (customer.customerPhone?.includes(searchQuery) || false);
    const matchesStatus =
      statusFilter === "all" ||
      (customer.customerStatus?.toLowerCase() === statusFilter.toLowerCase() || false);
    return matchesSearch && matchesStatus;
  });

  const activeCustomers = customers.filter((c: Customer) => c.customerStatus === "active");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            CUSTOMER_MANAGEMENT
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_CUSTOMER_RECORDS_AND_SERVICE_HISTORY
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              <Plus className="h-4 w-4" />
              NEW CUSTOMER
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                ADD_NEW_CUSTOMER
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                Register a new customer in the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              {formError && (
                <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                  <p className="font-mono text-xs text-[#ef4444]">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Full Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Status
                  </label>
                  <Select
                    value={customerStatus || "active"}
                    onValueChange={(value) => setCustomerStatus(value as "active" | "inactive" | "blocked" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="active" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Active</SelectItem>
                      <SelectItem value="inactive" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Inactive</SelectItem>
                      <SelectItem value="blocked" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Customer Type
                  </label>
                  <Select
                    value={customerType || "individual"}
                    onValueChange={(value) => setCustomerType(value as "individual" | "company" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="individual" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Individual</SelectItem>
                      <SelectItem value="company" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Gender
                  </label>
                  <Select
                    value={customerGender || "not-specified"}
                    onValueChange={(value) => setCustomerGender(value === "not-specified" ? null : value as "male" | "female" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="not-specified" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Not specified</SelectItem>
                      <SelectItem value="male" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Male</SelectItem>
                      <SelectItem value="female" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Female</SelectItem>
                      <SelectItem value="other" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    GST Number
                  </label>
                  <Input
                    value={customerGSTNumber}
                    onChange={(e) => setCustomerGSTNumber(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="GST123456789"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Address
                  </label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Notes
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569] resize-none"
                    placeholder="Additional notes about the customer..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                    style={{ color: '#ffffff' }}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50"
                  >
                    {createCustomerMutation.isPending ? "CREATING..." : "CREATE"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                EDIT_CUSTOMER
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                Update customer information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              {formError && (
                <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                  <p className="font-mono text-xs text-[#ef4444]">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Full Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Status
                  </label>
                  <Select
                    value={customerStatus || "active"}
                    onValueChange={(value) => setCustomerStatus(value as "active" | "inactive" | "blocked" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="active" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Active</SelectItem>
                      <SelectItem value="inactive" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Inactive</SelectItem>
                      <SelectItem value="blocked" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Customer Type
                  </label>
                  <Select
                    value={customerType || "individual"}
                    onValueChange={(value) => setCustomerType(value as "individual" | "company" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="individual" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Individual</SelectItem>
                      <SelectItem value="company" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Gender
                  </label>
                  <Select
                    value={customerGender || "not-specified"}
                    onValueChange={(value) => setCustomerGender(value === "not-specified" ? null : value as "male" | "female" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="not-specified" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Not specified</SelectItem>
                      <SelectItem value="male" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Male</SelectItem>
                      <SelectItem value="female" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Female</SelectItem>
                      <SelectItem value="other" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    GST Number
                  </label>
                  <Input
                    value={customerGSTNumber}
                    onChange={(e) => setCustomerGSTNumber(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="GST123456789"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Address
                  </label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Notes
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569] resize-none"
                    placeholder="Additional notes about the customer..."
                    rows={3}
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
                    disabled={updateCustomerMutation.isPending}
                    className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50"
                  >
                    {updateCustomerMutation.isPending ? "UPDATING..." : "UPDATE"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-2">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "..." : customers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#3b82f6]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-2">
                  Active Customers
                </p>
                <p className="text-3xl font-bold text-[#22d3ee]">
                  {isLoading ? "..." : activeCustomers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#22d3ee]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-2">
                  Inactive Customers
                </p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "..." : customers.filter((c: Customer) => c.customerStatus === "inactive").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#94a3b8]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-2">
                  Blocked Customers
                </p>
                <p className="text-3xl font-bold text-[#ef4444]">
                  {isLoading ? "..." : customers.filter((c: Customer) => c.customerStatus === "blocked").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#ef4444]" />
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
                placeholder="Search by name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1a1c1e] border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_CUSTOMERS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredCustomers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Customer ID
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Name
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Contact
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Vehicles
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Total Jobs
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Total Spent
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Last Visit
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Status
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[#94a3b8] font-mono">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[#ef4444] font-mono">
                    Error loading customers. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[#94a3b8] font-mono">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer: Customer) => (
                  <TableRow
                    key={customer.customerId}
                    className="border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleRowClick(customer)}
                  >
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {customer.customerId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {customer.customerName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.customerEmail && (
                          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                            <Mail className="h-3 w-3" />
                            <span className="font-mono">{customer.customerEmail}</span>
                          </div>
                        )}
                        {customer.customerPhone && (
                          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                            <Phone className="h-3 w-3" />
                            <span className="font-mono">{customer.customerPhone}</span>
                          </div>
                        )}
                        {!customer.customerEmail && !customer.customerPhone && (
                          <span className="font-mono text-xs text-[#94a3b8]">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-[#3b82f6]" />
                        <span className="font-mono text-sm text-white">
                          {getVehicleCount(customer.customerId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      -
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      -
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {customer.createdAt 
                        ? (() => {
                            try {
                              const date = customer.createdAt instanceof Date 
                                ? customer.createdAt 
                                : (customer.createdAt as { toDate?: () => Date; seconds?: number }).toDate?.() 
                                || new Date((customer.createdAt as { seconds: number }).seconds * 1000);
                              return date.toLocaleDateString();
                            } catch {
                              return "N/A";
                            }
                          })()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.customerStatus)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#3b82f6]/20"
                            onClick={(e) => e.stopPropagation()}
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
                              handleRowClick(customer);
                            }}
                            className="font-mono text-xs hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-2 text-[#22d3ee]" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="font-mono text-xs hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomer(customer);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2 text-[#3b82f6]" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                            <Car className="h-4 w-4 mr-2 text-[#3b82f6]" />
                            View Vehicles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer.customerId);
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

      {/* Customer Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#3b82f6]">
              CUSTOMER_DETAILS
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8] font-mono text-xs">
              View and manage customer information
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Customer ID
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerId}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Status
                  </label>
                  <div className="px-4 py-3">
                    {getStatusBadge(selectedCustomer.customerStatus)}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Name
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerName || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Type
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerType || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Email
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerEmail || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Phone
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerPhone || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Gender
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerGender || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    GST Number
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerGSTNumber || "N/A"}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Address
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {selectedCustomer.customerAddress || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Vehicles
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white flex items-center gap-2">
                    <Car className="h-4 w-4 text-[#3b82f6]" />
                    {getVehicleCount(selectedCustomer.customerId)}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Created At
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                    {formatDate(selectedCustomer.createdAt)}
                  </div>
                </div>
                {selectedCustomer.customerNotes && (
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                      Notes
                    </label>
                    <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white">
                      {selectedCustomer.customerNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    if (selectedCustomer) {
                      handleEditCustomer(selectedCustomer);
                    }
                  }}
                  className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#3b82f6] text-white hover:bg-[#2563eb] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  EDIT CUSTOMER
                </Button>
                <Button
                  onClick={() => handleDeleteCustomer(selectedCustomer.customerId)}
                  disabled={deleteCustomerMutation.isPending}
                  className="flex-1 font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#ef4444] text-white hover:bg-[#dc2626] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteCustomerMutation.isPending ? "DELETING..." : "DELETE"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
