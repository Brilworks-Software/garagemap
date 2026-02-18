import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceService } from '../services/ServiceService';
import { Service } from '../types';

// Query key factory for service-related queries
export const serviceKeys = {
  all: ['services'] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (serviceId: string) => [...serviceKeys.details(), serviceId] as const,
  byOwner: (ownerId: string) => [...serviceKeys.all, 'owner', ownerId] as const,
};

/**
 * Hook to fetch a single service by serviceId.
 * @param serviceId - The service ID (same as ownerId).
 * @param options - Optional React Query options.
 */
export const useGetService = (serviceId: string, options = {}) => {
  return useQuery<Service | null>({
    queryKey: serviceKeys.detail(serviceId),
    queryFn: () => ServiceService.getService(serviceId),
    enabled: !!serviceId, // Only run query if serviceId is available
    ...options,
  });
};

/**
 * Hook to fetch a service by ownerId.
 * Since serviceId = ownerId, this is a convenience hook.
 * @param ownerId - The owner's unique ID (user's uid).
 * @param options - Optional React Query options.
 */
export const useGetServiceByOwnerId = (ownerId: string, options = {}) => {
  return useQuery<Service | null>({
    queryKey: serviceKeys.byOwner(ownerId),
    queryFn: () => ServiceService.getServiceByOwnerId(ownerId),
    enabled: !!ownerId, // Only run query if ownerId is available
    ...options,
  });
};

/**
 * Hook to create a new service document.
 * This should typically be called after a user signs up and provides service information.
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ownerId,
      serviceData,
    }: {
      ownerId: string;
      serviceData: Omit<Service, 'serviceId' | 'ownerId' | 'createdAt' | 'updatedAt'>;
    }) => ServiceService.createService(ownerId, serviceData),
    onSuccess: (serviceId, variables) => {
      // Invalidate service queries to refetch the new service's data
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(serviceId) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.byOwner(variables.ownerId) });
    },
    onError: (error: Error) => {
      console.error('Create Service Error:', error.message);
    },
  });
};

/**
 * Hook to update a service's information.
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      data,
    }: {
      serviceId: string;
      data: Partial<Omit<Service, 'serviceId' | 'ownerId' | 'createdAt'>>;
    }) => ServiceService.updateService(serviceId, data),
    onSuccess: (_, variables) => {
      // After updating, refetch the service's data to keep it fresh
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.serviceId) });
      // Also invalidate by owner since serviceId = ownerId
      queryClient.invalidateQueries({ queryKey: serviceKeys.byOwner(variables.serviceId) });
    },
    onError: (error: Error) => {
      console.error('Update Service Error:', error.message);
    },
  });
};

/**
 * Hook to delete a service document.
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => ServiceService.deleteService(serviceId),
    onSuccess: (_, serviceId) => {
      // Remove the deleted service's data from the cache
      queryClient.removeQueries({ queryKey: serviceKeys.detail(serviceId) });
      queryClient.removeQueries({ queryKey: serviceKeys.byOwner(serviceId) });
    },
    onError: (error: Error) => {
      console.error('Delete Service Error:', error.message);
    },
  });
};
