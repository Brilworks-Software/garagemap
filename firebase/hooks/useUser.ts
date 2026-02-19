import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/UserService';
import { User } from '../types';

// Query key factory for user-related queries
export const userKeys = {
  all: ['users'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (uid: string) => [...userKeys.details(), uid] as const,
  byService: (serviceId: string) => [...userKeys.all, 'service', serviceId] as const,
};

/**
 * Hook to fetch a single user's profile.
 * @param uid - The user's unique ID.
 * @param options - Optional React Query options.
 */
export const useGetUser = (uid: string, options = {}) => {
  return useQuery<User | null>({
    queryKey: userKeys.detail(uid),
    queryFn: () => UserService.getUser(uid),
    enabled: !!uid, // Only run query if UID is available
    ...options,
  });
};

/**
 * Hook to create a new user document.
 * This should typically be called after a user signs up.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: Pick<User, 'uid'> & Partial<User>) => UserService.createUser(user),
    onSuccess: (_, variables) => {
      // Invalidate user queries to refetch the new user's data
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.uid) });
    },
  });
};

/**
 * Hook to update a user's profile.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<User> }) =>
      UserService.updateUser(uid, data),
    onSuccess: (_, variables) => {
      // After updating, refetch the user's data to keep it fresh
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.uid) });
    },
  });
};

/**
 * Hook to fetch all users for a specific service.
 * @param serviceId - The service ID.
 * @param options - Optional React Query options.
 */
export const useGetUsersByServiceId = (serviceId: string, options = {}) => {
  return useQuery<User[]>({
    queryKey: userKeys.byService(serviceId),
    queryFn: () => UserService.getUsersByServiceId(serviceId),
    enabled: !!serviceId, // Only run query if serviceId is available
    ...options,
  });
};

/**
 * Hook to delete a user document.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => UserService.deleteUser(uid),
    onSuccess: (_, uid) => {
      // Remove the deleted user's data from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(uid) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};