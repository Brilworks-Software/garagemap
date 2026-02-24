import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SaleService } from "../services/SaleService";
import { Sale } from "../types";

// Query keys factory
export const saleKeys = {
  all: ["sales"] as const,
  detail: (saleId: string) => ["sales", saleId] as const,
  byService: (serviceId: string) => ["sales", "service", serviceId] as const,
  byCustomer: (serviceId: string, customerId: string) => ["sales", "service", serviceId, "customer", customerId] as const,
  byStatus: (serviceId: string, status: string) => ["sales", "service", serviceId, "status", status] as const,
};

/**
 * Hook to fetch a sale by ID.
 */
export const useGetSale = (saleId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: saleKeys.detail(saleId),
    queryFn: () => SaleService.getSale(saleId),
    enabled: options?.enabled !== false && !!saleId,
  });
};

/**
 * Hook to fetch all sales for a service.
 */
export const useGetSalesByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: saleKeys.byService(serviceId),
    queryFn: () => SaleService.getSalesByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch sales by customer ID for a service.
 */
export const useGetSalesByCustomerId = (
  serviceId: string,
  customerId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: saleKeys.byCustomer(serviceId, customerId),
    queryFn: () => SaleService.getSalesByCustomerId(serviceId, customerId),
    enabled: options?.enabled !== false && !!serviceId && !!customerId,
  });
};

/**
 * Hook to fetch sales by status for a service.
 */
export const useGetSalesByStatus = (
  serviceId: string,
  status: "pending" | "completed" | "cancelled" | "refunded",
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: saleKeys.byStatus(serviceId, status),
    queryFn: () => SaleService.getSalesByStatus(serviceId, status),
    enabled: options?.enabled !== false && !!serviceId && !!status,
  });
};

/**
 * Hook to create a new sale.
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      saleData,
    }: {
      serviceId: string;
      saleData: Omit<Sale, "saleId" | "serviceId" | "createdAt" | "updatedAt">;
    }) => SaleService.createSale(serviceId, saleData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      if (variables.saleData.customerId) {
        queryClient.invalidateQueries({ 
          queryKey: saleKeys.byCustomer(variables.serviceId, variables.saleData.customerId) 
        });
      }
    },
    onError: (error: Error) => {
      console.error("Create Sale Error:", error.message);
    },
  });
};

/**
 * Hook to update a sale.
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      saleId,
      data,
    }: {
      saleId: string;
      data: Partial<Omit<Sale, "saleId" | "createdAt" | "updatedAt">>;
    }) => SaleService.updateSale(saleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
    onError: (error: Error) => {
      console.error("Update Sale Error:", error.message);
    },
  });
};

/**
 * Hook to delete a sale.
 */
export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => SaleService.deleteSale(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
    onError: (error: Error) => {
      console.error("Delete Sale Error:", error.message);
    },
  });
};
