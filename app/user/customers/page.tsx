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
import { useGetJobsByServiceId } from "@/firebase/hooks/useJob";
import { Customer } from "@/firebase/types";
import { colors, colorClasses } from "@/lib/colors";

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

  // Get jobs for the service to count jobs per customer
  const { data: jobs = [] } = useGetJobsByServiceId(serviceId, {
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

  const getJobCount = (customerId: string) => {
    return jobs.filter((job) => job.customerId === customerId).length;
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
          <Badge className={colorClasses.badgeSuccess}>
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Inactive
          </Badge>
        );
      case "blocked":
        return (
          <Badge className={colorClasses.badgeError}>
            Blocked
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
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
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            CUSTOMER_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_CUSTOMER_RECORDS_AND_SERVICE_HISTORY
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
              <Plus className="h-4 w-4" />
              NEW CUSTOMER
            </Button>
          </DialogTrigger>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                ADD_NEW_CUSTOMER
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Register a new customer in the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Full Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select
                    value={customerStatus || "active"}
                    onValueChange={(value) => setCustomerStatus(value as "active" | "inactive" | "blocked" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono `}>Active</SelectItem>
                      <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono `}>Inactive</SelectItem>
                      <SelectItem value="blocked" className={`${colorClasses.textPrimary} font-mono `}>Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Customer Type
                  </label>
                  <Select
                    value={customerType || "individual"}
                    onValueChange={(value) => setCustomerType(value as "individual" | "company" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="individual" className={`${colorClasses.textPrimary} font-mono`}>Individual</SelectItem>
                      <SelectItem value="company" className={`${colorClasses.textPrimary} font-mono `}>Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Gender
                  </label>
                  <Select
                    value={customerGender || "not-specified"}
                    onValueChange={(value) => setCustomerGender(value === "not-specified" ? null : value as "male" | "female" | "other" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="not-specified" className={`${colorClasses.textPrimary} font-mono`}>Not specified</SelectItem>
                      <SelectItem value="male" className={`${colorClasses.textPrimary} font-mono`}>Male</SelectItem>
                      <SelectItem value="female" className={`${colorClasses.textPrimary} font-mono `}>Female</SelectItem>
                      <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono `}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    GST Number
                  </label>
                  <Input
                    value={customerGSTNumber}
                    onChange={(e) => setCustomerGSTNumber(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="GST123456789"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Address
                  </label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Notes
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none focus:border-[${colors.primary.blue}] focus:ring-1 focus:ring-[${colors.primary.blue}] transition-all duration-300 resize-none`}
                    placeholder="Additional notes about the customer..."
                    rows={3}
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
                    disabled={createCustomerMutation.isPending}
                    className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
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
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                EDIT_CUSTOMER
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Update customer information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Full Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select
                    value={customerStatus || "active"}
                    onValueChange={(value) => setCustomerStatus(value as "active" | "inactive" | "blocked" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono`}>Active</SelectItem>
                      <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono`}>Inactive</SelectItem>
                      <SelectItem value="blocked" className={`${colorClasses.textPrimary} font-mono`}>Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Customer Type
                  </label>
                  <Select
                    value={customerType || "individual"}
                    onValueChange={(value) => setCustomerType(value as "individual" | "company" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="individual" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Individual</SelectItem>
                      <SelectItem value="company" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Gender
                  </label>
                  <Select
                    value={customerGender || "not-specified"}
                    onValueChange={(value) => setCustomerGender(value === "not-specified" ? null : value as "male" | "female" | "other" | null)}
                  >
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="not-specified" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Not specified</SelectItem>
                      <SelectItem value="male" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Male</SelectItem>
                      <SelectItem value="female" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Female</SelectItem>
                      <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    GST Number
                  </label>
                  <Input
                    value={customerGSTNumber}
                    onChange={(e) => setCustomerGSTNumber(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="GST123456789"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Address
                  </label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Notes
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none focus:border-[${colors.primary.blue}] focus:ring-1 focus:ring-[${colors.primary.blue}] transition-all duration-300 resize-none`}
                    placeholder="Additional notes about the customer..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textPrimary}`}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCustomerMutation.isPending}
                    className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
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
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Total Customers
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textPrimary}`}>
                  {isLoading ? "..." : customers.length}
                </p>
              </div>
              <Users className={`h-8 w-8 ${colorClasses.textBlue}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Active Customers
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textCyan}`}>
                  {isLoading ? "..." : activeCustomers.length}
                </p>
              </div>
              <Users className={`h-8 w-8 ${colorClasses.textCyan}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Inactive Customers
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textPrimary}`}>
                  {isLoading ? "..." : customers.filter((c: Customer) => c.customerStatus === "inactive").length}
                </p>
              </div>
              <Users className={`h-8 w-8 ${colorClasses.textMuted}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-2`}>
                  Blocked Customers
                </p>
                <p className={`text-3xl font-bold ${colorClasses.textRed}`}>
                  {isLoading ? "..." : customers.filter((c: Customer) => c.customerStatus === "blocked").length}
                </p>
              </div>
              <Users className={`h-8 w-8 ${colorClasses.textRed}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`pl-10 ${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono text-sm`}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                style={{ backgroundColor: colors.background.input }}
                className={`w-full md:w-[200px] ${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
              >
                <Filter className={`h-4 w-4 mr-2 ${colorClasses.textSecondary}`} />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>All Status</SelectItem>
                <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Active</SelectItem>
                <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Inactive</SelectItem>
                <SelectItem value="blocked" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_CUSTOMERS
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredCustomers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Customer ID
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Name
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Contact
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Vehicles
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Total Jobs
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Last Visit
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Status
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary} text-right`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${colorClasses.textRed} font-mono`}>
                    Error loading customers. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer: Customer) => (
                  <TableRow
                    key={customer.customerId}
                    className={`${colorClasses.borderHover} hover:bg-white/5 cursor-pointer`}
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
                          <div className={`flex items-center gap-2 text-xs ${colorClasses.textSecondary}`}>
                            <Mail className="h-3 w-3" />
                            <span className="font-mono">{customer.customerEmail}</span>
                          </div>
                        )}
                        {customer.customerPhone && (
                          <div className={`flex items-center gap-2 text-xs ${colorClasses.textSecondary}`}>
                            <Phone className="h-3 w-3" />
                            <span className="font-mono">{customer.customerPhone}</span>
                          </div>
                        )}
                        {!customer.customerEmail && !customer.customerPhone && (
                          <span className={`font-mono text-xs ${colorClasses.textSecondary}`}>No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className={`h-4 w-4 ${colorClasses.textBlue}`} />
                        <span className="font-mono text-sm text-white">
                          {getVehicleCount(customer.customerId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {getJobCount(customer.customerId)}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
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
                            className={`h-8 w-8 p-0 hover:${colorClasses.bgBlueAlpha20}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className={`h-4 w-4 ${colorClasses.textSecondary}`} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          style={{ backgroundColor: colors.background.surface }}
                          className={colorClasses.borderInput}
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
                            <Eye className={`h-4 w-4 mr-2 ${colorClasses.textCyan}`} />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="font-mono text-xs hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomer(customer);
                            }}
                          >
                            <Edit className={`h-4 w-4 mr-2 ${colorClasses.textBlue}`} />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                            <Car className={`h-4 w-4 mr-2 ${colorClasses.textBlue}`} />
                            View Vehicles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer.customerId);
                            }}
                            className={`font-mono text-xs ${colorClasses.textRed} hover:${colorClasses.bgRedAlpha20}`}
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
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              CUSTOMER_DETAILS
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              View and manage customer information
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Customer ID
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerId}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <div className="px-4 py-3">
                    {getStatusBadge(selectedCustomer.customerStatus)}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Name
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerName || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Type
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerType || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Email
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerEmail || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Phone
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerPhone || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Gender
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerGender || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    GST Number
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerGSTNumber || "N/A"}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Address
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {selectedCustomer.customerAddress || "N/A"}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicles
                  </label>
                  <div className="bg-[#1a1c1e] border border-white/10 px-4 py-3 font-mono text-sm text-white flex items-center gap-2">
                    <Car className={`h-4 w-4 ${colorClasses.textBlue}`} />
                    {getVehicleCount(selectedCustomer.customerId)}
                  </div>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Created At
                  </label>
                  <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                    {formatDate(selectedCustomer.createdAt)}
                  </div>
                </div>
                {selectedCustomer.customerNotes && (
                  <div className="col-span-2">
                    <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                      Notes
                    </label>
                    <div 
                    style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}
                    className={`px-4 py-3 font-mono text-sm ${colorClasses.textPrimary}`}
                  >
                      {selectedCustomer.customerNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-4 pt-4 border-t ${colorClasses.borderDefault}`}>
                <Button
                  onClick={() => {
                    if (selectedCustomer) {
                      handleEditCustomer(selectedCustomer);
                    }
                  }}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  EDIT CUSTOMER
                </Button>
                <Button
                  onClick={() => handleDeleteCustomer(selectedCustomer.customerId)}
                  disabled={deleteCustomerMutation.isPending}
                  className={`flex-1 font-mono uppercase bg-[${colors.primary.red}] hover:bg-[${colors.primary.red}]/90 disabled:opacity-50`}
                  style={{ color: colors.text.buttonPrimary }}
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
