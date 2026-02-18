import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Service } from "../types";

const SERVICES_COLLECTION = "services";

export const ServiceService = {
  /**
   * Creates a new service document in the 'services' collection.
   * The serviceId will be set to the ownerId (user's uid).
   * @param ownerId - The user's unique ID (will be used as serviceId).
   * @param serviceData - The service data (excluding serviceId and ownerId as they're set automatically).
   */
  createService: async (
    ownerId: string,
    serviceData: Omit<Service, "serviceId" | "ownerId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // serviceId is the same as ownerId
      const serviceId = ownerId;
      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      await setDoc(serviceRef, {
        serviceId,
        ownerId,
        ...serviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Service document created successfully!");
      return serviceId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating service document: ", err);
      throw new Error(err.message || "Failed to create service");
    }
  },

  /**
   * Retrieves a service document from Firestore by serviceId (which is the ownerId).
   * @param serviceId - The service ID (same as ownerId/user's uid).
   * @returns The service data or null if not found.
   */
  getService: async (serviceId: string): Promise<Service | null> => {
    try {
      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      const docSnap = await getDoc(serviceRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          serviceId,
          ...data,
        } as Service;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching service document: ", err);
      throw new Error(err.message || "Failed to fetch service");
    }
  },

  /**
   * Retrieves a service document by ownerId (which is the same as serviceId).
   * @param ownerId - The owner's unique ID (user's uid).
   * @returns The service data or null if not found.
   */
  getServiceByOwnerId: async (ownerId: string): Promise<Service | null> => {
    // Since serviceId = ownerId, this is the same as getService
    return ServiceService.getService(ownerId);
  },

  /**
   * Updates a service's document in Firestore.
   * @param serviceId - The service ID (same as ownerId).
   * @param data - The data to update (excluding serviceId and ownerId).
   */
  updateService: async (
    serviceId: string,
    data: Partial<Omit<Service, "serviceId" | "ownerId" | "createdAt">>
  ) => {
    try {
      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      await updateDoc(serviceRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Service document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating service document: ", err);
      throw new Error(err.message || "Failed to update service");
    }
  },

  /**
   * Deletes a service's document from Firestore.
   * @param serviceId - The service ID (same as ownerId).
   */
  deleteService: async (serviceId: string) => {
    try {
      const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
      await deleteDoc(serviceRef);
      console.log("Service document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting service document: ", err);
      throw new Error(err.message || "Failed to delete service");
    }
  },
};
