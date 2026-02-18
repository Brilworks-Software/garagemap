"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Receipt,
  Download,
  Eye,
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

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const invoices = [
    { id: "INV-001", customer: "John Doe", amount: "$450.00", date: "2024-01-18", dueDate: "2024-02-18", status: "Paid", jobId: "JOB-001" },
    { id: "INV-002", customer: "Jane Smith", amount: "$320.00", date: "2024-01-17", dueDate: "2024-02-17", status: "Paid", jobId: "JOB-002" },
    { id: "INV-003", customer: "Mike Johnson", amount: "$680.00", date: "2024-01-16", dueDate: "2024-02-16", status: "Pending", jobId: "JOB-003" },
    { id: "INV-004", customer: "Sarah Williams", amount: "$890.00", date: "2024-01-15", dueDate: "2024-02-15", status: "Overdue", jobId: "JOB-004" },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Pending
          </Badge>
        );
      case "Overdue":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Overdue
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            INVOICES
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_AND_TRACK_INVOICES
          </p>
        </div>
        <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Plus className="h-4 w-4" />
          CREATE INVOICE
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-white">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Receipt className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-white">$2,340.00</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <Receipt className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {invoices.filter((inv) => inv.status === "Pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <Receipt className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Overdue</p>
                <p className="text-2xl font-bold text-white">
                  {invoices.filter((inv) => inv.status === "Overdue").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <Receipt className="h-6 w-6 text-[#ef4444]" />
              </div>
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
                placeholder="Search invoices by ID or customer..."
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
                <SelectItem value="all" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">All Status</SelectItem>
                <SelectItem value="paid" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Paid</SelectItem>
                <SelectItem value="pending" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Pending</SelectItem>
                <SelectItem value="overdue" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_INVOICES
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredInvoices.length} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Invoice ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Customer</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Job ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Amount</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Date</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Due Date</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#94a3b8] font-mono">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {invoice.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {invoice.customer}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {invoice.jobId}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {invoice.amount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {invoice.date}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {invoice.dueDate}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
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
    </div>
  );
}
