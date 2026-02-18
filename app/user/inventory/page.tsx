"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
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

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const inventoryItems = [
    { id: "INV-001", name: "Engine Oil 5W-30", category: "Fluids", stock: 45, unit: "Liters", price: "$25.00", status: "In Stock" },
    { id: "INV-002", name: "Brake Pads", category: "Parts", stock: 12, unit: "Pairs", price: "$45.00", status: "In Stock" },
    { id: "INV-003", name: "Air Filter", category: "Filters", stock: 3, unit: "Units", price: "$15.00", status: "Low Stock" },
    { id: "INV-004", name: "Spark Plugs", category: "Parts", stock: 28, unit: "Units", price: "$8.00", status: "In Stock" },
    { id: "INV-005", name: "Transmission Fluid", category: "Fluids", stock: 2, unit: "Liters", price: "$30.00", status: "Low Stock" },
  ];

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
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
      case "Out of Stock":
        return (
          <Badge className="bg-[#94a3b8]/20 text-[#94a3b8] hover:bg-[#94a3b8]/30">
            Out of Stock
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
            INVENTORY_MANAGEMENT
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_STOCK_AND_INVENTORY_ITEMS
          </p>
        </div>
        <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Plus className="h-4 w-4" />
          ADD ITEM
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Items</p>
                <p className="text-2xl font-bold text-white">{inventoryItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Package className="h-6 w-6 text-[#3b82f6]" />
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
                  {inventoryItems.filter((item) => item.status === "Low Stock").length}
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
                <p className="text-2xl font-bold text-white">$12,450</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <Package className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Categories</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Package className="h-6 w-6 text-[#3b82f6]" />
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
                placeholder="Search inventory by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1a1c1e] border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10">
                <SelectItem value="all" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">All Categories</SelectItem>
                <SelectItem value="parts" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Parts</SelectItem>
                <SelectItem value="fluids" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Fluids</SelectItem>
                <SelectItem value="filters" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Filters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_INVENTORY_ITEMS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredItems.length} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Item ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Name</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Category</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Stock</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Unit</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Price</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#94a3b8] font-mono">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {item.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {item.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {item.category}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {item.stock}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {item.unit}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {item.price}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
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
