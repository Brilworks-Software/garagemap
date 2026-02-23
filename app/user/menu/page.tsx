"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { useGetUser } from "@/firebase/hooks/useUser";
import {
  useGetMenuByServiceId,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "@/firebase/hooks/useMenu";
import { useGetInventoryByServiceId } from "@/firebase/hooks/useInventory";
import { MenuItem, Inventory } from "@/firebase/types";
import { colors, colorClasses } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Form state for new item
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | null>("active");
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get menu items for the service
  const serviceId = userData?.serviceId || "";
  const { data: menuItems = [], isLoading, error } = useGetMenuByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: inventoryItems = [] } = useGetInventoryByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  // Mutations
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  // Available categories
  const categories = ["service", "repair", "maintenance", "parts", "labor", "other"];

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });


  const handleCreate = async () => {
    if (!serviceId) {
      setFormError("Service ID is missing. Please refresh the page.");
      return;
    }

    if (!title.trim() || !price) {
      setFormError("Title and price are required");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid positive number");
      return;
    }

    setFormError("");
    
    // Validate inventory quantity if inventory item is selected
    if (selectedInventoryItemId) {
      const inventoryItem = inventoryItems.find(item => item.itemId === selectedInventoryItemId);
      if (!inventoryItem) {
        setFormError("Selected inventory item not found");
        return;
      }
      const qty = parseFloat(inventoryQuantity);
      if (isNaN(qty) || qty <= 0) {
        setFormError("Quantity must be a valid positive number");
        return;
      }
    }
    
    try {
      await createMutation.mutateAsync({
        serviceId,
        menuData: {
          title: title.trim(),
          price: priceNum,
          category: category || null,
          description: description.trim() || null,
          inventoryItemId: selectedInventoryItemId || null,
          quantity: selectedInventoryItemId ? parseFloat(inventoryQuantity) : null,
          status: status || "active",
        },
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Create menu item error:", err);
      setFormError(err.message || "Failed to create menu item. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;

    if (!title.trim() || !price) {
      setFormError("Title and price are required");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid positive number");
      return;
    }

    setFormError("");
    
    // Validate inventory quantity if inventory item is selected
    if (selectedInventoryItemId) {
      const inventoryItem = inventoryItems.find(item => item.itemId === selectedInventoryItemId);
      if (!inventoryItem) {
        setFormError("Selected inventory item not found");
        return;
      }
      const qty = parseFloat(inventoryQuantity);
      if (isNaN(qty) || qty <= 0) {
        setFormError("Quantity must be a valid positive number");
        return;
      }
    }
    
    try {
      await updateMutation.mutateAsync({
        menuId: selectedItem.menuId,
        data: {
          title: title.trim(),
          price: priceNum,
          category: category || null,
          description: description.trim() || null,
          inventoryItemId: selectedInventoryItemId || null,
          quantity: selectedInventoryItemId ? parseFloat(inventoryQuantity) : null,
          status: status || "active",
        },
      });
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedItem(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Update menu item error:", err);
      setFormError(err.message || "Failed to update menu item. Please try again.");
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await deleteMutation.mutateAsync(menuId);
    } catch (error: unknown) {
      const err = error as { message?: string };
      alert(err.message || "Failed to delete menu item. Please try again.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setTitle(item.title || "");
    setPrice(item.price.toString());
    setCategory(item.category || null);
    setDescription(item.description || "");
    setStatus(item.status || "active");
    setSelectedInventoryItemId(item.inventoryItemId || "");
    setInventoryQuantity(item.quantity?.toString() || "");
    setFormError("");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setCategory(null);
    setDescription("");
    setStatus("active");
    setSelectedInventoryItemId("");
    setInventoryQuantity("");
    setFormError("");
    setSelectedItem(null);
  };

  // Reset form when dialogs close
  useEffect(() => {
    if (!isDialogOpen && !isEditDialogOpen) {
      setTimeout(() => {
        resetForm();
      }, 0);
    }
  }, [isDialogOpen, isEditDialogOpen]);

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
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${colorClasses.textRed} font-mono text-sm`}>
        Error loading menu items. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            MENU_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_PREDEFINED_WORK_ITEMS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
              <Plus className="h-4 w-4" />
              ADD MENU ITEM
            </Button>
          </DialogTrigger>
          <DialogContent 
            style={{ backgroundColor: colors.background.surface }}
            className={`${colorClasses.borderInput} ${colorClasses.textPrimary} max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
                ADD_NEW_MENU_ITEM
              </DialogTitle>
              <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
                Create a new predefined work item for job creation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {formError && (
                <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Oil Change, Brake Pad Replacement"
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                    required
                  />
                </div>
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Category
                  </label>
                  <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? null : value)}>
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
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className={`${colorClasses.textPrimary} font-mono `}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
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
                    placeholder="Optional description"
                    style={{ backgroundColor: colors.background.input }}
                    className={colorClasses.borderInput}
                  />
                </div>
                
                {/* Inventory Item Selection */}
                <div className="col-span-2 border-t pt-4" style={{ borderColor: colors.border.input }}>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-3 uppercase`}>
                    Link to Inventory Item (Optional)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <SearchableSelect
                        value={selectedInventoryItemId || "none"}
                        onValueChange={(value) => {
                          if (value === "none") {
                            setSelectedInventoryItemId("");
                            setInventoryQuantity("");
                            return;
                          }
                          setSelectedInventoryItemId(value);
                          const inventoryItem = inventoryItems.find((item: Inventory) => item.itemId === value);
                          if (inventoryItem) {
                            // Auto-fill price from inventory if not set
                            if (!price) {
                              setPrice((inventoryItem.sellingPrice || 0).toString());
                            }
                            // Auto-fill title if not set
                            if (!title) {
                              setTitle(inventoryItem.itemName || inventoryItem.itemCode || "");
                            }
                          }
                        }}
                        placeholder="Select inventory item (optional)"
                        searchPlaceholder="Search inventory items..."
                        items={[
                          {
                            value: "none",
                            label: "None - Manual Entry",
                            searchText: "none manual entry",
                            displayText: "None - Manual Entry",
                          },
                          ...inventoryItems.map((item: Inventory) => {
                            const isAvailable = item.quantity > 0 && item.status !== "inactive";
                            const itemName = item.itemName || item.itemCode || "Unnamed Item";
                            return {
                              value: item.itemId,
                              searchText: itemName,
                              displayText: itemName, // Text to show in trigger button
                              label: (
                                <div className="flex items-center justify-between w-full">
                                  <span>{itemName}</span>
                                  <span className={`ml-4 text-xs ${isAvailable ? colorClasses.textSecondary : colorClasses.textRed}`}>
                                    {item.quantity > 0 ? (
                                      <>Stock: {item.quantity} {item.unit || ""} | {formatCurrency(item.sellingPrice || 0)}/unit</>
                                    ) : (
                                      <>Out of Stock</>
                                    )}
                                  </span>
                                </div>
                              ),
                              disabled: !isAvailable,
                            };
                          }),
                        ]}
                        triggerStyle={{ backgroundColor: colors.background.input }}
                        triggerClassName={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                        contentStyle={{ backgroundColor: colors.background.surface }}
                        contentClassName={colorClasses.borderInput}
                        itemClassName={`${colorClasses.textPrimary} font-mono`}
                        emptyMessage="No inventory items found"
                      />
                    </div>
                    {selectedInventoryItemId && (
                      <div>
                        <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={inventoryQuantity}
                          onChange={(e) => {
                            setInventoryQuantity(e.target.value);
                            // Auto-update price based on quantity
                            const inventoryItem = inventoryItems.find((item: Inventory) => item.itemId === selectedInventoryItemId);
                            if (inventoryItem && e.target.value) {
                              const qty = parseFloat(e.target.value) || 1;
                              setPrice(((inventoryItem.sellingPrice || 0) * qty).toFixed(2));
                            }
                          }}
                          style={{ backgroundColor: colors.background.input }}
                          className={colorClasses.borderInput}
                          placeholder="Enter quantity"
                        />
                        <p className={`font-mono text-xs ${colorClasses.textSecondary} mt-1`}>
                          Available: {inventoryItems.find(i => i.itemId === selectedInventoryItemId)?.quantity || 0} {inventoryItems.find(i => i.itemId === selectedInventoryItemId)?.unit || "units"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                    Status
                  </label>
                  <Select value={status || "active"} onValueChange={(value) => setStatus(value as "active" | "inactive")}>
                    <SelectTrigger 
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      style={{ backgroundColor: colors.background.surface }}
                      className={colorClasses.borderInput}
                    >
                      <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono `}>Active</SelectItem>
                      <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono `}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
                >
                  {createMutation.isPending ? (
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono pl-10`}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger 
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono w-[180px]`}
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent 
                  style={{ backgroundColor: colors.background.surface }}
                  className={colorClasses.borderInput}
                >
                  <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className={`${colorClasses.textPrimary} font-mono `}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono w-[180px]`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent 
                  style={{ backgroundColor: colors.background.surface }}
                  className={colorClasses.borderInput}
                >
                  <SelectItem value="all" className={`${colorClasses.textPrimary} font-mono `}>All Status</SelectItem>
                  <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono `}>Active</SelectItem>
                  <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono `}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardContent className="pt-6">
          {filteredItems.length === 0 ? (
            <div className={`text-center py-8 ${colorClasses.textSecondary} font-mono text-sm`}>
              {menuItems.length === 0 ? "NO_MENU_ITEMS_FOUND" : "NO_ITEMS_MATCH_FILTERS"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Title</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Category</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Price</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Inventory</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Status</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>Description</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.menuId} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                      <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>{item.title}</TableCell>
                      <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                        {item.category ? (
                          <Badge className={colorClasses.badgeInfo}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-[#475569]">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>{formatCurrency(item.price)}</TableCell>
                      <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                        {item.inventoryItemId ? (
                          <Badge className={colorClasses.badgeInfo}>
                            {inventoryItems.find(i => i.itemId === item.inventoryItemId)?.itemName || "Inventory"} 
                            {item.quantity && ` (${item.quantity})`}
                          </Badge>
                        ) : (
                          <span className="text-[#475569]">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className={`font-mono text-xs ${colorClasses.textSecondary} max-w-xs truncate`}>
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${colorClasses.iconBgBlue}`}
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className={`h-4 w-4 ${colorClasses.textBlue}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${colorClasses.iconBgRed}`}
                            onClick={() => handleDelete(item.menuId)}
                          >
                            <Trash2 className={`h-4 w-4 ${colorClasses.textRed}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
              EDIT_MENU_ITEM
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-xs`}>
              Update the menu item details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formError && (
              <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Oil Change, Brake Pad Replacement"
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  required
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Price *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                  required
                />
              </div>
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Category
                </label>
                <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? null : value)}>
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
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className={`${colorClasses.textPrimary} font-mono `}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
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
                  placeholder="Optional description"
                  style={{ backgroundColor: colors.background.input }}
                  className={colorClasses.borderInput}
                />
              </div>
              
              {/* Inventory Item Selection */}
              <div className="col-span-2 border-t pt-4" style={{ borderColor: colors.border.input }}>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-3 uppercase`}>
                  Link to Inventory Item (Optional)
                </label>
                <div className="space-y-3">
                  <div>
                    <SearchableSelect
                      value={selectedInventoryItemId || "none"}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setSelectedInventoryItemId("");
                          setInventoryQuantity("");
                          return;
                        }
                        setSelectedInventoryItemId(value);
                        const inventoryItem = inventoryItems.find((item: Inventory) => item.itemId === value);
                        if (inventoryItem) {
                          // Auto-fill price from inventory if not set
                          if (!price) {
                            setPrice((inventoryItem.sellingPrice || 0).toString());
                          }
                          // Auto-fill title if not set
                          if (!title) {
                            setTitle(inventoryItem.itemName || inventoryItem.itemCode || "");
                          }
                        }
                      }}
                      placeholder="Select inventory item (optional)"
                      searchPlaceholder="Search inventory items..."
                      items={[
                        {
                          value: "none",
                          label: "None - Manual Entry",
                          searchText: "none manual entry",
                          displayText: "None - Manual Entry",
                        },
                        ...inventoryItems.map((item: Inventory) => {
                          const isAvailable = item.quantity > 0 && item.status !== "inactive";
                          const itemName = item.itemName || item.itemCode || "Unnamed Item";
                          return {
                            value: item.itemId,
                            searchText: itemName,
                            displayText: itemName, // Text to show in trigger button
                            label: (
                              <div className="flex items-center justify-between w-full">
                                <span>{itemName}</span>
                                <span className={`ml-4 text-xs ${isAvailable ? colorClasses.textSecondary : colorClasses.textRed}`}>
                                  {item.quantity > 0 ? (
                                    <>Stock: {item.quantity} {item.unit || ""} | {formatCurrency(item.sellingPrice || 0)}/unit</>
                                  ) : (
                                    <>Out of Stock</>
                                  )}
                                </span>
                              </div>
                            ),
                            disabled: !isAvailable,
                          };
                        }),
                      ]}
                      triggerStyle={{ backgroundColor: colors.background.input }}
                      triggerClassName={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                      contentStyle={{ backgroundColor: colors.background.surface }}
                      contentClassName={colorClasses.borderInput}
                      itemClassName={`${colorClasses.textPrimary} font-mono`}
                      emptyMessage="No inventory items found"
                    />
                  </div>
                  {selectedInventoryItemId && (
                    <div>
                      <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={inventoryQuantity}
                        onChange={(e) => {
                          setInventoryQuantity(e.target.value);
                          // Auto-update price based on quantity
                          const inventoryItem = inventoryItems.find((item: Inventory) => item.itemId === selectedInventoryItemId);
                          if (inventoryItem && e.target.value) {
                            const qty = parseFloat(e.target.value) || 1;
                            setPrice(((inventoryItem.sellingPrice || 0) * qty).toFixed(2));
                          }
                        }}
                        style={{ backgroundColor: colors.background.input }}
                        className={colorClasses.borderInput}
                        placeholder="Enter quantity"
                      />
                      <p className={`font-mono text-xs ${colorClasses.textSecondary} mt-1`}>
                        Available: {inventoryItems.find(i => i.itemId === selectedInventoryItemId)?.quantity || 0} {inventoryItems.find(i => i.itemId === selectedInventoryItemId)?.unit || "units"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className={`block font-mono text-xs ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Status
                </label>
                <Select value={status || "active"} onValueChange={(value) => setStatus(value as "active" | "inactive")}>
                  <SelectTrigger 
                    style={{ backgroundColor: colors.background.input }}
                    className={`${colorClasses.borderInput} ${colorClasses.textPrimary} font-mono`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    style={{ backgroundColor: colors.background.surface }}
                    className={colorClasses.borderInput}
                  >
                    <SelectItem value="active" className={`${colorClasses.textPrimary} font-mono `}>Active</SelectItem>
                    <SelectItem value="inactive" className={`${colorClasses.textPrimary} font-mono `}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                type="button"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className={`flex-1 font-mono uppercase ${colorClasses.buttonPrimary}`}
              >
                {updateMutation.isPending ? (
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
