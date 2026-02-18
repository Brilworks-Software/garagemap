"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
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

export default function SellProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const sales = [
    { id: "SALE-001", customer: "John Doe", items: 3, total: "$125.00", date: "2024-01-18", status: "Completed" },
    { id: "SALE-002", customer: "Jane Smith", items: 2, total: "$85.00", date: "2024-01-17", status: "Completed" },
    { id: "SALE-003", customer: "Mike Johnson", items: 5, total: "$245.00", date: "2024-01-16", status: "Pending" },
    { id: "SALE-004", customer: "Sarah Williams", items: 1, total: "$45.00", date: "2024-01-15", status: "Completed" },
  ];

  const filteredSales = sales.filter((sale) =>
    sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            SELL_PRODUCTS
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} PROCESS_SALES_AND_PRODUCT_TRANSACTIONS
          </p>
        </div>
        <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Plus className="h-4 w-4" />
          NEW SALE
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-white">{sales.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Today Revenue</p>
                <p className="text-2xl font-bold text-white">$450.00</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">This Month</p>
                <p className="text-2xl font-bold text-white">$12,450</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#3b82f6]" />
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
                  {sales.filter((sale) => sale.status === "Pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardContent className="pt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <Input
              placeholder="Search sales by ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            RECENT_SALES
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredSales.length} sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Sale ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Customer</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Items</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Total</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Date</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#94a3b8] font-mono">
                    No sales found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {sale.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {sale.customer}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {sale.items}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {sale.total}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {sale.date}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sale.status)}
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
