"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  X,
  Receipt,
  Download,
  Check,
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
import { Label } from "@/components/ui/label";
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
import { AuthService } from "@/firebase/services/AuthService";
import { colors, colorClasses } from "@/lib/colors";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetJobsByServiceId, useCreateJob, useUpdateJob, useDeleteJob } from "@/firebase/hooks/useJob";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { useGetVehiclesByServiceId } from "@/firebase/hooks/useVehicle";
import { useGetInventoryByServiceId, useAdjustInventoryQuantity } from "@/firebase/hooks/useInventory";
import { useGetActiveMenuByServiceId } from "@/firebase/hooks/useMenu";
import { Job, JobWorkItem, Invoice, Inventory, MenuItem } from "@/firebase/types";
import { useCreateInvoice, useUpdateInvoice, useGetInvoicesByServiceId } from "@/firebase/hooks/useInvoice";
import { generateInvoicePDFBlob, generateInvoicePDFDataURL } from "@/lib/invoicePdf";
import { InvoiceStorageService } from "@/firebase/services/InvoiceStorageService";
import { useGetService } from "@/firebase/hooks/useService";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null);
  const [invoicePdfBlob, setInvoicePdfBlob] = useState<Blob | null>(null);
  const [paidDate, setPaidDate] = useState("");
  const [pendingInvoiceData, setPendingInvoiceData] = useState<{
    serviceId: string;
    invoiceData: Omit<Invoice, "invoiceId" | "serviceId" | "invoiceNumber" | "pdfUrl" | "createdAt" | "updatedAt">;
    invoiceNumber: string;
    pdfBlob: Blob;
  } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form state for new job
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [jobType, setJobType] = useState<"service" | "repair" | "maintenance" | "other" | null>("service");
  const [jobStatus, setJobStatus] = useState<"pending" | "in-progress" | "completed" | "cancelled" | null>("pending");
  const [jobAmount, setJobAmount] = useState("");
  const [jobEndDate, setJobEndDate] = useState("");
  const [jobStartDate, setJobStartDate] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [jobWorkList, setJobWorkList] = useState<JobWorkItem[]>([]);
  const [newWorkItem, setNewWorkItem] = useState("");
  const [newWorkItemPrice, setNewWorkItemPrice] = useState("");
  const [isWorkListModalOpen, setIsWorkListModalOpen] = useState(false);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get jobs for the service
  const serviceId = userData?.serviceId || "";
  const { data: jobs = [], isLoading, error } = useGetJobsByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Get customers and vehicles for dropdowns
  const { data: customers = [] } = useGetCustomersByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: vehicles = [] } = useGetVehiclesByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: inventoryItems = [] } = useGetInventoryByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: menuItems = [] } = useGetActiveMenuByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Get service data for invoice
  const { data: serviceData } = useGetService(serviceId, {
    enabled: !!serviceId,
  });

  // Get invoices to check for existing invoices
  const { data: invoices = [] } = useGetInvoicesByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Mutations
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const adjustInventoryMutation = useAdjustInventoryQuantity();

  // Filter vehicles by selected customer
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.customerId === selectedCustomerId
  );

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        setJobTitle("");
        setJobDescription("");
        setSelectedCustomerId("");
        setSelectedVehicleId("");
        setJobType("service");
        setJobStatus("pending");
        setJobAmount("");
        setJobEndDate("");
        setJobStartDate("");
        setJobNotes("");
        setJobWorkList([]);
        setNewWorkItem("");
        setNewWorkItemPrice("");
        setSelectedInventoryItemId("");
        setInventoryQuantity("");
        setSelectedMenuItemId("");
        setFormError("");
      }, 0);
    }
  }, [isDialogOpen]);

  // Reset form error when work item modal closes
  useEffect(() => {
    if (!isWorkListModalOpen) {
      setTimeout(() => {
        setFormError("");
      }, 0);
    }
  }, [isWorkListModalOpen]);

  const handleAddWorkItem = () => {
    // Clear any previous errors
    setFormError("");
    
    // Check if menu item is selected FIRST - this takes priority
    const selectedMenuItem = selectedMenuItemId ? menuItems.find((item: MenuItem) => item.menuId === selectedMenuItemId) : null;
    
    // PRIORITY 1: If menu item is selected, always use menu item price
    if (selectedMenuItem && newWorkItem.trim()) {
      // Always use menu item price, never inventory price
      const menuPrice = selectedMenuItem.price || 0;
      
      // If menu item has inventory linked, validate and include inventory info
      if (selectedMenuItem.inventoryItemId && selectedMenuItem.quantity) {
        const inventoryItem = inventoryItems.find(item => item.itemId === selectedMenuItem.inventoryItemId);
        if (inventoryItem) {
          const menuQuantity = selectedMenuItem.quantity;
          if (menuQuantity > inventoryItem.quantity) {
            setFormError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit || "units"}, Required: ${menuQuantity}`);
            return false;
          }
        }
        
        setJobWorkList([...jobWorkList, { 
          title: newWorkItem.trim(), 
          price: menuPrice, // ALWAYS use menu item price
          inventoryItemId: selectedMenuItem.inventoryItemId,
          quantity: selectedMenuItem.quantity
        }]);
      } else {
        // Menu item selected but no inventory linked
        setJobWorkList([...jobWorkList, { 
          title: newWorkItem.trim(), 
          price: menuPrice, // ALWAYS use menu item price
        }]);
      }
      
      setSelectedMenuItemId("");
      setNewWorkItem("");
      setNewWorkItemPrice("");
      setSelectedInventoryItemId("");
      setInventoryQuantity("");
      setFormError("");
      return true;
    }
    
    // PRIORITY 2: If inventory item is selected directly in manual entry section (no menu item)
    if (selectedInventoryItemId && inventoryQuantity && !selectedMenuItemId) {
      const inventoryItem = inventoryItems.find(item => item.itemId === selectedInventoryItemId);
      if (!inventoryItem) {
        setFormError("Selected inventory item not found.");
        return false;
      }
      const quantity = parseInt(inventoryQuantity) || 1;
      if (quantity <= 0) {
        setFormError("Quantity must be greater than 0.");
        return false;
      }
      if (quantity > inventoryItem.quantity) {
        setFormError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit || "units"}`);
        return false;
      }
      const price = (inventoryItem.sellingPrice || 0) * quantity;
      setJobWorkList([...jobWorkList, { 
        title: `${inventoryItem.itemName || 'Inventory Item'} (${quantity} ${inventoryItem.unit || 'unit'})`, 
        price,
        inventoryItemId: selectedInventoryItemId,
        quantity
      }]);
      setSelectedInventoryItemId("");
      setInventoryQuantity("");
      setNewWorkItem("");
      setNewWorkItemPrice("");
      setFormError("");
      return true;
    }
    
    // PRIORITY 3: Manual entry (no menu item, no direct inventory selection)
    if (newWorkItem.trim()) {
      // Always use the manually entered price (newWorkItemPrice)
      // This allows users to edit the price even when inventory is selected
      const price = parseFloat(newWorkItemPrice) || 0;
      
      // If inventory is selected, validate quantity and include inventory info
      if (selectedInventoryItemId && inventoryQuantity) {
        const inventoryItem = inventoryItems.find(item => item.itemId === selectedInventoryItemId);
        if (inventoryItem) {
          const quantity = parseInt(inventoryQuantity) || 1;
          if (quantity > inventoryItem.quantity) {
            setFormError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit || "units"}`);
            return false;
          }
          // Use manually entered price, not calculated from inventory
          setJobWorkList([...jobWorkList, { 
            title: newWorkItem.trim(), 
            price, // Use manually entered price
            inventoryItemId: selectedInventoryItemId,
            quantity
          }]);
        } else {
          setJobWorkList([...jobWorkList, { title: newWorkItem.trim(), price }]);
        }
      } else {
        // Pure manual entry - use entered price
        setJobWorkList([...jobWorkList, { title: newWorkItem.trim(), price }]);
      }
      
      setSelectedMenuItemId("");
      setNewWorkItem("");
      setNewWorkItemPrice("");
      setSelectedInventoryItemId("");
      setInventoryQuantity("");
      setFormError("");
      return true;
    }
    
    return false;
  };

  const handleRemoveWorkItem = (index: number) => {
    setJobWorkList(jobWorkList.filter((_, i) => i !== index));
  };

  // Reset vehicle selection when customer changes
  useEffect(() => {
    setTimeout(() => {
      setSelectedVehicleId("");
    }, 0);
  }, [selectedCustomerId]);

  const handleCreateJob = async (e: React.FormEvent) => {
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

    if (!selectedVehicleId) {
      setFormError("Please select a vehicle.");
      return;
    }

    if (!jobTitle) {
      setFormError("Job title is required.");
      return;
    }

    try {
      // Create the job first
      const jobId = await createJobMutation.mutateAsync({
        serviceId,
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        jobData: {
          jobTitle: jobTitle || null,
          jobDescription: jobDescription || null,
          jobType: jobType,
          jobStatus: jobStatus,
          jobAmount: jobAmount ? parseFloat(jobAmount) : null,
          jobDueDate: null,
          jobStartDate: jobStartDate ? new Date(jobStartDate) : null,
          jobEndDate: jobEndDate ? new Date(jobEndDate) : null,
          jobList: jobWorkList.length > 0 ? JSON.stringify(jobWorkList) : null,
          jobNotes: jobNotes || null,
        },
      });

      // Update inventory quantities for items used in the job
      for (const workItem of jobWorkList) {
        if (workItem.inventoryItemId && workItem.quantity) {
          try {
            await adjustInventoryMutation.mutateAsync({
              itemId: workItem.inventoryItemId,
              quantityChange: -workItem.quantity, // Negative to decrease
            });
          } catch (invError) {
            console.error(`Failed to update inventory for item ${workItem.inventoryItemId}:`, invError);
            // Continue with other items even if one fails
          }
        }
      }

      setIsDialogOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to create job. Please try again.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
        setIsDetailModalOpen(false);
        setSelectedJob(null);
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to delete job.");
      }
    }
  };

  const handleRowClick = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobTitle(job.jobTitle || "");
    setJobDescription(job.jobDescription || "");
    setSelectedCustomerId(job.customerId);
    setSelectedVehicleId(job.vehicleId);
    setJobType(job.jobType || "service");
    setJobStatus(job.jobStatus || "pending");
    setJobAmount(job.jobAmount?.toString() || "");
    
    // Handle date conversion for Firestore Timestamps
    const formatDateForInput = (date: Date | null | undefined) => {
      if (!date) return "";
      try {
        const dateObj = date instanceof Date 
          ? date 
          : (date as { toDate?: () => Date; seconds?: number }).toDate?.() 
          || new Date((date as { seconds: number }).seconds * 1000);
        return dateObj.toISOString().split('T')[0];
      } catch {
        return "";
      }
    };
    
    setJobEndDate(formatDateForInput(job.jobEndDate));
    setJobStartDate(formatDateForInput(job.jobStartDate));
    setJobNotes(job.jobNotes || "");
    if (job.jobList) {
      try {
        const workList = JSON.parse(job.jobList);
        // Handle both old format (string[]) and new format (JobWorkItem[])
        if (Array.isArray(workList)) {
          if (workList.length > 0 && typeof workList[0] === 'string') {
            // Convert old format to new format
            setJobWorkList(workList.map((item: string) => ({ title: item, price: 0 })));
          } else {
            setJobWorkList(workList);
          }
        } else {
          setJobWorkList([]);
        }
      } catch {
        setJobWorkList([]);
      }
    } else {
      setJobWorkList([]);
    }
    setIsEditDialogOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedJob) {
      setFormError("No job selected.");
      return;
    }

    if (!jobTitle) {
      setFormError("Job title is required.");
      return;
    }

    try {
      await updateJobMutation.mutateAsync({
        jobId: selectedJob.jobId,
        data: {
          jobTitle: jobTitle || null,
          jobDescription: jobDescription || null,
          jobType: jobType,
          jobStatus: jobStatus,
          jobAmount: jobAmount ? parseFloat(jobAmount) : null,
          jobDueDate: null,
          jobStartDate: jobStartDate ? new Date(jobStartDate) : null,
          jobEndDate: jobEndDate ? new Date(jobEndDate) : null,
          jobList: jobWorkList.length > 0 ? JSON.stringify(jobWorkList) : null,
          jobNotes: jobNotes || null,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedJob(null);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to update job. Please try again.");
    }
  };

  // Reset form when edit dialog closes
  useEffect(() => {
    if (!isEditDialogOpen) {
      setTimeout(() => {
        setJobTitle("");
        setJobDescription("");
        setSelectedCustomerId("");
        setSelectedVehicleId("");
        setJobType("service");
        setJobStatus("pending");
        setJobAmount("");
        setJobEndDate("");
        setJobStartDate("");
        setJobNotes("");
        setJobWorkList([]);
        setNewWorkItem("");
        setNewWorkItemPrice("");
        setSelectedMenuItemId("");
        setSelectedInventoryItemId("");
        setInventoryQuantity("");
        setFormError("");
        setSelectedJob(null);
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

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Calculate total from work items in job list
  const calculateJobTotal = (job: Job): number => {
    if (!job.jobList) return 0;
    try {
      const workItems: JobWorkItem[] = JSON.parse(job.jobList);
      if (Array.isArray(workItems)) {
        return workItems.reduce((sum, item) => sum + (item.price || 0), 0);
      }
    } catch (error) {
      console.error("Error parsing job list:", error);
    }
    return 0;
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer?.customerName || "Unknown Customer";
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    const parts = [
      vehicle.vehicleCompany,
      vehicle.vehicleModel,
      vehicle.vehicleYear?.toString(),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : vehicle.vehicleNumber || "Unknown Vehicle";
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`h-4 w-4 ${colorClasses.textCyan}`} />;
      case "in-progress":
        return <Clock className={`h-4 w-4 ${colorClasses.textBlue}`} />;
      case "pending":
        return <XCircle className={`h-4 w-4 ${colorClasses.textRed}`} />;
      case "cancelled":
        return <XCircle className={`h-4 w-4 ${colorClasses.textSecondary}`} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return (
          <Badge className={colorClasses.badgeSuccess}>
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className={colorClasses.badgeInfo}>
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className={colorClasses.badgeError}>
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Cancelled
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
    }
  };

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch =
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (job.jobDescription?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      getCustomerName(job.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVehicleInfo(job.vehicleId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (job.jobStatus?.toLowerCase() === statusFilter.toLowerCase() || false);
    return matchesSearch && matchesStatus;
  });

  const pendingJobs = jobs.filter((j: Job) => j.jobStatus === "pending");
  const inProgressJobs = jobs.filter((j: Job) => j.jobStatus === "in-progress");
  const completedJobs = jobs.filter((j: Job) => j.jobStatus === "completed");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`h-8 w-8 animate-spin ${colorClasses.textBlue}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className={`font-mono text-sm ${colorClasses.textRed}`}>
          Error loading jobs: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Jobs</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{jobs.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Pending</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{pendingJobs.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgRed} rounded flex items-center justify-center`}>
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>In Progress</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{inProgressJobs.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Completed</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{completedJobs.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgCyan} rounded flex items-center justify-center`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            JOB_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_WORKSHOP_JOBS_AND_SERVICE_REQUESTS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
              <Plus className="h-4 w-4" />
              NEW JOB
            </Button>
          </DialogTrigger>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                CREATE_NEW_JOB
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Add a new service job to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Job Title *
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Oil Change Service"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Job Type
                  </label>
                  <Select
                    value={jobType || "service"}
                    onValueChange={(value) => setJobType(value as "service" | "repair" | "maintenance" | "other" | null)}
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
                      <SelectItem value="service" className={`${colorClasses.textPrimary} font-mono `}>Service</SelectItem>
                      <SelectItem value="repair" className={`${colorClasses.textPrimary} font-mono `}>Repair</SelectItem>
                      <SelectItem value="maintenance" className={`${colorClasses.textPrimary} font-mono `}>Maintenance</SelectItem>
                      <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono `}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                      label: customer.customerName || "Unnamed Customer",
                    }))}
                    triggerStyle={{ backgroundColor: colors.background.input }}
                    triggerClassName={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    contentStyle={{ backgroundColor: colors.background.surface }}
                    contentClassName={colorClasses.borderInput}
                    itemClassName={`${colorClasses.textPrimary} font-mono`}
                    emptyMessage="No customers found"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Vehicle *
                  </label>
                  <SearchableSelect
                    value={selectedVehicleId}
                    onValueChange={setSelectedVehicleId}
                    disabled={!selectedCustomerId}
                    placeholder={selectedCustomerId ? "Select vehicle" : "Select customer first"}
                    searchPlaceholder="Search vehicles..."
                    items={availableVehicles.map((vehicle) => {
                      const vehicleInfo = [
                        vehicle.vehicleCompany,
                        vehicle.vehicleModel,
                        vehicle.vehicleYear?.toString(),
                      ].filter(Boolean).join(" ") || vehicle.vehicleNumber || "Unknown Vehicle";
                      return {
                        value: vehicle.vehicleId,
                        label: vehicleInfo,
                      };
                    })}
                    triggerStyle={{ backgroundColor: colors.background.input }}
                    triggerClassName={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
                    contentStyle={{ backgroundColor: colors.background.surface }}
                    contentClassName={colorClasses.borderInput}
                    itemClassName={`${colorClasses.textPrimary} font-mono`}
                    emptyMessage="No vehicles found"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select
                    value={jobStatus || "pending"}
                    onValueChange={(value) => setJobStatus(value as "pending" | "in-progress" | "completed" | "cancelled" | null)}
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
                      <SelectItem value="pending" className={`${colorClasses.textPrimary} font-mono`}>Pending</SelectItem>
                      <SelectItem value="in-progress" className={`${colorClasses.textPrimary} font-mono `}>In Progress</SelectItem>
                      <SelectItem value="completed" className={`${colorClasses.textPrimary} font-mono `}>Completed</SelectItem>
                      <SelectItem value="cancelled" className={`${colorClasses.textPrimary} font-mono`}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={jobStartDate}
                    onChange={(e) => setJobStartDate(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={jobEndDate}
                    onChange={(e) => setJobEndDate(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                  />
                </div>
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Description
                </label>
                <Input
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  placeholder="Job description..."
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Notes
                </label>
                <Input
                  value={jobNotes}
                  onChange={(e) => setJobNotes(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  placeholder="Additional notes..."
                />
              </div>
              
              {/* Job Work List / Todo List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                    Work List / Todo Items
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkListModalOpen(true)}
                    className={`font-mono text-xs uppercase ${colorClasses.buttonPrimary}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                {jobWorkList.length > 0 ? (
                  <div className={`rounded p-3 space-y-2 max-h-32 overflow-y-auto border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                    {jobWorkList.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded`}
                        style={{ backgroundColor: colors.background.surface }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs ${colorClasses.textPrimary}`}>
                              {index + 1}. {item.title}
                            </span>
                            {item.inventoryItemId && (
                              <Badge className={`${colorClasses.badgeInfo} text-[0.65rem]`}>
                                Inventory
                              </Badge>
                            )}
                          </div>
                          {item.quantity && (
                            <span className={`font-mono text-[0.65rem] ${colorClasses.textSecondary} block mt-1`}>
                              Qty: {item.quantity}
                            </span>
                          )}
                        </div>
                        <span className={`font-mono text-xs ${colorClasses.textCyan} ml-2 mr-2`}>
                          Rs. {item.price.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWorkItem(index)}
                          className={`h-6 w-6 p-0 ${colorClasses.iconBgRed}`}
                        >
                          <X className={`h-3 w-3 ${colorClasses.textRed}`} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`rounded p-4 text-center border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                    <p className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      No work items added. Click &quot;Add Item&quot; to create a todo list.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary}`}
                  style={{ color: colors.text.primary }}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={createJobMutation.isPending}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "CREATE JOB"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Work Item Modal - Shared between Create and Edit */}
        <Dialog open={isWorkListModalOpen} onOpenChange={setIsWorkListModalOpen}>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                ADD_WORK_ITEM
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Add a new item to the job work list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                  Select from Menu
                </Label>
                <SearchableSelect
                  placeholder="Select menu item (optional)"
                  items={[
                    {
                      value: "none",
                      label: "None - Manual Entry",
                      searchText: "none manual entry",
                      displayText: "None - Manual Entry",
                    },
                    ...menuItems.map((item: MenuItem) => ({
                      value: item.menuId,
                      label: (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          <span className={`ml-2 ${colorClasses.textCyan}`}>
                            Rs. {item.price.toFixed(2)}
                          </span>
                        </div>
                      ),
                      searchText: item.title,
                      displayText: item.title,
                    })),
                  ]}
                  value={selectedMenuItemId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedMenuItemId("");
                      setNewWorkItem("");
                      setNewWorkItemPrice("");
                      setSelectedInventoryItemId("");
                      setInventoryQuantity("");
                    } else {
                      setSelectedMenuItemId(value);
                      const menuItem = menuItems.find((item: MenuItem) => item.menuId === value);
                      if (menuItem) {
                        setNewWorkItem(menuItem.title);
                        // Always use menu item price, not inventory price
                        // Format price to 2 decimal places
                        setNewWorkItemPrice(menuItem.price.toFixed(2));
                        if (menuItem.inventoryItemId) {
                          setSelectedInventoryItemId(menuItem.inventoryItemId);
                          setInventoryQuantity(menuItem.quantity?.toString() || "1");
                        } else {
                          setSelectedInventoryItemId("");
                          setInventoryQuantity("");
                        }
                      }
                    }
                  }}
                  triggerStyle={{ backgroundColor: colors.background.input }}
                  contentStyle={{ backgroundColor: colors.background.surface }}
                />
              </div>

              <div className="space-y-2">
                <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                  Work Item Title *
                </Label>
                <Input
                  value={newWorkItem}
                  onChange={(e) => setNewWorkItem(e.target.value)}
                  placeholder="Enter work item title"
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} font-mono text-sm text-white`}
                />
              </div>

              <div className="space-y-2">
                <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                  Price (Rs.) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(() => {
                    // If menu item is selected, always show menu item price
                    if (selectedMenuItemId) {
                      const menuItem = menuItems.find((item: MenuItem) => item.menuId === selectedMenuItemId);
                      if (menuItem) {
                        return menuItem.price.toFixed(2);
                      }
                    }
                    // If inventory item is selected, calculate price from inventory * quantity
                    if (selectedInventoryItemId && inventoryQuantity && !selectedMenuItemId) {
                      const inventoryItem = inventoryItems.find((inv) => inv.itemId === selectedInventoryItemId);
                      if (inventoryItem) {
                        const qty = parseFloat(inventoryQuantity) || 1;
                        const calculatedPrice = (inventoryItem.sellingPrice || 0) * qty;
                        return calculatedPrice.toFixed(2);
                      }
                    }
                    return newWorkItemPrice;
                  })()}
                  onChange={(e) => {
                    // Only allow manual price edit if no menu item and no inventory item is selected
                    if (!selectedMenuItemId && !selectedInventoryItemId) {
                      setNewWorkItemPrice(e.target.value);
                    }
                  }}
                  readOnly={!!selectedMenuItemId || !!selectedInventoryItemId}
                  placeholder="0.00"
                  style={{ 
                    backgroundColor: colors.background.input,
                    opacity: (selectedMenuItemId || selectedInventoryItemId) ? 0.7 : 1,
                    cursor: (selectedMenuItemId || selectedInventoryItemId) ? "not-allowed" : "text"
                  }}
                  className={`${colorClasses.borderInput} font-mono text-sm text-white`}
                />
                {selectedMenuItemId && (
                  <p className={`font-mono text-xs ${colorClasses.textCyan} mt-1`}>
                    Price is set from menu item and cannot be edited
                  </p>
                )}
                {selectedInventoryItemId && !selectedMenuItemId && (
                  <p className={`font-mono text-xs ${colorClasses.textCyan} mt-1`}>
                    Price is calculated from inventory (Price × Quantity) and cannot be edited
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                  Inventory Item (Optional)
                </Label>
                <SearchableSelect
                  placeholder="Select inventory item (optional)"
                  items={[
                    { value: "none", label: "None - Manual Entry", searchText: "None - Manual Entry", displayText: "None - Manual Entry" },
                    ...inventoryItems
                      .filter((item) => item.status === "active")
                      .map((item) => ({
                        value: item.itemId,
                        label: (
                          <div className="flex items-center justify-between w-full">
                            <span>{item.itemName || item.itemCode || "Unnamed Item"}</span>
                            <span className={`ml-2 ${colorClasses.textCyan}`}>
                              Available: {item.quantity} {item.unit || ""}
                            </span>
                          </div>
                        ),
                        searchText: item.itemName || item.itemCode || "Unnamed Item",
                        displayText: item.itemName || item.itemCode || "Unnamed Item",
                      })),
                  ]}
                  value={selectedInventoryItemId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedInventoryItemId("");
                      setInventoryQuantity("");
                    } else {
                      setSelectedInventoryItemId(value);
                      const item = inventoryItems.find((inv) => inv.itemId === value);
                      if (item && !inventoryQuantity) {
                        setInventoryQuantity("1");
                      }
                      // Auto-fill price from inventory only if no menu item is selected
                      // Price will be calculated as: inventory price * quantity
                      if (!selectedMenuItemId) {
                        const inventoryItem = inventoryItems.find((inv) => inv.itemId === value);
                        if (inventoryItem) {
                          // Set quantity to 1 if not set, then calculate price
                          const qty = inventoryQuantity ? parseFloat(inventoryQuantity) || 1 : 1;
                          if (!inventoryQuantity) {
                            setInventoryQuantity("1");
                          }
                          // Calculate price: inventory price * quantity
                          const calculatedPrice = (inventoryItem.sellingPrice || 0) * qty;
                          setNewWorkItemPrice(calculatedPrice.toFixed(2));
                          setNewWorkItem(inventoryItem.itemName || inventoryItem.itemCode || "Inventory Item");
                        }
                      }
                    }
                  }}
                  triggerStyle={{ backgroundColor: colors.background.input }}
                  contentStyle={{ backgroundColor: colors.background.surface }}
                />
              </div>

              {selectedInventoryItemId && (
                <div className="space-y-2">
                  <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inventoryQuantity}
                    onChange={(e) => {
                      // Only allow editing if no menu item is selected
                      if (!selectedMenuItemId) {
                        setInventoryQuantity(e.target.value);
                        // Auto-update price when quantity changes (price = inventory price * quantity)
                        if (selectedInventoryItemId) {
                          const item = inventoryItems.find((inv) => inv.itemId === selectedInventoryItemId);
                          if (item && e.target.value) {
                            const qty = parseFloat(e.target.value) || 1;
                            const calculatedPrice = (item.sellingPrice || 0) * qty;
                            setNewWorkItemPrice(calculatedPrice.toFixed(2));
                          }
                        }
                      }
                    }}
                    readOnly={!!selectedMenuItemId}
                    placeholder="Enter quantity"
                    style={{ 
                      backgroundColor: colors.background.input,
                      opacity: selectedMenuItemId ? 0.7 : 1,
                      cursor: selectedMenuItemId ? "not-allowed" : "text"
                    }}
                    className={`${colorClasses.borderInput} font-mono text-sm text-white`}
                  />
                  {selectedMenuItemId && (
                    <p className={`font-mono text-xs ${colorClasses.textCyan} mt-1`}>
                      Quantity is set from menu item and cannot be edited
                    </p>
                  )}
                  {selectedInventoryItemId && inventoryQuantity && (() => {
                    const item = inventoryItems.find((inv) => inv.itemId === selectedInventoryItemId);
                    const requestedQty = parseFloat(inventoryQuantity);
                    const availableQty = item?.quantity || 0;
                    if (item && requestedQty > availableQty) {
                      return (
                        <p className={`font-mono text-xs ${colorClasses.textRed} mt-1`}>
                          ⚠️ Insufficient stock. Available: {availableQty} {item.unit || ""}, Requested: {requestedQty} {item.unit || ""}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: colors.border.input }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsWorkListModalOpen(false);
                    setNewWorkItem("");
                    setNewWorkItemPrice("");
                    setSelectedMenuItemId("");
                    setSelectedInventoryItemId("");
                    setInventoryQuantity("");
                  }}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary}`}
                >
                  CANCEL
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const success = handleAddWorkItem();
                    // Only close modal if item was successfully added (no error)
                    if (success) {
                      setIsWorkListModalOpen(false);
                    }
                  }}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                  disabled={!newWorkItem.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ADD ITEM
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                EDIT_JOB
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Update job information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Job Title *
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Oil Change Service"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Job Type
                  </label>
                  <Select
                    value={jobType || "service"}
                    onValueChange={(value) => setJobType(value as "service" | "repair" | "maintenance" | "other" | null)}
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
                      <SelectItem value="service" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Service</SelectItem>
                      <SelectItem value="repair" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Repair</SelectItem>
                      <SelectItem value="maintenance" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Maintenance</SelectItem>
                      <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select
                    value={jobStatus || "pending"}
                    onValueChange={(value) => setJobStatus(value as "pending" | "in-progress" | "completed" | "cancelled" | null)}
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
                      <SelectItem value="pending" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Pending</SelectItem>
                      <SelectItem value="in-progress" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>In Progress</SelectItem>
                      <SelectItem value="completed" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Completed</SelectItem>
                      <SelectItem value="cancelled" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={jobStartDate}
                    onChange={(e) => setJobStartDate(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={jobEndDate}
                    onChange={(e) => setJobEndDate(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                  />
                </div>
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Description
                </label>
                <Input
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  placeholder="Job description..."
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Notes
                </label>
                <Input
                  value={jobNotes}
                  onChange={(e) => setJobNotes(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  placeholder="Additional notes..."
                />
              </div>
              
              {/* Job Work List / Todo List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                    Work List / Todo Items
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkListModalOpen(true)}
                    className={`font-mono text-xs uppercase ${colorClasses.buttonPrimary}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                {jobWorkList.length > 0 ? (
                  <div className={`rounded p-3 space-y-2 max-h-32 overflow-y-auto border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                    {jobWorkList.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded`}
                        style={{ backgroundColor: colors.background.surface }}
                      >
                        <span className={`font-mono text-xs ${colorClasses.textPrimary} flex-1`}>
                          {index + 1}. {item.title}
                        </span>
                        <span className={`font-mono text-xs ${colorClasses.textCyan} ml-2 mr-2`}>
                          Rs. {item.price.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWorkItem(index)}
                          className={`h-6 w-6 p-0 ${colorClasses.iconBgRed}`}
                        >
                          <X className={`h-3 w-3 ${colorClasses.textRed}`} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`rounded p-4 text-center border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                    <p className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      No work items added. Click &quot;Add Item&quot; to create a todo list.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary}`}
                  style={{ color: colors.text.primary }}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={updateJobMutation.isPending}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  {updateJobMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "UPDATE JOB"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
              <Input
                placeholder="Search jobs by ID, customer, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`pl-10 ${colorClasses.borderInput} font-mono text-sm text-white`}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger 
                style={{ backgroundColor: colors.background.input }}
                className={`w-full md:w-[200px] ${colorClasses.borderInput} font-mono text-white`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" className="text-white"/>
              </SelectTrigger>
              <SelectContent 
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Status</SelectItem>
                <SelectItem value="pending" className={`${colorClasses.textPrimary} font-mono `}>Pending</SelectItem>
                <SelectItem value="in-progress" className={`${colorClasses.textPrimary} font-mono `}>In Progress</SelectItem>
                <SelectItem value="completed" className={`${colorClasses.textPrimary} font-mono `}>Completed</SelectItem>
                <SelectItem value="cancelled" className={`${colorClasses.textPrimary} font-mono `}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_JOBS
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredJobs.length} jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Job ID
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Customer
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Vehicle
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Description
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Status
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  Amount
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>
                  End Date
                </TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary} text-right`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job: Job) => (
                  <TableRow
                    key={job.jobId}
                    onClick={() => handleRowClick(job)}
                    className={`${colorClasses.borderHover} hover:bg-white/5 cursor-pointer`}
                  >
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {job.jobId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {getCustomerName(job.customerId)}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {getVehicleInfo(job.vehicleId)}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary} max-w-xs truncate`}>
                      {job.jobTitle || job.jobDescription || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.jobStatus)}
                        {getStatusBadge(job.jobStatus)}
                      </div>
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {formatCurrency(calculateJobTotal(job))}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      {formatDate(job.jobEndDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(job);
                          }}
                        >
                          <Eye className={`h-4 w-4 ${colorClasses.textCyan}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job);
                          }}
                        >
                          <Edit className={`h-4 w-4 ${colorClasses.textBlue}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgCyan}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/invoices?jobId=${job.jobId}`);
                          }}
                          title="See Invoice"
                        >
                          <Receipt className={`h-4 w-4 ${colorClasses.textCyan}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgRed}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.jobId);
                          }}
                        >
                          <Trash2 className={`h-4 w-4 ${colorClasses.textRed}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              JOB_DETAILS
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Detailed information for {selectedJob?.jobTitle || "this job"}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className={`grid grid-cols-2 gap-4 text-sm font-mono ${colorClasses.textPrimary}`}>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Job ID</p>
                <p className={`${colorClasses.textPrimary} break-all`}>{selectedJob.jobId}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Title</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedJob.jobTitle || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Customer</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{getCustomerName(selectedJob.customerId)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Vehicle</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{getVehicleInfo(selectedJob.vehicleId)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Type</p>
                <p className={`${colorClasses.textPrimary} capitalize break-words`}>{selectedJob.jobType || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedJob.jobStatus)}
                  {getStatusBadge(selectedJob.jobStatus)}
                </div>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Amount</p>
                <p className={colorClasses.textPrimary}>{formatCurrency(calculateJobTotal(selectedJob))}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>End Date</p>
                <p className={colorClasses.textPrimary}>{formatDate(selectedJob.jobEndDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Start Date</p>
                <p className={colorClasses.textPrimary}>{formatDate(selectedJob.jobStartDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>End Date</p>
                <p className={colorClasses.textPrimary}>{formatDate(selectedJob.jobEndDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Created At</p>
                <p className={colorClasses.textPrimary}>{formatDate(selectedJob.createdAt)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Updated At</p>
                <p className={colorClasses.textPrimary}>{formatDate(selectedJob.updatedAt)}</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Description</p>
                <p className={`${colorClasses.textPrimary} break-words whitespace-pre-wrap`}>{selectedJob.jobDescription || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Notes</p>
                <p className={`${colorClasses.textPrimary} break-words whitespace-pre-wrap`}>{selectedJob.jobNotes || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-2`}>Work List / Todo Items</p>
                {selectedJob.jobList ? (
                  <div className={`rounded p-3 space-y-2 max-h-48 overflow-y-auto border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                        {(() => {
                          try {
                            const workList = JSON.parse(selectedJob.jobList);
                            if (Array.isArray(workList) && workList.length > 0) {
                              // Handle both old format (string[]) and new format (JobWorkItem[])
                              const items = workList.map((item: string | JobWorkItem) => {
                                if (typeof item === 'string') {
                                  return { title: item, price: 0 };
                                }
                                return item;
                              });
                              return items.map((item: JobWorkItem, index: number) => (
                                <div
                                  key={index}
                                  className={`flex items-start justify-between gap-2 p-2 rounded`}
                                  style={{ backgroundColor: colors.background.surface }}
                                >
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className={`font-mono text-xs ${colorClasses.textBlue} mt-0.5`}>
                                      {index + 1}.
                                    </span>
                                    <span className={`font-mono text-xs ${colorClasses.textPrimary} flex-1 break-words`}>
                                      {item.title}
                                    </span>
                                  </div>
                                  <span className={`font-mono text-xs ${colorClasses.textCyan} ml-2`}>
                                    Rs. {item.price.toFixed(2)}
                                  </span>
                                </div>
                              ));
                            }
                          } catch {
                            // If parsing fails, display as plain text
                            return (
                              <div className={`p-2 rounded`} style={{ backgroundColor: colors.background.surface }}>
                                <span className={`font-mono text-xs ${colorClasses.textPrimary}`}>
                                  {selectedJob.jobList}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <p className={`font-mono text-xs ${colorClasses.textSecondary} text-center py-2`}>
                              No work items
                            </p>
                          );
                        })()}
                  </div>
                ) : (
                  <div className={`rounded p-3 border`} style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
                    <p className={`font-mono text-xs ${colorClasses.textSecondary} text-center`}>
                      No work list items
                    </p>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex gap-4 mt-4">
                <Button 
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                  onClick={async () => {
                    if (!selectedJob || !serviceId) return;
                    
                    try {
                      // Check if invoice already exists for this job
                      const existingInvoice = invoices.find(inv => inv.jobId === selectedJob.jobId);
                      if (existingInvoice) {
                        const confirmRegenerate = confirm(
                          `An invoice (${existingInvoice.invoiceNumber}) already exists for this job. ` +
                          "Do you want to view it instead of generating a new one?"
                        );
                        if (confirmRegenerate) {
                          router.push(`/user/invoices?jobId=${selectedJob.jobId}`);
                          return;
                        }
                      }
                      
                      // Parse work items from job
                      let workItems: JobWorkItem[] = [];
                      if (selectedJob.jobList) {
                        try {
                          const parsed = JSON.parse(selectedJob.jobList);
                          if (Array.isArray(parsed)) {
                            workItems = parsed.map((item: string | JobWorkItem) => {
                              if (typeof item === 'string') {
                                return { title: item, price: 0 };
                              }
                              return item;
                            });
                          }
                        } catch {
                          // If parsing fails, skip
                        }
                      }
                      
                      if (workItems.length === 0) {
                        alert("No work items found. Please add work items with prices to generate an invoice.");
                        return;
                      }
                      
                      // Get customer and vehicle info
                      const customer = customers.find(c => c.customerId === selectedJob.customerId);
                      const vehicle = vehicles.find(v => v.vehicleId === selectedJob.vehicleId);
                      
                      if (!customer) {
                        alert("Customer not found.");
                        return;
                      }
                      
                      // Calculate totals
                      const subtotal = workItems.reduce((sum, item) => sum + item.price, 0);
                      
                      // Check if customer is company type and add GST
                      const isCompany = customer.customerType === "company";
                      const gstRate = 0.18; // 18% GST
                      const tax = isCompany ? subtotal * gstRate : 0;
                      
                      const discount = 0; // Can be configured later
                      const total = subtotal + tax - discount;
                      
                      // Generate invoice number
                      const now = new Date();
                      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
                      const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                      const invoiceNumber = `INV-${dateStr}-${randomStr}`;
                      
                      // Handle date conversion
                      const issueDate = new Date();
                      let dueDate: Date | null = null;
                      if (selectedJob.jobEndDate) {
                        try {
                          dueDate = selectedJob.jobEndDate instanceof Date 
                            ? selectedJob.jobEndDate 
                            : (selectedJob.jobEndDate as { toDate?: () => Date; seconds?: number }).toDate?.() 
                            || new Date((selectedJob.jobEndDate as { seconds: number }).seconds * 1000);
                        } catch {
                          dueDate = null;
                        }
                      }
                      
                      // Get vehicle info string
                      const vehicleInfo = vehicle 
                        ? [vehicle.vehicleCompany, vehicle.vehicleModel, vehicle.vehicleYear?.toString(), vehicle.vehicleNumber]
                            .filter(Boolean).join(" ") || "Unknown Vehicle"
                        : "Unknown Vehicle";
                      
                      // Generate PDF
                      const pdfData = {
                        invoiceNumber,
                        issueDate,
                        dueDate,
                        customerName: customer.customerName || "Unknown Customer",
                        customerEmail: customer.customerEmail,
                        customerPhone: customer.customerPhone,
                        customerAddress: customer.customerAddress,
                        vehicleInfo,
                        workItems,
                        subtotal,
                        tax,
                        discount,
                        total,
                        serviceName: serviceData?.serviceName || null,
                        serviceGSTNumber: serviceData?.serviceGSTNumber || null,
                        servicePhone: serviceData?.phoneNumber || null,
                        serviceAddress: serviceData?.address || null,
                        notes: selectedJob.jobNotes || null,
                        isGST: isCompany,
                        gstNumber: customer.customerGSTNumber || null,
                      };
                      
                      const pdfBlob = generateInvoicePDFBlob(pdfData);
                      const previewUrl = generateInvoicePDFDataURL(pdfData);
                      
                      // Store data for confirmation
                      setPendingInvoiceData({
                        serviceId,
                        invoiceData: {
                          jobId: selectedJob.jobId,
                          customerId: selectedJob.customerId,
                          vehicleId: selectedJob.vehicleId,
                          workItems,
                          subtotal,
                          tax,
                          discount,
                          total,
                          status: "sent" as const,
                          issueDate,
                          dueDate,
                          paidDate: null,
                          notes: selectedJob.jobNotes || null,
                        },
                        invoiceNumber,
                        pdfBlob,
                      });
                      
                      setInvoicePdfBlob(pdfBlob);
                      setInvoicePreviewUrl(previewUrl);
                      setIsInvoicePreviewOpen(true);
                    } catch (err) {
                      alert((err as Error).message || "Failed to generate invoice preview.");
                    }
                  }}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  GENERATE BILL
                </Button>
                <Button 
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                  onClick={() => {
                    if (selectedJob) {
                      handleEditJob(selectedJob);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" /> EDIT JOB
                </Button>
                <Button
                  variant="destructive"
                  className={`flex-1 font-mono uppercase bg-[${colors.primary.red}] hover:bg-[${colors.primary.red}]/90`}
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDeleteJob(selectedJob.jobId);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> DELETE JOB
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              INVOICE_PREVIEW
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Review your invoice before confirming. You can download it after confirmation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto border rounded" style={{ borderColor: colors.border.input }}>
            {invoicePreviewUrl && (
              <iframe
                src={invoicePreviewUrl}
                className="w-full h-full min-h-[600px]"
                style={{ border: 'none' }}
              />
            )}
          </div>
          
          {/* Paid Date Selection */}
          <div className="mt-4 p-4 border rounded" style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
            <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
              Paid Date (Optional)
            </label>
            <Input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              style={{ backgroundColor: colors.background.surface }}
              className={colorClasses.borderInput}
              placeholder="Select paid date if invoice is already paid"
            />
            <p className={`font-mono text-xs ${colorClasses.textSecondary} mt-2`}>
              {paidDate 
                ? "Invoice will be marked as 'Paid' with the selected date."
                : "Leave empty if invoice is not yet paid. You can update it later."}
            </p>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsInvoicePreviewOpen(false);
                setInvoicePreviewUrl(null);
                setInvoicePdfBlob(null);
                setPendingInvoiceData(null);
                setPaidDate("");
              }}
              className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textPrimary}`}
            >
              CANCEL
            </Button>
            <Button
              onClick={async () => {
                if (!pendingInvoiceData || !invoicePdfBlob) return;
                
                try {
                  // Prepare invoice data with paid date if provided
                  const invoiceData = {
                    ...pendingInvoiceData.invoiceData,
                    paidDate: paidDate ? new Date(paidDate) : null,
                    status: (paidDate ? "paid" : pendingInvoiceData.invoiceData.status) as "sent" | "paid" | "overdue" | "cancelled",
                  };
                  
                  // Create invoice in Firestore
                  const invoiceId = await createInvoiceMutation.mutateAsync({
                    serviceId: pendingInvoiceData.serviceId,
                    invoiceData,
                  });
                  
                  // Upload PDF to Firebase Storage
                  const pdfUrl = await InvoiceStorageService.uploadInvoicePDF(invoiceId, invoicePdfBlob);
                  
                  // Update invoice with PDF URL
                  await updateInvoiceMutation.mutateAsync({
                    invoiceId,
                    data: { pdfUrl },
                  });
                  
                  // Download PDF
                  const url = URL.createObjectURL(invoicePdfBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${pendingInvoiceData.invoiceNumber}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  alert("Invoice generated and saved successfully!");
                  setIsInvoicePreviewOpen(false);
                  setIsDetailModalOpen(false);
                  setInvoicePreviewUrl(null);
                  setInvoicePdfBlob(null);
                  setPendingInvoiceData(null);
                  setPaidDate("");
                } catch (err) {
                  alert((err as Error).message || "Failed to save invoice.");
                }
              }}
              disabled={createInvoiceMutation.isPending}
              className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
            >
              {createInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  CONFIRM & SAVE
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!invoicePdfBlob) return;
                const url = URL.createObjectURL(invoicePdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${pendingInvoiceData?.invoiceNumber || 'invoice'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className={`font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textPrimary}`}
            >
              <Download className="h-4 w-4 mr-2" />
              DOWNLOAD
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
