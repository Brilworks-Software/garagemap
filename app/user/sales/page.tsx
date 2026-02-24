"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  ShoppingCart,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { useGetInventoryByServiceId, useAdjustInventoryQuantity } from "@/firebase/hooks/useInventory";
import { useCreateSale, useGetSalesByServiceId } from "@/firebase/hooks/useSale";
import { useCreateInvoice, useGetInvoicesByServiceId, useUpdateInvoice } from "@/firebase/hooks/useInvoice";
import { useGetService } from "@/firebase/hooks/useService";
import { InvoiceStorageService } from "@/firebase/services/InvoiceStorageService";
import { Customer, Inventory, Sale, SaleItem } from "@/firebase/types";
import { colors, colorClasses } from "@/lib/colors";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateInvoicePDFBlob } from "@/lib/invoicePdf";

type LocalSaleItem = SaleItem & {
  taxRate: number;
  taxAmount: number;
};

const toTimestampDate = (value: unknown): Date => {
  if (value instanceof Date) return value;

  if (typeof value === "object" && value !== null) {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate();
    }
    if (typeof maybeTimestamp.seconds === "number") {
      return new Date(maybeTimestamp.seconds * 1000);
    }
  }

  return new Date();
};

export default function SalesPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in");
  const [walkInCustomerName, setWalkInCustomerName] = useState<string>("");
  const [walkInCustomerGST, setWalkInCustomerGST] = useState<string>("");
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("0");
  const [discountRate, setDiscountRate] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online" | "upi" | "other">("cash");
  const [notes, setNotes] = useState<string>("");
  const [saleItems, setSaleItems] = useState<LocalSaleItem[]>([]);
  const [formError, setFormError] = useState<string>("");

  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  const serviceId = userData?.serviceId || "";

  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useGetInventoryByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: customers = [] } = useGetCustomersByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: serviceData } = useGetService(serviceId, {
    enabled: !!serviceId,
  });
  const { data: sales = [], isLoading: isLoadingSales, error } = useGetSalesByServiceId(serviceId, {
    enabled: !!serviceId,
  });
  const { data: invoices = [] } = useGetInvoicesByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  const createSaleMutation = useCreateSale();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const adjustInventoryMutation = useAdjustInventoryQuantity();

  const activeInventoryItems = useMemo(
    () => inventoryItems.filter((item) => item.status !== "inactive"),
    [inventoryItems]
  );

  const selectedInventoryItem = useMemo(
    () => activeInventoryItems.find((item) => item.itemId === selectedInventoryItemId),
    [activeInventoryItems, selectedInventoryItemId]
  );

  const selectedCustomer: Customer | null = useMemo(() => {
    if (selectedCustomerId === "walk-in") {
      return null;
    }
    return customers.find((customer) => customer.customerId === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const calculatedSubtotal = useMemo(
    () => saleItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [saleItems]
  );

  const calculatedTax = useMemo(
    () => saleItems.reduce((sum, item) => sum + item.taxAmount, 0),
    [saleItems]
  );

  const discountRateValue = useMemo(() => {
    const parsed = parseFloat(discountRate || "0");
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [discountRate]);

  const effectiveTaxRate = useMemo(() => {
    if (calculatedSubtotal <= 0) return 0;
    return (calculatedTax / calculatedSubtotal) * 100;
  }, [calculatedSubtotal, calculatedTax]);

  const discountAmount = useMemo(() => {
    if (calculatedSubtotal <= 0 || discountRateValue <= 0) return 0;
    return (calculatedSubtotal * discountRateValue) / 100;
  }, [calculatedSubtotal, discountRateValue]);

  const totalAmount = useMemo(
    () => Math.max(0, calculatedSubtotal + calculatedTax - discountAmount),
    [calculatedSubtotal, calculatedTax, discountAmount]
  );

  const handleSelectInventoryItem = (value: string) => {
    setSelectedInventoryItemId(value);
    const inventoryItem = activeInventoryItems.find((item) => item.itemId === value);
    setUnitPrice((inventoryItem?.sellingPrice ?? 0).toString());
    setQuantity("1");
    setTaxRate("0");
    setFormError("");
  };

  const handleAddItem = () => {
    setFormError("");

    if (!selectedInventoryItem) {
      setFormError("Please select a product.");
      return;
    }

    const parsedQty = parseFloat(quantity);
    const parsedUnitPrice = parseFloat(unitPrice);
    const parsedTaxRate = parseFloat(taxRate || "0");

    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }

    if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
      setFormError("Unit price must be a valid non-negative number.");
      return;
    }

    if (Number.isNaN(parsedTaxRate) || parsedTaxRate < 0) {
      setFormError("Tax rate must be a valid non-negative number.");
      return;
    }

    const existingQuantity = saleItems
      .filter((item) => item.inventoryItemId === selectedInventoryItem.itemId)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (parsedQty + existingQuantity > selectedInventoryItem.quantity) {
      setFormError(
        `Insufficient stock. Available: ${selectedInventoryItem.quantity} ${selectedInventoryItem.unit || "units"}.`
      );
      return;
    }

    const totalPrice = parsedQty * parsedUnitPrice;
    const taxAmount = (totalPrice * parsedTaxRate) / 100;

    setSaleItems((prev) => [
      ...prev,
      {
        inventoryItemId: selectedInventoryItem.itemId,
        itemName: selectedInventoryItem.itemName || "Unnamed Product",
        itemCode: selectedInventoryItem.itemCode || null,
        quantity: parsedQty,
        unit: selectedInventoryItem.unit || null,
        unitPrice: parsedUnitPrice,
        totalPrice,
        taxRate: parsedTaxRate,
        taxAmount,
      },
    ]);

    setSelectedInventoryItemId("");
    setQuantity("1");
    setUnitPrice("");
    setTaxRate("0");
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setSelectedCustomerId("walk-in");
    setWalkInCustomerName("");
    setWalkInCustomerGST("");
    setSelectedInventoryItemId("");
    setQuantity("1");
    setUnitPrice("");
    setTaxRate("0");
    setDiscountRate("0");
    setPaymentMethod("cash");
    setNotes("");
    setSaleItems([]);
    setFormError("");
  };

  const handleCreateSaleAndInvoice = async () => {
    setFormError("");

    if (!serviceId) {
      setFormError("Service information is missing. Please refresh and try again.");
      return;
    }

    if (saleItems.length === 0) {
      setFormError("Please add at least one product to create a sale.");
      return;
    }

    if (selectedCustomerId === "walk-in" && !walkInCustomerName.trim()) {
      setFormError("Please enter walk-in customer name.");
      return;
    }

    try {
      const now = new Date();
      const walkInName = walkInCustomerName.trim();
      const walkInGST = walkInCustomerGST.trim();
      const customerDisplayName = selectedCustomer?.customerName || walkInName || "Walk-in Customer";
      const customerDisplayEmail = selectedCustomer?.customerEmail || null;
      const customerDisplayPhone = selectedCustomer?.customerPhone || null;
      const customerDisplayAddress = selectedCustomer?.customerAddress || null;

      const finalNotes = [
        notes.trim(),
        selectedCustomerId === "walk-in" && walkInName ? `Walk-in Customer: ${walkInName}` : "",
        selectedCustomerId === "walk-in" && walkInGST ? `GSTIN: ${walkInGST}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const salePayload: Omit<Sale, "saleId" | "serviceId" | "createdAt" | "updatedAt"> = {
        customerId: selectedCustomerId === "walk-in" ? null : selectedCustomerId,
        saleDate: now,
        saleItems,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        discount: discountAmount,
        totalAmount,
        paymentMethod,
        status: "completed",
        notes: finalNotes || null,
      };

      const saleId = await createSaleMutation.mutateAsync({
        serviceId,
        saleData: salePayload,
      });

      await Promise.all(
        saleItems.map((item) =>
          adjustInventoryMutation.mutateAsync({
            itemId: item.inventoryItemId,
            quantityChange: -item.quantity,
          })
        )
      );

      const invoiceData = {
        jobId: `sale-${saleId}`,
        customerId: selectedCustomerId === "walk-in" ? "walk-in" : selectedCustomerId,
        serviceId,
        vehicleId: "N/A",
        workItems: saleItems.map((item) => ({
          title: `${item.itemName} x ${item.quantity}${item.taxRate > 0 ? ` (Tax ${item.taxRate}%)` : ""}`,
          price: item.totalPrice,
        })),
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        discount: discountAmount,
        total: totalAmount,
        status: "paid" as const,
        issueDate: now,
        dueDate: now,
        paidDate: now,
        notes: finalNotes || null,
      };

      const invoiceId = await createInvoiceMutation.mutateAsync({
        serviceId,
        invoiceData,
      });

      const invoiceNumberForPdf = `SALE-${now.getTime()}`;
      const pdfBlob = generateInvoicePDFBlob({
        invoiceNumber: invoiceNumberForPdf,
        issueDate: now,
        dueDate: now,
        customerName: customerDisplayName,
        customerEmail: customerDisplayEmail,
        customerPhone: customerDisplayPhone,
        customerAddress: customerDisplayAddress,
        vehicleInfo: "Product Sale",
        workItems: saleItems.map((item) => ({
          title: `${item.itemName} x ${item.quantity}${item.taxRate > 0 ? ` (Tax ${item.taxRate}%)` : ""}`,
          price: item.totalPrice,
        })),
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        discount: discountAmount,
        taxRate: effectiveTaxRate,
        discountRate: discountRateValue,
        total: totalAmount,
        serviceName: serviceData?.serviceName || "GarageMap Service",
        serviceGSTNumber: serviceData?.serviceGSTNumber || null,
        servicePhone: serviceData?.phoneNumber || null,
        serviceAddress: serviceData?.address || null,
        notes: finalNotes || null,
        isGST: selectedCustomerId === "walk-in" ? !!walkInGST : !!selectedCustomer?.customerGSTNumber,
        gstNumber: selectedCustomerId === "walk-in" ? (walkInGST || null) : (selectedCustomer?.customerGSTNumber || null),
      });

      const pdfUrl = await InvoiceStorageService.uploadInvoicePDF(invoiceId, pdfBlob);

      await updateInvoiceMutation.mutateAsync({
        invoiceId,
        data: { pdfUrl },
      });

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${invoiceNumberForPdf}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      alert("Sale created successfully and invoice generated.");
      resetForm();
    } catch (err) {
      const typedError = err as Error;
      setFormError(typedError.message || "Failed to create sale and invoice.");
    }
  };

  const isSaving =
    createSaleMutation.isPending ||
    createInvoiceMutation.isPending ||
    updateInvoiceMutation.isPending ||
    adjustInventoryMutation.isPending;

  const handleDownloadInvoice = (saleId: string) => {
    const relatedInvoice = invoices.find((invoice) => invoice.jobId === `sale-${saleId}`);

    if (!relatedInvoice?.pdfUrl) {
      alert("Invoice PDF is not available for this sale.");
      return;
    }

    const link = document.createElement("a");
    link.href = relatedInvoice.pdfUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = `${relatedInvoice.invoiceNumber || `sale-${saleId}`}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold font-mono ${colorClasses.textPrimary} uppercase tracking-wider`}>
            SELL_PRODUCTS
          </h1>
          <p className={`${colorClasses.textSecondary} font-mono text-xs mt-2 uppercase tracking-wide`}>
            CREATE_SALES,_MANAGE_PER_PRODUCT_TAX,_AND_GENERATE_INVOICES
          </p>
        </div>
        <Badge className={`${colorClasses.badgeInfo} font-mono uppercase px-3 py-1`}>
          PRODUCT_SALES
        </Badge>
      </div>

      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardHeader>
          <CardTitle className={`font-mono uppercase flex items-center gap-2 ${colorClasses.textBlue}`}>
            <ShoppingCart className="h-5 w-5" /> NEW_SALE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>CUSTOMER</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                >
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">WALK-IN_CUSTOMER</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customerId} value={customer.customerId}>
                      {(customer.customerName || "Unknown Customer").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>PAYMENT_METHOD</label>
              <Select
                value={paymentMethod}
                onValueChange={(value: "cash" | "card" | "online" | "upi" | "other") => setPaymentMethod(value)}
              >
                <SelectTrigger
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">CASH</SelectItem>
                  <SelectItem value="card">CARD</SelectItem>
                  <SelectItem value="online">ONLINE</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">OTHER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCustomerId === "walk-in" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>WALK-IN_CUSTOMER_NAME</label>
                <Input
                  value={walkInCustomerName}
                  onChange={(e) => setWalkInCustomerName(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>WALK-IN_GST_NUMBER</label>
                <Input
                  value={walkInCustomerGST}
                  onChange={(e) => setWalkInCustomerGST(e.target.value)}
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                  placeholder="Enter GST number (optional)"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2 space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>PRODUCT</label>
              <Select value={selectedInventoryItemId} onValueChange={handleSelectInventoryItem}>
                <SelectTrigger
                  style={{ backgroundColor: colors.background.input }}
                  className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                >
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {activeInventoryItems.map((item: Inventory) => (
                    <SelectItem key={item.itemId} value={item.itemId}>
                      {`${(item.itemName || "Unnamed Item").toUpperCase()} (${item.quantity} ${item.unit || "units"})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>QUANTITY</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>UNIT_PRICE</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>TAX_RATE_%</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddItem}
              className={`font-mono uppercase ${colorClasses.buttonPrimary}`}
              disabled={!selectedInventoryItemId}
            >
              <Plus className="h-4 w-4 mr-2" /> ADD_PRODUCT
            </Button>
          </div>

          <div className={`rounded-md border ${colorClasses.borderInput}`}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>PRODUCT</TableHead>
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>QTY</TableHead>
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>UNIT_PRICE</TableHead>
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>TAX_RATE</TableHead>
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>LINE_TOTAL</TableHead>
                  <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase text-right`}>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={`text-center py-8 font-mono text-xs ${colorClasses.textSecondary}`}>
                      NO_PRODUCTS_ADDED
                    </TableCell>
                  </TableRow>
                ) : (
                  saleItems.map((item, index) => (
                    <TableRow key={`${item.inventoryItemId}-${index}`}>
                      <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                        {item.itemName}
                      </TableCell>
                      <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                        {item.taxRate.toFixed(2)}%
                      </TableCell>
                      <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                        {formatCurrency(item.totalPrice + item.taxAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className={`${colorClasses.textRed.replace("text-", "hover:text-")}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>NOTES</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
                placeholder="Optional notes"
              />
            </div>
            <div className="space-y-2">
              <label className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>DISCOUNT_(%)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                style={{ backgroundColor: colors.background.input }}
                className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full lg:w-72 space-y-2 p-4 rounded border" style={{ backgroundColor: colors.background.input, borderColor: colors.border.input }}>
              <div className="flex justify-between font-mono text-xs">
                <span className={colorClasses.textSecondary}>SUBTOTAL</span>
                <span className={colorClasses.textPrimary}>{formatCurrency(calculatedSubtotal)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className={colorClasses.textSecondary}>TAX</span>
                <span className={colorClasses.textPrimary}>{effectiveTaxRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className={colorClasses.textSecondary}>DISCOUNT</span>
                <span className={colorClasses.textPrimary}>{discountRateValue.toFixed(2)}%</span>
              </div>
              <div className="h-px" style={{ backgroundColor: colors.border.default }} />
              <div className="flex justify-between font-mono text-sm">
                <span className={colorClasses.textBlue}>TOTAL</span>
                <span className={colorClasses.textBlue}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {formError && (
            <div className={`border px-4 py-3 text-xs font-mono uppercase ${colorClasses.badgeError} ${colorClasses.borderInput}`}>
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className={`font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textPrimary}`}
              onClick={resetForm}
              disabled={isSaving}
            >
              RESET
            </Button>
            <Button
              type="button"
              className={`font-mono uppercase ${colorClasses.buttonPrimary}`}
              onClick={handleCreateSaleAndInvoice}
              disabled={isSaving || saleItems.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> PROCESSING...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" /> COMPLETE_SALE_&_GENERATE_INVOICE
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
        <CardHeader>
          <CardTitle className={`font-mono uppercase ${colorClasses.textBlue}`}>
            RECENT_SALES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInventory || isLoadingSales ? (
            <div className={`py-10 text-center font-mono text-xs ${colorClasses.textSecondary}`}>
              LOADING...
            </div>
          ) : error ? (
            <div className={`py-10 text-center font-mono text-xs ${colorClasses.textRed}`}>
              FAILED_TO_LOAD_SALES
            </div>
          ) : (
            <div className={`rounded-md border ${colorClasses.borderInput}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>DATE</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>ITEMS</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>SUBTOTAL</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>TAX</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>TOTAL</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase`}>STATUS</TableHead>
                    <TableHead className={`${colorClasses.textSecondary} font-mono text-xs uppercase text-right`}>INVOICE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className={`text-center py-8 font-mono text-xs ${colorClasses.textSecondary}`}>
                        NO_SALES_FOUND
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.saleId}>
                        <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                          {formatDate(toTimestampDate(sale.saleDate))}
                        </TableCell>
                        <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                          {sale.saleItems?.length || 0}
                        </TableCell>
                        <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                          {formatCurrency(sale.subtotal)}
                        </TableCell>
                        <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                          {formatCurrency(sale.tax || 0)}
                        </TableCell>
                        <TableCell className={`${colorClasses.textPrimary} font-mono text-xs`}>
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${sale.status === "completed" || sale.status === "pending" ? colorClasses.badgeSuccess : colorClasses.badgeMuted} font-mono text-xs uppercase`}>
                            {sale.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={`font-mono uppercase ${colorClasses.buttonSecondary} ${colorClasses.textPrimary}`}
                            onClick={() => handleDownloadInvoice(sale.saleId)}
                          >
                            <Download className="h-4 w-4 mr-2" /> DOWNLOAD
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
