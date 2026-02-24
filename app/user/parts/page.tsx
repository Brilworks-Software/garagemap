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
import { colors, colorClasses } from "@/lib/colors";

export default function PartsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const parts = [
    { id: "PART-001", name: "Brake Pads - Front", vehicleType: "Car", stock: 12, price: "Rs. 45.00", status: "In Stock", supplier: "AutoParts Co." },
    { id: "PART-002", name: "Spark Plugs Set", vehicleType: "Car", stock: 28, price: "Rs. 8.00", status: "In Stock", supplier: "Engine Parts Ltd." },
    { id: "PART-003", name: "Timing Belt", vehicleType: "Car", stock: 5, price: "Rs. 85.00", status: "Low Stock", supplier: "Belt Systems Inc." },
    { id: "PART-004", name: "Headlight Assembly", vehicleType: "Car", stock: 8, price: "Rs. 120.00", status: "In Stock", supplier: "Lighting Solutions" },
    { id: "PART-005", name: "Wiper Blades", vehicleType: "Universal", stock: 35, price: "Rs. 15.00", status: "In Stock", supplier: "AutoParts Co." },
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
          <Badge className={colorClasses.badgeSuccess}>
            In Stock
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className={colorClasses.badgeError}>
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
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            PARTS_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_VEHICLE_PARTS_AND_COMPONENTS
          </p>
        </div>
        <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
          <Plus className="h-4 w-4" />
          ADD PART
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Parts</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{parts.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Low Stock</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
                  {parts.filter((part) => part.status === "Low Stock").length}
                </p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgRed} rounded flex items-center justify-center`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Value</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>Rs. 8,450.00</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgCyan} rounded flex items-center justify-center`}>
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Suppliers</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>5</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Boxes className="h-6 w-6" />
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
                placeholder="Search parts by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`pl-10 ${colorClasses.borderInput} font-mono text-sm`}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger 
                style={{ backgroundColor: colors.background.input }}
                className={`w-full md:w-[200px] ${colorClasses.borderInput} font-mono`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent 
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>All Status</SelectItem>
                <SelectItem value="in stock" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>In Stock</SelectItem>
                <SelectItem value="low stock" className={`${colorClasses.textPrimary} font-mono hover:bg-white/10 focus:bg-white/10`}>Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_PARTS
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredParts.length} parts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Part ID</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Name</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Vehicle Type</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Stock</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Price</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Supplier</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No parts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part) => (
                  <TableRow key={part.id} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {part.id}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {part.name}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {part.vehicleType}
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {part.stock}
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {part.price}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
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
