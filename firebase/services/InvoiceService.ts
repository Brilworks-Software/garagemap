import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Invoice } from "../types";

const INVOICES_COLLECTION = "invoices";

export const InvoiceService = {
  /**
   * Creates a new invoice document in the 'invoices' collection.
   * @param serviceId - The service ID that owns this invoice.
   * @param invoiceData - The invoice data (excluding invoiceId, serviceId, createdAt, updatedAt).
   * @returns The generated invoiceId.
   */
  createInvoice: async (
    serviceId: string,
    invoiceData: Omit<Invoice, "invoiceId" | "serviceId" | "invoiceNumber" | "pdfUrl" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique invoiceId
      const invoiceRef = doc(collection(db, INVOICES_COLLECTION));
      const invoiceId = invoiceRef.id;
      
      // Generate invoice number (INV-YYYYMMDD-XXXX format)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceNumber = `INV-${dateStr}-${randomStr}`;
      
      await setDoc(invoiceRef, {
        invoiceId,
        serviceId,
        invoiceNumber,
        pdfUrl: null, // Will be set after PDF upload to Storage
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Invoice document created successfully!");
      return invoiceId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating invoice document: ", err);
      throw new Error(err.message || "Failed to create invoice");
    }
  },

  /**
   * Retrieves an invoice document from Firestore by invoiceId.
   * @param invoiceId - The invoice's unique ID.
   * @returns The invoice data or null if not found.
   */
  getInvoice: async (invoiceId: string): Promise<Invoice | null> => {
    try {
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
      const docSnap = await getDoc(invoiceRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          invoiceId,
          ...data,
        } as Invoice;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching invoice document: ", err);
      throw new Error(err.message || "Failed to fetch invoice");
    }
  },

  /**
   * Retrieves all invoices for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of invoice data.
   */
  getInvoicesByServiceId: async (serviceId: string): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, INVOICES_COLLECTION);
      const q = query(
        invoicesRef,
        where("serviceId", "==", serviceId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        invoiceId: doc.id,
        ...doc.data(),
      })) as Invoice[];
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching invoices: ", err);
      throw new Error(err.message || "Failed to fetch invoices");
    }
  },

  /**
   * Retrieves all invoices for a specific job.
   * @param jobId - The job ID.
   * @returns Array of invoice data.
   */
  getInvoicesByJobId: async (jobId: string): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, INVOICES_COLLECTION);
      const q = query(
        invoicesRef,
        where("jobId", "==", jobId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        invoiceId: doc.id,
        ...doc.data(),
      })) as Invoice[];
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching invoices by job: ", err);
      throw new Error(err.message || "Failed to fetch invoices");
    }
  },

  /**
   * Retrieves all invoices for a specific customer.
   * @param customerId - The customer ID.
   * @returns Array of invoice data.
   */
  getInvoicesByCustomerId: async (customerId: string): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, INVOICES_COLLECTION);
      const q = query(
        invoicesRef,
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        invoiceId: doc.id,
        ...doc.data(),
      })) as Invoice[];
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching invoices by customer: ", err);
      throw new Error(err.message || "Failed to fetch invoices");
    }
  },

  /**
   * Updates an invoice document.
   * @param invoiceId - The invoice's unique ID.
   * @param data - The data to update (partial Invoice).
   */
  updateInvoice: async (
    invoiceId: string,
    data: Partial<Omit<Invoice, "invoiceId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
      await updateDoc(invoiceRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Invoice document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating invoice document: ", err);
      throw new Error(err.message || "Failed to update invoice");
    }
  },

  /**
   * Deletes an invoice document.
   * @param invoiceId - The invoice's unique ID.
   */
  deleteInvoice: async (invoiceId: string) => {
    try {
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
      await deleteDoc(invoiceRef);
      console.log("Invoice document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting invoice document: ", err);
      throw new Error(err.message || "Failed to delete invoice");
    }
  },
};
