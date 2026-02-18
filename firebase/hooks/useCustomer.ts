import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../types';

// Query key factory for customer-related queries
export const customerKeys = {
  all: ['customers'] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (customerId: string) => [...customerKeys.details(), customerId] as const,
  byService: (serviceId: string) => [...customerKeys.all, 'service', serviceId] as const,
};

/**
 * Hook to fetch a single customer by customerId.
 * @param customerId - The customer's unique ID.
 * @param options - Optional React Query options.
 */
export const useGetCustomer = (customerId: string, options = {}) => {
  return useQuery<Customer | null>({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => CustomerService.getCustomer(customerId),
    enabled: !!customerId, // Only run query if customerId is available
    ...options,
  });
};

/**
 * Hook to fetch all customers for a specific service.
 * @param serviceId - The service ID.
 * @param options - Optional React Query options.
 */
export const useGetCustomersByServiceId = (serviceId: string, options = {}) => {
  return useQuery<Customer[]>({
    queryKey: customerKeys.byService(serviceId),
    queryFn: () => CustomerService.getCustomersByServiceId(serviceId),
    enabled: !!serviceId, // Only run query if serviceId is available
    ...options,
  });
};

/**
 * Hook to create a new customer document.
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      customerData,
    }: {
      serviceId: string;
      customerData: Omit<Customer, 'customerId' | 'serviceId' | 'createdAt' | 'updatedAt'>;
    }) => CustomerService.createCustomer(serviceId, customerData),
    onSuccess: (customerId, variables) => {
      // Invalidate customer queries to refetch the new customer's data
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.byService(variables.serviceId) });
    },
    onError: (error: Error) => {
      console.error('Create Customer Error:', error.message);
    },
  });
};

/**
 * Hook to update a customer's information.
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Partial<Omit<Customer, 'customerId' | 'serviceId' | 'createdAt'>>;
    }) => CustomerService.updateCustomer(customerId, data),
    onSuccess: (_, variables) => {
      // After updating, refetch the customer's data to keep it fresh
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
      // Also invalidate the service's customers list
      // Note: We need to get the serviceId from the customer data, but we don't have it here
      // So we'll invalidate all customer queries or the caller should handle this
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (error: Error) => {
      console.error('Update Customer Error:', error.message);
    },
  });
};

/**
 * Hook to delete a customer document.
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => CustomerService.deleteCustomer(customerId),
    onSuccess: (_, customerId) => {
      // Remove the deleted customer's data from the cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(customerId) });
      // Invalidate all customer queries to refresh lists
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (error: Error) => {
      console.error('Delete Customer Error:', error.message);
    },
  });
};
