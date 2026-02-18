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
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetJobsByServiceId, useCreateJob, useUpdateJob, useDeleteJob } from "@/firebase/hooks/useJob";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { useGetVehiclesByServiceId } from "@/firebase/hooks/useVehicle";
import { Job } from "@/firebase/types";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form state for new job
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [jobType, setJobType] = useState<"service" | "repair" | "maintenance" | "other" | null>("service");
  const [jobStatus, setJobStatus] = useState<"pending" | "in-progress" | "completed" | "cancelled" | null>("pending");
  const [jobAmount, setJobAmount] = useState("");
  const [jobDueDate, setJobDueDate] = useState("");
  const [jobStartDate, setJobStartDate] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [jobWorkList, setJobWorkList] = useState<string[]>([]);
  const [newWorkItem, setNewWorkItem] = useState("");
  const [isWorkListModalOpen, setIsWorkListModalOpen] = useState(false);
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

  // Mutations
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();

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
        setJobDueDate("");
        setJobStartDate("");
        setJobNotes("");
        setJobWorkList([]);
        setNewWorkItem("");
        setFormError("");
      }, 0);
    }
  }, [isDialogOpen]);

  const handleAddWorkItem = () => {
    if (newWorkItem.trim()) {
      setJobWorkList([...jobWorkList, newWorkItem.trim()]);
      setNewWorkItem("");
    }
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
      await createJobMutation.mutateAsync({
        serviceId,
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        jobData: {
          jobTitle: jobTitle || null,
          jobDescription: jobDescription || null,
          jobType: jobType,
          jobStatus: jobStatus,
          jobAmount: jobAmount ? parseFloat(jobAmount) : null,
          jobDueDate: jobDueDate ? new Date(jobDueDate) : null,
          jobStartDate: jobStartDate ? new Date(jobStartDate) : null,
          jobEndDate: null,
          jobList: jobWorkList.length > 0 ? JSON.stringify(jobWorkList) : null,
          jobNotes: jobNotes || null,
        },
      });
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
    
    setJobDueDate(formatDateForInput(job.jobDueDate));
    setJobStartDate(formatDateForInput(job.jobStartDate));
    setJobNotes(job.jobNotes || "");
    if (job.jobList) {
      try {
        const workList = JSON.parse(job.jobList);
        setJobWorkList(Array.isArray(workList) ? workList : []);
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
          jobDueDate: jobDueDate ? new Date(jobDueDate) : null,
          jobStartDate: jobStartDate ? new Date(jobStartDate) : null,
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
        setJobDueDate("");
        setJobStartDate("");
        setJobNotes("");
        setJobWorkList([]);
        setNewWorkItem("");
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
    return `$${amount.toFixed(2)}`;
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
        return <CheckCircle2 className="h-4 w-4 text-[#22d3ee]" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-[#3b82f6]" />;
      case "pending":
        return <XCircle className="h-4 w-4 text-[#ef4444]" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-[#94a3b8]" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-[#94a3b8]/20 text-[#94a3b8] hover:bg-[#94a3b8]/30">
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="bg-[#94a3b8]/20 text-[#94a3b8]">Unknown</Badge>;
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
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="font-mono text-sm text-[#ef4444]">
          Error loading jobs: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">{pendingJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <XCircle className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">In Progress</p>
                <p className="text-2xl font-bold text-white">{inProgressJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Completed</p>
                <p className="text-2xl font-bold text-white">{completedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            JOB_MANAGEMENT
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_WORKSHOP_JOBS_AND_SERVICE_REQUESTS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              <Plus className="h-4 w-4" />
              NEW JOB
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                CREATE_NEW_JOB
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                Add a new service job to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              {formError && (
                <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                  <p className="font-mono text-xs text-[#ef4444]">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Job Title *
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="Oil Change Service"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Job Type
                  </label>
                  <Select
                    value={jobType || "service"}
                    onValueChange={(value) => setJobType(value as "service" | "repair" | "maintenance" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="service" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Service</SelectItem>
                      <SelectItem value="repair" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Repair</SelectItem>
                      <SelectItem value="maintenance" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Maintenance</SelectItem>
                      <SelectItem value="other" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Customer *
                  </label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      {customers.map((customer) => (
                        <SelectItem key={customer.customerId} value={customer.customerId} className="text-white font-mono hover:bg-white/10 focus:bg-white/10">
                          {customer.customerName || "Unnamed Customer"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Vehicle *
                  </label>
                  <Select
                    value={selectedVehicleId}
                    onValueChange={setSelectedVehicleId}
                    disabled={!selectedCustomerId}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder={selectedCustomerId ? "Select vehicle" : "Select customer first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      {availableVehicles.map((vehicle) => {
                        const vehicleInfo = [
                          vehicle.vehicleCompany,
                          vehicle.vehicleModel,
                          vehicle.vehicleYear?.toString(),
                        ].filter(Boolean).join(" ") || vehicle.vehicleNumber || "Unknown Vehicle";
                        return (
                          <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId} className="text-white font-mono hover:bg-white/10 focus:bg-white/10">
                            {vehicleInfo}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Status
                  </label>
                  <Select
                    value={jobStatus || "pending"}
                    onValueChange={(value) => setJobStatus(value as "pending" | "in-progress" | "completed" | "cancelled" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="pending" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Pending</SelectItem>
                      <SelectItem value="in-progress" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={jobAmount}
                    onChange={(e) => setJobAmount(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={jobStartDate}
                    onChange={(e) => setJobStartDate(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={jobDueDate}
                    onChange={(e) => setJobDueDate(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                  Description
                </label>
                <Input
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="bg-[#1a1c1e] border-white/10"
                  placeholder="Job description..."
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                  Notes
                </label>
                <Input
                  value={jobNotes}
                  onChange={(e) => setJobNotes(e.target.value)}
                  className="bg-[#1a1c1e] border-white/10"
                  placeholder="Additional notes..."
                />
              </div>
              
              {/* Job Work List / Todo List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-[#94a3b8] uppercase">
                    Work List / Todo Items
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkListModalOpen(true)}
                    className="font-mono text-xs uppercase text-black"
                  >
                    <Plus className="h-3 w-3 mr-1 text-black" />
                    Add Item
                  </Button>
                </div>
                {jobWorkList.length > 0 ? (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-3 space-y-2 max-h-32 overflow-y-auto">
                    {jobWorkList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#25282c] p-2 rounded"
                      >
                        <span className="font-mono text-xs text-white flex-1">
                          {index + 1}. {item}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWorkItem(index)}
                          className="h-6 w-6 p-0 hover:bg-[#ef4444]/20"
                        >
                          <X className="h-3 w-3 text-[#ef4444]" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-4 text-center">
                    <p className="font-mono text-xs text-[#94a3b8]">
                      No work items added. Click &quot;Add Item&quot; to create a todo list.
                    </p>
                  </div>
                )}
              </div>

              {/* Add Work Item Modal */}
              <Dialog open={isWorkListModalOpen} onOpenChange={setIsWorkListModalOpen}>
                <DialogContent className="bg-[#25282c] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                      ADD_WORK_ITEM
                    </DialogTitle>
                    <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                      Add a new item to the job work list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                        Work Item Description
                      </label>
                      <Input
                        value={newWorkItem}
                        onChange={(e) => setNewWorkItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddWorkItem();
                          }
                        }}
                        className="bg-[#1a1c1e] border-white/10"
                        placeholder="e.g., Change engine oil, Replace brake pads"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsWorkListModalOpen(false);
                          setNewWorkItem("");
                        }}
                        className="flex-1 font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                        style={{ color: '#ffffff' }}
                      >
                        CANCEL
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          handleAddWorkItem();
                          setIsWorkListModalOpen(false);
                        }}
                        className="flex-1 font-mono uppercase"
                        disabled={!newWorkItem.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        ADD ITEM
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-4">
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
                  disabled={createJobMutation.isPending}
                  className="flex-1 font-mono uppercase"
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

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-[#3b82f6]">
                EDIT_JOB
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] font-mono text-xs">
                Update job information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              {formError && (
                <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                  <p className="font-mono text-xs text-[#ef4444]">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Job Title *
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="Oil Change Service"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Job Type
                  </label>
                  <Select
                    value={jobType || "service"}
                    onValueChange={(value) => setJobType(value as "service" | "repair" | "maintenance" | "other" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="service" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Service</SelectItem>
                      <SelectItem value="repair" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Repair</SelectItem>
                      <SelectItem value="maintenance" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Maintenance</SelectItem>
                      <SelectItem value="other" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Status
                  </label>
                  <Select
                    value={jobStatus || "pending"}
                    onValueChange={(value) => setJobStatus(value as "pending" | "in-progress" | "completed" | "cancelled" | null)}
                  >
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 text-white font-mono">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="pending" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Pending</SelectItem>
                      <SelectItem value="in-progress" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={jobAmount}
                    onChange={(e) => setJobAmount(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={jobStartDate}
                    onChange={(e) => setJobStartDate(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={jobDueDate}
                    onChange={(e) => setJobDueDate(e.target.value)}
                    className="bg-[#1a1c1e] border-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                  Description
                </label>
                <Input
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="bg-[#1a1c1e] border-white/10"
                  placeholder="Job description..."
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#94a3b8] mb-2 uppercase">
                  Notes
                </label>
                <Input
                  value={jobNotes}
                  onChange={(e) => setJobNotes(e.target.value)}
                  className="bg-[#1a1c1e] border-white/10"
                  placeholder="Additional notes..."
                />
              </div>
              
              {/* Job Work List / Todo List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-[#94a3b8] uppercase">
                    Work List / Todo Items
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkListModalOpen(true)}
                    className="font-mono text-xs uppercase text-black"
                  >
                    <Plus className="h-3 w-3 mr-1 text-black" />
                    Add Item
                  </Button>
                </div>
                {jobWorkList.length > 0 ? (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-3 space-y-2 max-h-32 overflow-y-auto">
                    {jobWorkList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#25282c] p-2 rounded"
                      >
                        <span className="font-mono text-xs text-white flex-1">
                          {index + 1}. {item}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWorkItem(index)}
                          className="h-6 w-6 p-0 hover:bg-[#ef4444]/20"
                        >
                          <X className="h-3 w-3 text-[#ef4444]" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-4 text-center">
                    <p className="font-mono text-xs text-[#94a3b8]">
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
                  className="flex-1 font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                  style={{ color: '#ffffff' }}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={updateJobMutation.isPending}
                  className="flex-1 font-mono uppercase"
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
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <Input
                placeholder="Search jobs by ID, customer, or vehicle..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_JOBS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredJobs.length} jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Job ID
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Customer
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Vehicle
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Description
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Status
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Amount
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">
                  Due Date
                </TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#94a3b8] font-mono">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job: Job) => (
                  <TableRow
                    key={job.jobId}
                    onClick={() => handleRowClick(job)}
                    className="border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {job.jobId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {getCustomerName(job.customerId)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {getVehicleInfo(job.vehicleId)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8] max-w-xs truncate">
                      {job.jobTitle || job.jobDescription || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.jobStatus)}
                        {getStatusBadge(job.jobStatus)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {formatCurrency(job.jobAmount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {formatDate(job.jobDueDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#3b82f6]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(job);
                          }}
                        >
                          <Eye className="h-4 w-4 text-[#22d3ee]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#3b82f6]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job);
                          }}
                        >
                          <Edit className="h-4 w-4 text-[#3b82f6]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#ef4444]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.jobId);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-[#ef4444]" />
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
        <DialogContent className="bg-[#25282c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#3b82f6]">
              JOB_DETAILS
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8] font-mono text-xs">
              Detailed information for {selectedJob?.jobTitle || "this job"}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="grid grid-cols-2 gap-4 text-sm font-mono text-white">
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Job ID</p>
                <p className="text-white break-all">{selectedJob.jobId}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Title</p>
                <p className="text-white break-words">{selectedJob.jobTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Customer</p>
                <p className="text-white break-words">{getCustomerName(selectedJob.customerId)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Vehicle</p>
                <p className="text-white break-words">{getVehicleInfo(selectedJob.vehicleId)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Type</p>
                <p className="text-white capitalize break-words">{selectedJob.jobType || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedJob.jobStatus)}
                  {getStatusBadge(selectedJob.jobStatus)}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Amount</p>
                <p className="text-white">{formatCurrency(selectedJob.jobAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Due Date</p>
                <p className="text-white">{formatDate(selectedJob.jobDueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Start Date</p>
                <p className="text-white">{formatDate(selectedJob.jobStartDate)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">End Date</p>
                <p className="text-white">{formatDate(selectedJob.jobEndDate)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Created At</p>
                <p className="text-white">{formatDate(selectedJob.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Updated At</p>
                <p className="text-white">{formatDate(selectedJob.updatedAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Description</p>
                <p className="text-white break-words whitespace-pre-wrap">{selectedJob.jobDescription || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#94a3b8] uppercase mb-1">Notes</p>
                <p className="text-white break-words whitespace-pre-wrap">{selectedJob.jobNotes || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#94a3b8] uppercase mb-2">Work List / Todo Items</p>
                {selectedJob.jobList ? (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-3 space-y-2 max-h-48 overflow-y-auto">
                    {(() => {
                      try {
                        const workList = JSON.parse(selectedJob.jobList);
                        if (Array.isArray(workList) && workList.length > 0) {
                          return workList.map((item: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 bg-[#25282c] p-2 rounded"
                            >
                              <span className="font-mono text-xs text-[#3b82f6] mt-0.5">
                                {index + 1}.
                              </span>
                              <span className="font-mono text-xs text-white flex-1 break-words">
                                {item}
                              </span>
                            </div>
                          ));
                        }
                      } catch {
                        // If parsing fails, display as plain text
                        return (
                          <div className="bg-[#25282c] p-2 rounded">
                            <span className="font-mono text-xs text-white">
                              {selectedJob.jobList}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p className="font-mono text-xs text-[#94a3b8] text-center py-2">
                          No work items
                        </p>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-[#1a1c1e] border border-white/10 rounded p-3">
                    <p className="font-mono text-xs text-[#94a3b8] text-center">
                      No work list items
                    </p>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex gap-4 mt-4">
                <Button 
                  className="flex-1 font-mono uppercase"
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
                  className="flex-1 font-mono uppercase"
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
    </div>
  );
}
