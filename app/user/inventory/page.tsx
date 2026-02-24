"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Loader2,
  X,
  Minus,
  Plus as PlusIcon,
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
import {
  useGetInventoryByServiceId,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useAdjustInventoryQuantity,
} from "@/firebase/hooks/useInventory";
import { Inventory } from "@/firebase/types";
import { colors, colorClasses } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuantityAdjustModalOpen, setIsQuantityAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [quantityAdjustment, setQuantityAdjustment] = useState("");

  // Form state for new item
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("");
  const [maxStockLevel, setMaxStockLevel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "out-of-stock" | "low-stock" | null>("active");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get inventory for the service
  const serviceId = userData?.serviceId || "";
  const { data: inventoryItems = [], isLoading, error } = useGetInventoryByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Mutations
  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();
  const deleteItemMutation = useDeleteInventoryItem();
  const adjustQuantityMutation = useAdjustInventoryQuantity();

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!itemName) {
      setFormError("Item name is required.");
      return;
    }

    if (!quantity || parseFloat(quantity) < 0) {
      setFormError("Valid quantity is required.");
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        serviceId,
        inventoryData: {
          itemName: itemName || null,
          itemCode: itemCode || null,
          category: category || null,
          quantity: parseFloat(quantity),
          unit: unit || null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
          minStockLevel: minStockLevel ? parseFloat(minStockLevel) : null,
          maxStockLevel: maxStockLevel ? parseFloat(maxStockLevel) : null,
          supplier: supplier || null,
          location: location || null,
          status: status,
          description: description || null,
          notes: notes || null,
        },
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to create inventory item. Please try again.");
    }
  };

  const handleEditItem = (item: Inventory) => {
    setSelectedItem(item);
    setItemName(item.itemName || "");
    setItemCode(item.itemCode || "");
    setCategory(item.category || null);
    setQuantity(item.quantity.toString());
    setUnit(item.unit || "");
    setCostPrice(item.costPrice?.toString() || "");
    setSellingPrice(item.sellingPrice?.toString() || "");
    setMinStockLevel(item.minStockLevel?.toString() || "");
    setMaxStockLevel(item.maxStockLevel?.toString() || "");
    setSupplier(item.supplier || "");
    setLocation(item.location || "");
    setStatus(item.status);
    setDescription(item.description || "");
    setNotes(item.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedItem) {
      setFormError("No item selected.");
      return;
    }

    if (!itemName) {
      setFormError("Item name is required.");
      return;
    }

    if (!quantity || parseFloat(quantity) < 0) {
      setFormError("Valid quantity is required.");
      return;
    }

    try {
      await updateItemMutation.mutateAsync({
        itemId: selectedItem.itemId,
        data: {
          itemName: itemName || null,
          itemCode: itemCode || null,
          category: category || null,
          quantity: parseFloat(quantity),
          unit: unit || null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
          minStockLevel: minStockLevel ? parseFloat(minStockLevel) : null,
          maxStockLevel: maxStockLevel ? parseFloat(maxStockLevel) : null,
          supplier: supplier || null,
          location: location || null,
          status: status,
          description: description || null,
          notes: notes || null,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to update inventory item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;

    try {
      await deleteItemMutation.mutateAsync(itemId);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to delete inventory item.");
    }
  };

  const handleAdjustQuantity = async () => {
    if (!selectedItem || !quantityAdjustment) return;

    const adjustment = parseFloat(quantityAdjustment);
    if (isNaN(adjustment)) {
      alert("Please enter a valid number.");
      return;
    }

    try {
      await adjustQuantityMutation.mutateAsync({
        itemId: selectedItem.itemId,
        quantityChange: adjustment,
      });
      setIsQuantityAdjustModalOpen(false);
      setQuantityAdjustment("");
      setSelectedItem(null);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to adjust quantity.");
    }
  };

  const resetForm = () => {
    setItemName("");
    setItemCode("");
    setCategory(null);
    setQuantity("");
    setUnit("");
    setCostPrice("");
    setSellingPrice("");
    setMinStockLevel("");
    setMaxStockLevel("");
    setSupplier("");
    setLocation("");
    setStatus("active");
    setDescription("");
    setNotes("");
    setFormError("");
  };

  // Reset form when dialogs close
  useEffect(() => {
    if (!isDialogOpen && !isEditDialogOpen) {
      setTimeout(() => {
        resetForm();
        setSelectedItem(null);
      }, 0);
    }
  }, [isDialogOpen, isEditDialogOpen]);

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
      case "out-of-stock":
        return (
          <Badge className={colorClasses.badgeError}>
            Out of Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className={colorClasses.badgeError}>
            Low Stock
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
    }
  };

  const filteredItems = inventoryItems.filter((item: Inventory) => {
    const matchesSearch =
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory =
      categoryFilter === "all" || (item.category?.toLowerCase() === categoryFilter.toLowerCase() || false);
    const matchesStatus =
      statusFilter === "all" || (item.status?.toLowerCase() === statusFilter.toLowerCase() || false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter((item) => item.status === "low-stock" || item.status === "out-of-stock");
  const totalValue = inventoryItems.reduce((sum, item) => {
    const cost = item.costPrice || 0;
    return sum + (cost * item.quantity);
  }, 0);
  const uniqueCategories = new Set(inventoryItems.map((item) => item.category).filter(Boolean));

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
          Error loading inventory: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            INVENTORY_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_STOCK_AND_INVENTORY_ITEMS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
              <Plus className="h-4 w-4" />
              ADD ITEM
            </Button>
          </DialogTrigger>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                ADD_NEW_INVENTORY_ITEM
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Register a new inventory item in the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Item Name *
                  </label>
                  <Input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Engine Oil 5W-30"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Item Code / SKU
                  </label>
                  <Input
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="EO-5W30-001"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Category
                  </label>
                  <Select value={category || ""} onValueChange={(value) => setCategory(value === "none" ? null : value)}>
                    <SelectTrigger
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="none" className={`${colorClasses.textPrimary} font-mono `}>None</SelectItem>
                      <SelectItem value="parts" className={`${colorClasses.textPrimary} font-mono `}>Parts</SelectItem>
                      <SelectItem value="fluids" className={`${colorClasses.textPrimary} font-mono `}>Fluids</SelectItem>
                      <SelectItem value="filters" className={`${colorClasses.textPrimary} font-mono `}>Filters</SelectItem>
                      <SelectItem value="tools" className={`${colorClasses.textPrimary} font-mono `}>Tools</SelectItem>
                      <SelectItem value="consumables" className={`${colorClasses.textPrimary} font-mono `}>Consumables</SelectItem>
                      <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono `}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Unit
                  </label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="piece, kg, liter, box"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Cost Price (Rs.)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Selling Price (Rs.)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Min Stock Level
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Max Stock Level
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxStockLevel}
                    onChange={(e) => setMaxStockLevel(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Supplier
                  </label>
                  <Input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Warehouse, Shelf A1"
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select
                    value={status || "active"}
                    onValueChange={(value) => setStatus(value as "active" | "inactive" | "out-of-stock" | "low-stock" | null)}
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
                      <SelectItem value="out-of-stock" className={`${colorClasses.textPrimary} font-mono `}>Out of Stock</SelectItem>
                      <SelectItem value="low-stock" className={`${colorClasses.textPrimary} font-mono `}>Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Notes
                  </label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex gap-4">
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
                  disabled={createItemMutation.isPending}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  {createItemMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      CREATE ITEM
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Items</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{totalItems}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Package className="h-6 w-6" />
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
                  {lowStockItems.length}
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
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{formatCurrency(totalValue)}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgCyan} rounded flex items-center justify-center`}>
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Categories</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{uniqueCategories.size}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Package className="h-6 w-6" />
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
                placeholder="Search inventory by ID, name, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`pl-10 ${colorClasses.borderInput} font-mono text-sm text-white`}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger 
                style={{ backgroundColor: colors.background.input }}
                className={`w-full md:w-[200px] ${colorClasses.borderInput} font-mono text-white`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" className="text-white" />
              </SelectTrigger>
              <SelectContent 
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Categories</SelectItem>
                <SelectItem value="parts" className={`${colorClasses.textPrimary} font-mono `}>Parts</SelectItem>
                <SelectItem value="fluids" className={`${colorClasses.textPrimary} font-mono `}>Fluids</SelectItem>
                <SelectItem value="filters" className={`${colorClasses.textPrimary} font-mono `}>Filters</SelectItem>
                <SelectItem value="tools" className={`${colorClasses.textPrimary} font-mono `}>Tools</SelectItem>
                <SelectItem value="consumables" className={`${colorClasses.textPrimary} font-mono `}>Consumables</SelectItem>
                <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono `}>Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger 
                style={{ backgroundColor: colors.background.input }}
                className={`w-full md:w-[200px] ${colorClasses.borderInput} font-mono text-white`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status"  />
              </SelectTrigger>
              <SelectContent 
                style={{ backgroundColor: colors.background.surface }}
                className={colorClasses.borderInput}
              >
                <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Status</SelectItem>
                <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono `}>Active</SelectItem>
                <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono `}>Inactive</SelectItem>
                <SelectItem value="out-of-stock" className={`${colorClasses.textPrimary} font-mono `}>Out of Stock</SelectItem>
                <SelectItem value="low-stock" className={`${colorClasses.textPrimary} font-mono `}>Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_INVENTORY_ITEMS
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredItems.length} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Item ID</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Name</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Code</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Category</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Stock</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Unit</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Cost Price</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Selling Price</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Status</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item: Inventory) => (
                  <TableRow key={item.itemId} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {item.itemId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {item.itemName || "N/A"}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {item.itemCode || "N/A"}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {item.category || "N/A"}
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {item.quantity}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      {item.unit || "N/A"}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {formatCurrency(item.costPrice)}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {formatCurrency(item.sellingPrice)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className={`h-4 w-4 ${colorClasses.textCyan}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className={`h-4 w-4 ${colorClasses.textBlue}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgCyan}`}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsQuantityAdjustModalOpen(true);
                          }}
                          title="Adjust Quantity"
                        >
                          <PlusIcon className={`h-4 w-4 ${colorClasses.textCyan}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${colorClasses.iconBgRed}`}
                          onClick={() => handleDeleteItem(item.itemId)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              EDIT_INVENTORY_ITEM
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Update inventory item information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-4">
            {formError && (
              <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Item Name *
                </label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  required
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Item Code / SKU
                </label>
                <Input
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Category
                </label>
                <Select value={category || ""} onValueChange={(value) => setCategory(value === "none" ? null : value)}>
                  <SelectTrigger
                    style={{ backgroundColor: colors.background.input }}
                    className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent
                    style={{ backgroundColor: colors.background.surface }}
                    className={colorClasses.borderInput}
                  >
                    <SelectItem value="none" className={`${colorClasses.textPrimary} font-mono `}>None</SelectItem>
                    <SelectItem value="parts" className={`${colorClasses.textPrimary} font-mono `}>Parts</SelectItem>
                    <SelectItem value="fluids" className={`${colorClasses.textPrimary} font-mono `}>Fluids</SelectItem>
                    <SelectItem value="filters" className={`${colorClasses.textPrimary} font-mono `}>Filters</SelectItem>
                    <SelectItem value="tools" className={`${colorClasses.textPrimary} font-mono `}>Tools</SelectItem>
                    <SelectItem value="consumables" className={`${colorClasses.textPrimary} font-mono `}>Consumables</SelectItem>
                    <SelectItem value="other" className={`${colorClasses.textPrimary} font-mono `}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Quantity *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  required
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Unit
                </label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Cost Price (Rs.)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Selling Price (Rs.)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Min Stock Level
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Max Stock Level
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxStockLevel}
                  onChange={(e) => setMaxStockLevel(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Supplier
                </label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Location
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Status
                </label>
                <Select
                  value={status || "active"}
                  onValueChange={(value) => setStatus(value as "active" | "inactive" | "out-of-stock" | "low-stock" | null)}
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
                    <SelectItem value="out-of-stock" className={`${colorClasses.textPrimary} font-mono `}>Out of Stock</SelectItem>
                    <SelectItem value="low-stock" className={`${colorClasses.textPrimary} font-mono `}>Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              <div className="col-span-2">
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditDialogOpen(false)}
                className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textRed}`}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={updateItemMutation.isPending}
                className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
              >
                {updateItemMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    UPDATE ITEM
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              INVENTORY_ITEM_DETAILS
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Detailed information for {selectedItem?.itemName || "this item"}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className={`grid grid-cols-2 gap-4 text-sm font-mono ${colorClasses.textPrimary}`}>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Item ID</p>
                <p className={`${colorClasses.textPrimary} break-all`}>{selectedItem.itemId}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Item Name</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedItem.itemName || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Item Code</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedItem.itemCode || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Category</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedItem.category || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Quantity</p>
                <p className={`${colorClasses.textPrimary}`}>{selectedItem.quantity}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Unit</p>
                <p className={`${colorClasses.textPrimary}`}>{selectedItem.unit || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Cost Price</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedItem.costPrice)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Selling Price</p>
                <p className={`${colorClasses.textPrimary}`}>{formatCurrency(selectedItem.sellingPrice)}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Min Stock Level</p>
                <p className={`${colorClasses.textPrimary}`}>{selectedItem.minStockLevel ?? "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Max Stock Level</p>
                <p className={`${colorClasses.textPrimary}`}>{selectedItem.maxStockLevel ?? "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Supplier</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedItem.supplier || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Location</p>
                <p className={`${colorClasses.textPrimary} break-words`}>{selectedItem.location || "N/A"}</p>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Status</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>
              <div>
                <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Created At</p>
                <p className={`${colorClasses.textPrimary}`}>{formatDate(selectedItem.createdAt)}</p>
              </div>
              {selectedItem.description && (
                <div className="col-span-2">
                  <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Description</p>
                  <p className={`${colorClasses.textPrimary} break-words whitespace-pre-wrap`}>{selectedItem.description}</p>
                </div>
              )}
              {selectedItem.notes && (
                <div className="col-span-2">
                  <p className={`text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Notes</p>
                  <p className={`${colorClasses.textPrimary} break-words whitespace-pre-wrap`}>{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quantity Adjustment Modal */}
      <Dialog open={isQuantityAdjustModalOpen} onOpenChange={setIsQuantityAdjustModalOpen}>
        <DialogContent 
          style={{ backgroundColor: colors.background.surface }}
          className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-md`}
        >
          <DialogHeader>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
              ADJUST_QUANTITY
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              {selectedItem && (
                <>
                  Current quantity: <strong>{selectedItem.quantity}</strong> {selectedItem.unit || ""}
                  <br />
                  Enter positive number to add, negative to subtract
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                Quantity Change
              </label>
              <Input
                type="number"
                step="0.01"
                value={quantityAdjustment}
                onChange={(e) => setQuantityAdjustment(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={colorClasses.borderInput}
                placeholder="e.g., +10 or -5"
              />
            </div>
            {selectedItem && quantityAdjustment && !isNaN(parseFloat(quantityAdjustment)) && (
              <div className={`p-3 rounded ${colorClasses.bgSurface} ${colorClasses.borderDefault} border`}>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} mb-1`}>New Quantity:</p>
                <p className={`font-mono text-lg font-bold ${colorClasses.textPrimary}`}>
                  {Math.max(0, selectedItem.quantity + parseFloat(quantityAdjustment))} {selectedItem.unit || ""}
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsQuantityAdjustModalOpen(false);
                  setQuantityAdjustment("");
                  setSelectedItem(null);
                }}
                className={`flex-1 font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textRed}`}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleAdjustQuantity}
                disabled={adjustQuantityMutation.isPending || !quantityAdjustment}
                className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
              >
                {adjustQuantityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    ADJUST
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
