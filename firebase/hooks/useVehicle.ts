import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleService } from '../services/VehicleService';
import { Vehicle } from '../types';

// Query key factory for vehicle-related queries
export const vehicleKeys = {
  all: ['vehicles'] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (vehicleId: string) => [...vehicleKeys.details(), vehicleId] as const,
  byCustomer: (customerId: string) => [...vehicleKeys.all, 'customer', customerId] as const,
  byService: (serviceId: string) => [...vehicleKeys.all, 'service', serviceId] as const,
};

/**
 * Hook to fetch a single vehicle by vehicleId.
 * @param vehicleId - The vehicle's unique ID.
 * @param options - Optional React Query options.
 */
export const useGetVehicle = (vehicleId: string, options = {}) => {
  return useQuery<Vehicle | null>({
    queryKey: vehicleKeys.detail(vehicleId),
    queryFn: () => VehicleService.getVehicle(vehicleId),
    enabled: !!vehicleId, // Only run query if vehicleId is available
    ...options,
  });
};

/**
 * Hook to fetch all vehicles for a specific customer.
 * @param customerId - The customer ID.
 * @param options - Optional React Query options.
 */
export const useGetVehiclesByCustomerId = (customerId: string, options = {}) => {
  return useQuery<Vehicle[]>({
    queryKey: vehicleKeys.byCustomer(customerId),
    queryFn: () => VehicleService.getVehiclesByCustomerId(customerId),
    enabled: !!customerId, // Only run query if customerId is available
    ...options,
  });
};

/**
 * Hook to fetch all vehicles for a specific service.
 * @param serviceId - The service ID.
 * @param options - Optional React Query options.
 */
export const useGetVehiclesByServiceId = (serviceId: string, options = {}) => {
  return useQuery<Vehicle[]>({
    queryKey: vehicleKeys.byService(serviceId),
    queryFn: () => VehicleService.getVehiclesByServiceId(serviceId),
    enabled: !!serviceId, // Only run query if serviceId is available
    ...options,
  });
};

/**
 * Hook to create a new vehicle document.
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      serviceId,
      vehicleData,
    }: {
      customerId: string;
      serviceId: string;
      vehicleData: Omit<Vehicle, 'vehicleId' | 'customerId' | 'serviceId' | 'createdAt' | 'updatedAt'>;
    }) => VehicleService.createVehicle(customerId, serviceId, vehicleData),
    onSuccess: (vehicleId, variables) => {
      // Invalidate vehicle queries to refetch the new vehicle's data
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byCustomer(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byService(variables.serviceId) });
    },
    onError: (error: Error) => {
      console.error('Create Vehicle Error:', error.message);
    },
  });
};

/**
 * Hook to update a vehicle's information.
 */
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      vehicleId,
      data,
    }: {
      vehicleId: string;
      data: Partial<Omit<Vehicle, 'vehicleId' | 'customerId' | 'serviceId' | 'createdAt'>>;
    }) => VehicleService.updateVehicle(vehicleId, data),
    onSuccess: (_, variables) => {
      // After updating, refetch the vehicle's data to keep it fresh
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
      // Invalidate all vehicle queries to refresh lists
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (error: Error) => {
      console.error('Update Vehicle Error:', error.message);
    },
  });
};

/**
 * Hook to delete a vehicle document.
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => VehicleService.deleteVehicle(vehicleId),
    onSuccess: (_, vehicleId) => {
      // Remove the deleted vehicle's data from the cache
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      // Invalidate all vehicle queries to refresh lists
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (error: Error) => {
      console.error('Delete Vehicle Error:', error.message);
    },
  });
};
