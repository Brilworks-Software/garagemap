import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobService } from '../services/JobService';
import { Job } from '../types';

// Query key factory for job-related queries
export const jobKeys = {
  all: ['jobs'] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (jobId: string) => [...jobKeys.details(), jobId] as const,
  byService: (serviceId: string) => [...jobKeys.all, 'service', serviceId] as const,
  byCustomer: (customerId: string) => [...jobKeys.all, 'customer', customerId] as const,
  byVehicle: (vehicleId: string) => [...jobKeys.all, 'vehicle', vehicleId] as const,
};

/**
 * Hook to fetch a single job by jobId.
 * @param jobId - The job's unique ID.
 * @param options - Optional React Query options.
 */
export const useGetJob = (jobId: string, options = {}) => {
  return useQuery<Job | null>({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => JobService.getJob(jobId),
    enabled: !!jobId, // Only run query if jobId is available
    ...options,
  });
};

/**
 * Hook to fetch all jobs for a specific service.
 * @param serviceId - The service ID.
 * @param options - Optional React Query options.
 */
export const useGetJobsByServiceId = (serviceId: string, options = {}) => {
  return useQuery<Job[]>({
    queryKey: jobKeys.byService(serviceId),
    queryFn: () => JobService.getJobsByServiceId(serviceId),
    enabled: !!serviceId, // Only run query if serviceId is available
    ...options,
  });
};

/**
 * Hook to fetch all jobs for a specific customer.
 * @param customerId - The customer ID.
 * @param options - Optional React Query options.
 */
export const useGetJobsByCustomerId = (customerId: string, options = {}) => {
  return useQuery<Job[]>({
    queryKey: jobKeys.byCustomer(customerId),
    queryFn: () => JobService.getJobsByCustomerId(customerId),
    enabled: !!customerId, // Only run query if customerId is available
    ...options,
  });
};

/**
 * Hook to fetch all jobs for a specific vehicle.
 * @param vehicleId - The vehicle ID.
 * @param options - Optional React Query options.
 */
export const useGetJobsByVehicleId = (vehicleId: string, options = {}) => {
  return useQuery<Job[]>({
    queryKey: jobKeys.byVehicle(vehicleId),
    queryFn: () => JobService.getJobsByVehicleId(vehicleId),
    enabled: !!vehicleId, // Only run query if vehicleId is available
    ...options,
  });
};

/**
 * Hook to create a new job document.
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      customerId,
      vehicleId,
      jobData,
    }: {
      serviceId: string;
      customerId: string;
      vehicleId: string;
      jobData: Omit<Job, 'jobId' | 'serviceId' | 'customerId' | 'vehicleId' | 'createdAt' | 'updatedAt'>;
    }) => JobService.createJob(serviceId, customerId, vehicleId, jobData),
    onSuccess: (jobId, variables) => {
      // Invalidate job queries to refetch the new job's data
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.byCustomer(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.byVehicle(variables.vehicleId) });
    },
    onError: (error: Error) => {
      console.error('Create Job Error:', error.message);
    },
  });
};

/**
 * Hook to update a job's information.
 */
export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: Partial<Omit<Job, 'jobId' | 'serviceId' | 'customerId' | 'vehicleId' | 'createdAt'>>;
    }) => JobService.updateJob(jobId, data),
    onSuccess: (_, variables) => {
      // After updating, refetch the job's data to keep it fresh
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
      // Also invalidate all job queries to refresh lists
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
    onError: (error: Error) => {
      console.error('Update Job Error:', error.message);
    },
  });
};

/**
 * Hook to delete a job document.
 */
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => JobService.deleteJob(jobId),
    onSuccess: (_, jobId) => {
      // Remove the deleted job's data from the cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) });
      // Invalidate all job queries to refresh lists
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
    onError: (error: Error) => {
      console.error('Delete Job Error:', error.message);
    },
  });
};
