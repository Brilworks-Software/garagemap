import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PartService } from "../services/PartService";
import { Part } from "../types";

// Query keys factory
export const partKeys = {
  all: ["parts"] as const,
  detail: (partId: string) => ["parts", partId] as const,
  byService: (serviceId: string) => ["parts", "service", serviceId] as const,
  byCategory: (serviceId: string, category: string) => ["parts", "service", serviceId, "category", category] as const,
  byStatus: (serviceId: string, status: string) => ["parts", "service", serviceId, "status", status] as const,
  byMake: (serviceId: string, make: string) => ["parts", "service", serviceId, "make", make] as const,
};

/**
 * Hook to fetch a part by ID.
 */
export const useGetPart = (partId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: partKeys.detail(partId),
    queryFn: () => PartService.getPart(partId),
    enabled: options?.enabled !== false && !!partId,
  });
};

/**
 * Hook to fetch all parts for a service.
 */
export const useGetPartsByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: partKeys.byService(serviceId),
    queryFn: () => PartService.getPartsByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch parts by category for a service.
 */
export const useGetPartsByCategory = (
  serviceId: string,
  category: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: partKeys.byCategory(serviceId, category),
    queryFn: () => PartService.getPartsByCategory(serviceId, category),
    enabled: options?.enabled !== false && !!serviceId && !!category,
  });
};

/**
 * Hook to fetch parts by status for a service.
 */
export const useGetPartsByStatus = (
  serviceId: string,
  status: "active" | "inactive" | "out-of-stock" | "low-stock",
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: partKeys.byStatus(serviceId, status),
    queryFn: () => PartService.getPartsByStatus(serviceId, status),
    enabled: options?.enabled !== false && !!serviceId && !!status,
  });
};

/**
 * Hook to fetch parts by vehicle make for a service.
 */
export const useGetPartsByMake = (
  serviceId: string,
  make: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: partKeys.byMake(serviceId, make),
    queryFn: () => PartService.getPartsByMake(serviceId, make),
    enabled: options?.enabled !== false && !!serviceId && !!make,
  });
};

/**
 * Hook to create a new part.
 */
export const useCreatePart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      partData,
    }: {
      serviceId: string;
      partData: Omit<Part, "partId" | "serviceId" | "createdAt" | "updatedAt">;
    }) => PartService.createPart(serviceId, partData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
    onError: (error: Error) => {
      console.error("Create Part Error:", error.message);
    },
  });
};

/**
 * Hook to update a part.
 */
export const useUpdatePart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partId,
      data,
    }: {
      partId: string;
      data: Partial<Omit<Part, "partId" | "createdAt" | "updatedAt">>;
    }) => PartService.updatePart(partId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partKeys.detail(variables.partId) });
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
    onError: (error: Error) => {
      console.error("Update Part Error:", error.message);
    },
  });
};

/**
 * Hook to adjust part quantity.
 */
export const useAdjustPartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partId,
      quantityChange,
    }: {
      partId: string;
      quantityChange: number;
    }) => PartService.adjustPartQuantity(partId, quantityChange),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partKeys.detail(variables.partId) });
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
    onError: (error: Error) => {
      console.error("Adjust Part Quantity Error:", error.message);
    },
  });
};

/**
 * Hook to delete a part.
 */
export const useDeletePart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partId: string) => PartService.deletePart(partId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
    onError: (error: Error) => {
      console.error("Delete Part Error:", error.message);
    },
  });
};
