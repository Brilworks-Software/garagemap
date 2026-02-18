"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Boxes,
  AlertTriangle,
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

export default function PartsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const parts = [
    { id: "PART-001", name: "Brake Pads - Front", vehicleType: "Car", stock: 12, price: "$45.00", status: "In Stock", supplier: "AutoParts Co." },
    { id: "PART-002", name: "Spark Plugs Set", vehicleType: "Car", stock: 28, price: "$8.00", status: "In Stock", supplier: "Engine Parts Ltd." },
    { id: "PART-003", name: "Timing Belt", vehicleType: "Car", stock: 5, price: "$85.00", status: "Low Stock", supplier: "Belt Systems Inc." },
    { id: "PART-004", name: "Headlight Assembly", vehicleType: "Car", stock: 8, price: "$120.00", status: "In Stock", supplier: "Lighting Solutions" },
    { id: "PART-005", name: "Wiper Blades", vehicleType: "Universal", stock: 35, price: "$15.00", status: "In Stock", supplier: "AutoParts Co." },
  ];

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || part.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            In Stock
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Low Stock
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
            PARTS_MANAGEMENT
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_VEHICLE_PARTS_AND_COMPONENTS
          </p>
        </div>
        <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Plus className="h-4 w-4" />
          ADD PART
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Parts</p>
                <p className="text-2xl font-bold text-white">{parts.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Boxes className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-white">
                  {parts.filter((part) => part.status === "Low Stock").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white">$8,450</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <Boxes className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Suppliers</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Boxes className="h-6 w-6 text-[#3b82f6]" />
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
                placeholder="Search parts by ID or name..."
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
                <SelectItem value="in stock" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">In Stock</SelectItem>
                <SelectItem value="low stock" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_PARTS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredParts.length} parts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Part ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Name</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Vehicle Type</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Stock</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Price</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Supplier</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#94a3b8] font-mono">
                    No parts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part) => (
                  <TableRow key={part.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {part.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {part.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {part.vehicleType}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {part.stock}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {part.price}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {part.supplier}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(part.status)}
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
