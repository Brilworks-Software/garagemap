import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Customer } from "../types";

const CUSTOMERS_COLLECTION = "customers";

export const CustomerService = {
  /**
   * Creates a new customer document in the 'customers' collection.
   * @param serviceId - The service ID that owns this customer.
   * @param customerData - The customer data (excluding customerId, serviceId, createdAt, updatedAt).
   * @returns The generated customerId.
   */
  createCustomer: async (
    serviceId: string,
    customerData: Omit<Customer, "customerId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique customerId
      const customerRef = doc(collection(db, CUSTOMERS_COLLECTION));
      const customerId = customerRef.id;
      
      await setDoc(customerRef, {
        customerId,
        serviceId,
        ...customerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Customer document created successfully!");
      return customerId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating customer document: ", err);
      throw new Error(err.message || "Failed to create customer");
    }
  },

  /**
   * Retrieves a customer document from Firestore by customerId.
   * @param customerId - The customer's unique ID.
   * @returns The customer data or null if not found.
   */
  getCustomer: async (customerId: string): Promise<Customer | null> => {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      const docSnap = await getDoc(customerRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          customerId,
          ...data,
        } as Customer;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching customer document: ", err);
      throw new Error(err.message || "Failed to fetch customer");
    }
  },

  /**
   * Retrieves all customers for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of customer data.
   */
  getCustomersByServiceId: async (serviceId: string): Promise<Customer[]> => {
    try {
      const customersRef = collection(db, CUSTOMERS_COLLECTION);
      const q = query(customersRef, where("serviceId", "==", serviceId));
      const querySnapshot = await getDocs(q);
      
      const customers: Customer[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          customerId: doc.id,
          ...data,
        } as Customer);
      });
      
      return customers;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching customers by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch customers");
    }
  },

  /**
   * Updates a customer's document in Firestore.
   * @param customerId - The customer's unique ID.
   * @param data - The data to update (excluding customerId, serviceId, createdAt).
   */
  updateCustomer: async (
    customerId: string,
    data: Partial<Omit<Customer, "customerId" | "serviceId" | "createdAt">>
  ) => {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Customer document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating customer document: ", err);
      throw new Error(err.message || "Failed to update customer");
    }
  },

  /**
   * Deletes a customer's document from Firestore.
   * @param customerId - The customer's unique ID.
   */
  deleteCustomer: async (customerId: string) => {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await deleteDoc(customerRef);
      console.log("Customer document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting customer document: ", err);
      throw new Error(err.message || "Failed to delete customer");
    }
  },
};
