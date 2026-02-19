import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryService } from "../services/InventoryService";
import { Inventory } from "../types";

// Query keys factory
export const inventoryKeys = {
  all: ["inventory"] as const,
  detail: (itemId: string) => ["inventory", itemId] as const,
  byService: (serviceId: string) => ["inventory", "service", serviceId] as const,
  byCategory: (serviceId: string, category: string) => ["inventory", "service", serviceId, "category", category] as const,
  byStatus: (serviceId: string, status: string) => ["inventory", "service", serviceId, "status", status] as const,
};

/**
 * Hook to fetch an inventory item by ID.
 */
export const useGetInventoryItem = (itemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: inventoryKeys.detail(itemId),
    queryFn: () => InventoryService.getInventoryItem(itemId),
    enabled: options?.enabled !== false && !!itemId,
  });
};

/**
 * Hook to fetch all inventory items for a service.
 */
export const useGetInventoryByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: inventoryKeys.byService(serviceId),
    queryFn: () => InventoryService.getInventoryByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch inventory items by category for a service.
 */
export const useGetInventoryByCategory = (
  serviceId: string,
  category: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: inventoryKeys.byCategory(serviceId, category),
    queryFn: () => InventoryService.getInventoryByCategory(serviceId, category),
    enabled: options?.enabled !== false && !!serviceId && !!category,
  });
};

/**
 * Hook to fetch inventory items by status for a service.
 */
export const useGetInventoryByStatus = (
  serviceId: string,
  status: "active" | "inactive" | "out-of-stock" | "low-stock",
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: inventoryKeys.byStatus(serviceId, status),
    queryFn: () => InventoryService.getInventoryByStatus(serviceId, status),
    enabled: options?.enabled !== false && !!serviceId && !!status,
  });
};

/**
 * Hook to create a new inventory item.
 */
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      inventoryData,
    }: {
      serviceId: string;
      inventoryData: Omit<Inventory, "itemId" | "serviceId" | "createdAt" | "updatedAt">;
    }) => InventoryService.createInventoryItem(serviceId, inventoryData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error: Error) => {
      console.error("Create Inventory Item Error:", error.message);
    },
  });
};

/**
 * Hook to update an inventory item.
 */
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Partial<Omit<Inventory, "itemId" | "createdAt" | "updatedAt">>;
    }) => InventoryService.updateInventoryItem(itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error: Error) => {
      console.error("Update Inventory Item Error:", error.message);
    },
  });
};

/**
 * Hook to adjust inventory quantity.
 */
export const useAdjustInventoryQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      quantityChange,
    }: {
      itemId: string;
      quantityChange: number;
    }) => InventoryService.adjustInventoryQuantity(itemId, quantityChange),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error: Error) => {
      console.error("Adjust Inventory Quantity Error:", error.message);
    },
  });
};

/**
 * Hook to delete an inventory item.
 */
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => InventoryService.deleteInventoryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error: Error) => {
      console.error("Delete Inventory Item Error:", error.message);
    },
  });
};
