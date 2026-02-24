import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Sale } from "../types";

const SALES_COLLECTION = "sales";

export const SaleService = {
  /**
   * Creates a new sale document in the 'sales' collection.
   * @param serviceId - The service ID that owns this sale.
   * @param saleData - The sale data (excluding saleId, serviceId, createdAt, updatedAt).
   * @returns The generated saleId.
   */
  createSale: async (
    serviceId: string,
    saleData: Omit<Sale, "saleId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique saleId
      const saleRef = doc(collection(db, SALES_COLLECTION));
      const saleId = saleRef.id;
      
      await setDoc(saleRef, {
        saleId,
        serviceId,
        ...saleData,
        status: saleData.status || "completed",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Sale document created successfully!");
      return saleId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating sale document: ", err);
      throw new Error(err.message || "Failed to create sale");
    }
  },

  /**
   * Retrieves a sale document from Firestore by saleId.
   * @param saleId - The sale's unique ID.
   * @returns The sale data or null if not found.
   */
  getSale: async (saleId: string): Promise<Sale | null> => {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const docSnap = await getDoc(saleRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          saleId,
          ...data,
        } as Sale;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching sale document: ", err);
      throw new Error(err.message || "Failed to fetch sale");
    }
  },

  /**
   * Retrieves all sales for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of sale data.
   */
  getSalesByServiceId: async (serviceId: string): Promise<Sale[]> => {
    try {
      const salesRef = collection(db, SALES_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          salesRef,
          where("serviceId", "==", serviceId),
          orderBy("saleDate", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            salesRef,
            where("serviceId", "==", serviceId)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const sales: Sale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          saleId: doc.id,
          ...data,
        } as Sale);
      });
      
      // Sort manually if orderBy wasn't used
      sales.sort((a, b) => {
        const aDate = a.saleDate instanceof Date ? a.saleDate.getTime() : 
          (a.saleDate as any)?.toDate?.()?.getTime() || 
          (a.saleDate as any)?.seconds * 1000 || 0;
        const bDate = b.saleDate instanceof Date ? b.saleDate.getTime() : 
          (b.saleDate as any)?.toDate?.()?.getTime() || 
          (b.saleDate as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return sales;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching sales by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch sales");
    }
  },

  /**
   * Retrieves sales by customer ID for a specific service.
   * @param serviceId - The service ID.
   * @param customerId - The customer ID.
   * @returns Array of sale data.
   */
  getSalesByCustomerId: async (serviceId: string, customerId: string): Promise<Sale[]> => {
    try {
      const salesRef = collection(db, SALES_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          salesRef,
          where("serviceId", "==", serviceId),
          where("customerId", "==", customerId),
          orderBy("saleDate", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            salesRef,
            where("serviceId", "==", serviceId),
            where("customerId", "==", customerId)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const sales: Sale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          saleId: doc.id,
          ...data,
        } as Sale);
      });
      
      // Sort manually if orderBy wasn't used
      sales.sort((a, b) => {
        const aDate = a.saleDate instanceof Date ? a.saleDate.getTime() : 
          (a.saleDate as any)?.toDate?.()?.getTime() || 
          (a.saleDate as any)?.seconds * 1000 || 0;
        const bDate = b.saleDate instanceof Date ? b.saleDate.getTime() : 
          (b.saleDate as any)?.toDate?.()?.getTime() || 
          (b.saleDate as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return sales;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching sales by customerId: ", err);
      throw new Error(err.message || "Failed to fetch sales by customer");
    }
  },

  /**
   * Retrieves sales by status for a specific service.
   * @param serviceId - The service ID.
   * @param status - The sale status.
   * @returns Array of sale data.
   */
  getSalesByStatus: async (
    serviceId: string,
    status: "pending" | "completed" | "cancelled" | "refunded"
  ): Promise<Sale[]> => {
    try {
      const salesRef = collection(db, SALES_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          salesRef,
          where("serviceId", "==", serviceId),
          where("status", "==", status),
          orderBy("saleDate", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            salesRef,
            where("serviceId", "==", serviceId),
            where("status", "==", status)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const sales: Sale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          saleId: doc.id,
          ...data,
        } as Sale);
      });
      
      // Sort manually if orderBy wasn't used
      sales.sort((a, b) => {
        const aDate = a.saleDate instanceof Date ? a.saleDate.getTime() : 
          (a.saleDate as any)?.toDate?.()?.getTime() || 
          (a.saleDate as any)?.seconds * 1000 || 0;
        const bDate = b.saleDate instanceof Date ? b.saleDate.getTime() : 
          (b.saleDate as any)?.toDate?.()?.getTime() || 
          (b.saleDate as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return sales;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching sales by status: ", err);
      throw new Error(err.message || "Failed to fetch sales by status");
    }
  },

  /**
   * Updates a sale document.
   * @param saleId - The sale's unique ID.
   * @param data - The data to update (partial Sale).
   */
  updateSale: async (
    saleId: string,
    data: Partial<Omit<Sale, "saleId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      await updateDoc(saleRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Sale document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating sale document: ", err);
      throw new Error(err.message || "Failed to update sale");
    }
  },

  /**
   * Deletes a sale document.
   * @param saleId - The sale's unique ID.
   */
  deleteSale: async (saleId: string) => {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      await deleteDoc(saleRef);
      console.log("Sale document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting sale document: ", err);
      throw new Error(err.message || "Failed to delete sale");
    }
  },
};
