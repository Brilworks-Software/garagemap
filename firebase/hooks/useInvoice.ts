import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceService } from "../services/InvoiceService";
import { Invoice } from "../types";

// Query keys factory
export const invoiceKeys = {
  all: ["invoices"] as const,
  detail: (invoiceId: string) => ["invoices", invoiceId] as const,
  byService: (serviceId: string) => ["invoices", "service", serviceId] as const,
  byJob: (jobId: string) => ["invoices", "job", jobId] as const,
  byCustomer: (customerId: string) => ["invoices", "customer", customerId] as const,
};

/**
 * Hook to fetch an invoice by ID.
 */
export const useGetInvoice = (invoiceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: () => InvoiceService.getInvoice(invoiceId),
    enabled: options?.enabled !== false && !!invoiceId,
  });
};

/**
 * Hook to fetch all invoices for a service.
 */
export const useGetInvoicesByServiceId = (serviceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: invoiceKeys.byService(serviceId),
    queryFn: () => InvoiceService.getInvoicesByServiceId(serviceId),
    enabled: options?.enabled !== false && !!serviceId,
  });
};

/**
 * Hook to fetch all invoices for a job.
 */
export const useGetInvoicesByJobId = (jobId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: invoiceKeys.byJob(jobId),
    queryFn: () => InvoiceService.getInvoicesByJobId(jobId),
    enabled: options?.enabled !== false && !!jobId,
  });
};

/**
 * Hook to fetch all invoices for a customer.
 */
export const useGetInvoicesByCustomerId = (customerId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: invoiceKeys.byCustomer(customerId),
    queryFn: () => InvoiceService.getInvoicesByCustomerId(customerId),
    enabled: options?.enabled !== false && !!customerId,
  });
};

/**
 * Hook to create a new invoice.
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      invoiceData,
    }: {
      serviceId: string;
      invoiceData: Omit<Invoice, "invoiceId" | "serviceId" | "invoiceNumber" | "pdfUrl" | "createdAt" | "updatedAt">;
    }) => InvoiceService.createInvoice(serviceId, invoiceData),
    onSuccess: (invoiceId, variables) => {
      // Invalidate invoice queries to refetch the new invoice's data
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byService(variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byJob(variables.invoiceData.jobId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byCustomer(variables.invoiceData.customerId) });
    },
    onError: (error: Error) => {
      console.error("Create Invoice Error:", error.message);
    },
  });
};

/**
 * Hook to update an invoice.
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: Partial<Omit<Invoice, "invoiceId" | "createdAt" | "updatedAt">>;
    }) => InvoiceService.updateInvoice(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error: Error) => {
      console.error("Update Invoice Error:", error.message);
    },
  });
};

/**
 * Hook to delete an invoice.
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => InvoiceService.deleteInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error: Error) => {
      console.error("Delete Invoice Error:", error.message);
    },
  });
};
