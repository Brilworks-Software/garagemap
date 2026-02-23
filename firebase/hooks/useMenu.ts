import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService } from "../services/MenuService";
import { MenuItem } from "../types";

// Query keys factory
export const menuKeys = {
  all: ["menu"] as const,
  detail: (menuId: string) => ["menu", menuId] as const,
  byService: (serviceId: string) => ["menu", "service", serviceId] as const,
  activeByService: (serviceId: string) => ["menu", "service", serviceId, "active"] as const,
  byCategory: (serviceId: string, category: string) => ["menu", "service", serviceId, "category", category] as const,
};

/**
 * Hook to fetch a menu item by ID.
 */
export const useGetMenuItem = (menuId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: menuKeys.detail(menuId),
    queryFn: () => MenuService.getMenuItem(menuId),
    enabled: options?.enabled !== false && !!menuId,
  });
};

/**
 * Hook to fetch all menu items for a service.
 */
export const useGetMenuByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: menuKeys.byService(serviceId),
    queryFn: () => MenuService.getMenuByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch active menu items for a service.
 */
export const useGetActiveMenuByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: menuKeys.activeByService(serviceId),
    queryFn: () => MenuService.getActiveMenuByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch menu items by category for a service.
 */
export const useGetMenuByCategory = (
  serviceId: string,
  category: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: menuKeys.byCategory(serviceId, category),
    queryFn: () => MenuService.getMenuByCategory(serviceId, category),
    enabled: options?.enabled !== false && !!serviceId && !!category,
  });
};

/**
 * Hook to create a new menu item.
 */
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      menuData,
    }: {
      serviceId: string;
      menuData: Omit<MenuItem, "menuId" | "serviceId" | "createdAt" | "updatedAt">;
    }) => MenuService.createMenuItem(serviceId, menuData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.activeByService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
    onError: (error: Error) => {
      console.error("Create Menu Item Error:", error.message);
    },
  });
};

/**
 * Hook to update a menu item.
 */
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuId,
      data,
    }: {
      menuId: string;
      data: Partial<Omit<MenuItem, "menuId" | "createdAt" | "updatedAt">>;
    }) => MenuService.updateMenuItem(menuId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(variables.menuId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
    onError: (error: Error) => {
      console.error("Update Menu Item Error:", error.message);
    },
  });
};

/**
 * Hook to delete a menu item.
 */
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menuId: string) => MenuService.deleteMenuItem(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
    onError: (error: Error) => {
      console.error("Delete Menu Item Error:", error.message);
    },
  });
};
