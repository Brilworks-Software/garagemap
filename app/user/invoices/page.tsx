"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Receipt,
  Download,
  Eye,
  Loader2,
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
} from "@/components/ui/dialog";
import { colors, colorClasses } from "@/lib/colors";
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetInvoicesByServiceId, useGetInvoicesByJobId } from "@/firebase/hooks/useInvoice";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { Invoice } from "@/firebase/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFilter = searchParams.get("jobId");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get serviceId
  const serviceId = userData?.serviceId || "";

  // Get invoices
  const { data: allInvoices = [], isLoading: isLoadingInvoices, error: invoicesError } = useGetInvoicesByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  const { data: jobInvoices = [] } = useGetInvoicesByJobId(jobIdFilter || "", {
    enabled: !!jobIdFilter,
  });

  // Get customers for display
  const { data: customers = [] } = useGetCustomersByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Determine which invoices to show
  const invoices = useMemo(() => {
    if (jobIdFilter && jobInvoices.length > 0) {
      return jobInvoices;
    }
    return allInvoices;
  }, [jobIdFilter, jobInvoices, allInvoices]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer?.customerName || "Unknown Customer";
  };

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const customerName = getCustomerName(invoice.customerId);
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className={colorClasses.badgeSuccess}>
            Paid
          </Badge>
        );
      case "sent":
        return (
          <Badge className={colorClasses.badgeInfo}>
            Sent
          </Badge>
        );
      case "draft":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Draft
          </Badge>
        );
      case "overdue":
        return (
          <Badge className={colorClasses.badgeError}>
            Overdue
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Cancelled
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      alert("PDF not available for this invoice.");
    }
  };

  if (isLoadingInvoices) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`h-8 w-8 animate-spin ${colorClasses.textBlue}`} />
      </div>
    );
  }

  if (invoicesError) {
    return (
      <div className="text-center py-8">
        <p className={`font-mono text-sm ${colorClasses.textRed}`}>
          Error loading invoices: {(invoicesError as Error).message}
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoices = invoices.filter((inv) => inv.status === "sent" || inv.status === "draft");
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            INVOICES
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_AND_TRACK_INVOICES
            {jobIdFilter && ` (Filtered by Job)`}
          </p>
        </div>
        {!jobIdFilter && (
          <Button 
            className={`font-mono uppercase ${colorClasses.buttonPrimary}`}
            onClick={() => router.push('/user/jobs')}
          >
            <Plus className="h-4 w-4" />
            CREATE INVOICE
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Invoices</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{invoices.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Amount</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{formatCurrency(totalAmount)}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgCyan} rounded flex items-center justify-center`}>
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Pending</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
                  {pendingInvoices.length}
                </p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgRed} rounded flex items-center justify-center`}>
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Overdue</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
                  {overdueInvoices.length}
                </p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgRed} rounded flex items-center justify-center`}>
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
              <Input
                placeholder="Search invoices by ID or customer..."
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent 
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Status</SelectItem>
                <SelectItem value="paid" className={`${colorClasses.textPrimary} font-mono `}>Paid</SelectItem>
                <SelectItem value="pending" className={`${colorClasses.textPrimary} font-mono `}>Pending</SelectItem>
                <SelectItem value="overdue" className={`${colorClasses.textPrimary} font-mono `}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_INVOICES
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredInvoices.length} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Invoice ID</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Customer</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Job ID</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Amount</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Date</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Due Date</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Status</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.invoiceId} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {getCustomerName(invoice.customerId)}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {invoice.jobId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className={`h-4 w-4 ${colorClasses.textCyan}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgCyan}`}
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={!invoice.pdfUrl}
                        >
                          <Download className={`h-4 w-4 ${colorClasses.textCyan}`} />
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

      {/* Invoice Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              INVOICE_DETAILS
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Detailed information for {selectedInvoice?.invoiceNumber || "this invoice"}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className={`grid grid-cols-2 gap-4 text-sm font-mono ${colorClasses.textPrimary}`}>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Invoice ID</p>
                <p className={`${colorClasses.textPrimary} break-all`}>{selectedInvoice.invoiceId}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Invoice Number</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Customer</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{getCustomerName(selectedInvoice.customerId)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Job ID</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedInvoice.jobId}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Status</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedInvoice.status)}
                </div>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedInvoice.total)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Subtotal</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedInvoice.subtotal)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Tax</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedInvoice.tax)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Discount</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedInvoice.discount)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Issue Date</p>
                <p className={`${colorClasses.textPrimary}`}>{formatDate(selectedInvoice.issueDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Due Date</p>
                <p className={`${colorClasses.textPrimary}`}>{formatDate(selectedInvoice.dueDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Paid Date</p>
                <p className={`${colorClasses.textPrimary}`}>{formatDate(selectedInvoice.paidDate)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Created At</p>
                <p className={`${colorClasses.textPrimary}`}>{formatDate(selectedInvoice.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-2`}>Work Items</p>
                {selectedInvoice.workItems.length > 0 ? (
                  <div className={`${colorClasses.bgBase} ${colorClasses.borderDefault} rounded p-3 space-y-2 max-h-48 overflow-y-auto`}>
                    {selectedInvoice.workItems.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between ${colorClasses.bgSurface} p-2 rounded`}
                      >
                        <span className={`font-mono text-xs ${colorClasses.textPrimary} flex-1`}>
                          {index + 1}. {item.title}
                        </span>
                        <span className={`font-mono text-xs ${colorClasses.textCyan} ml-2`}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`${colorClasses.bgBase} ${colorClasses.borderDefault} rounded p-3`}>
                    <p className={`font-mono text-xs ${colorClasses.textSecondary} text-center`}>
                      No work items
                    </p>
                  </div>
                )}
              </div>
              {selectedInvoice.notes && (
                <div className="col-span-2">
                  <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Notes</p>
                  <p className={`${colorClasses.textPrimary} break-words whitespace-pre-wrap`}>{selectedInvoice.notes}</p>
                </div>
              )}
              <div className="col-span-2 flex gap-4 mt-4">
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  disabled={!selectedInvoice.pdfUrl}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {selectedInvoice.pdfUrl ? "DOWNLOAD PDF" : "PDF NOT AVAILABLE"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`h-8 w-8 animate-spin ${colorClasses.textBlue}`} />
      </div>
    }>
      <InvoicesContent />
    </Suspense>
  );
}
