"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const transactions = [
    { id: "TXN-001", type: "Income", description: "Invoice Payment - INV-001", amount: "$450.00", date: "2024-01-18", status: "Completed" },
    { id: "TXN-002", type: "Income", description: "Invoice Payment - INV-002", amount: "$320.00", date: "2024-01-17", status: "Completed" },
    { id: "TXN-003", type: "Expense", description: "Parts Purchase", amount: "-$125.00", date: "2024-01-16", status: "Completed" },
    { id: "TXN-004", type: "Income", description: "Service Payment", amount: "$680.00", date: "2024-01-15", status: "Pending" },
    { id: "TXN-005", type: "Expense", description: "Supplier Payment", amount: "-$85.00", date: "2024-01-14", status: "Completed" },
  ];

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" || txn.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Income":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Income
          </Badge>
        );
      case "Expense":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Expense
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            Completed
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalIncome = transactions
    .filter((txn) => txn.type === "Income" && txn.status === "Completed")
    .reduce((sum, txn) => sum + parseFloat(txn.amount.replace("$", "")), 0);

  const totalExpense = transactions
    .filter((txn) => txn.type === "Expense" && txn.status === "Completed")
    .reduce((sum, txn) => sum + Math.abs(parseFloat(txn.amount.replace("$", ""))), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          TRANSACTIONS
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} TRACK_ALL_FINANCIAL_TRANSACTIONS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Income</p>
                <p className="text-2xl font-bold text-[#22d3ee]">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-[#ef4444]">${totalExpense.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Net Balance</p>
                <p className="text-2xl font-bold text-white">${(totalIncome - totalExpense).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-[#3b82f6]" />
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
                placeholder="Search transactions by ID or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1a1c1e] border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10">
                <SelectItem value="all" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">All Types</SelectItem>
                <SelectItem value="income" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Income</SelectItem>
                <SelectItem value="expense" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_TRANSACTIONS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Transaction ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Type</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Description</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Amount</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Date</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#94a3b8] font-mono">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {txn.id}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(txn.type)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {txn.description}
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${
                      txn.type === "Income" ? "text-[#22d3ee]" : "text-[#ef4444]"
                    }`}>
                      {txn.amount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {txn.date}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(txn.status)}
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
