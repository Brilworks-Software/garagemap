import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Part } from "../types";

const PARTS_COLLECTION = "parts";

export const PartService = {
  /**
   * Creates a new part document in the 'parts' collection.
   * @param serviceId - The service ID that owns this part.
   * @param partData - The part data (excluding partId, serviceId, createdAt, updatedAt).
   * @returns The generated partId.
   */
  createPart: async (
    serviceId: string,
    partData: Omit<Part, "partId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique partId
      const partRef = doc(collection(db, PARTS_COLLECTION));
      const partId = partRef.id;
      
      // Determine status based on quantity
      let status: "active" | "inactive" | "out-of-stock" | "low-stock" | null = partData.status || "active";
      if (partData.quantity === 0) {
        status = "out-of-stock";
      } else if (partData.minStockLevel && partData.quantity <= partData.minStockLevel) {
        status = "low-stock";
      }
      
      await setDoc(partRef, {
        partId,
        serviceId,
        ...partData,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Part document created successfully!");
      return partId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating part document: ", err);
      throw new Error(err.message || "Failed to create part");
    }
  },

  /**
   * Retrieves a part document from Firestore by partId.
   * @param partId - The part's unique ID.
   * @returns The part data or null if not found.
   */
  getPart: async (partId: string): Promise<Part | null> => {
    try {
      const partRef = doc(db, PARTS_COLLECTION, partId);
      const docSnap = await getDoc(partRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          partId,
          ...data,
        } as Part;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching part document: ", err);
      throw new Error(err.message || "Failed to fetch part");
    }
  },

  /**
   * Retrieves all parts for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of part data.
   */
  getPartsByServiceId: async (serviceId: string): Promise<Part[]> => {
    try {
      const partsRef = collection(db, PARTS_COLLECTION);
      const q = query(
        partsRef,
        where("serviceId", "==", serviceId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const parts: Part[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parts.push({
          partId: doc.id,
          ...data,
        } as Part);
      });
      
      return parts;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching parts by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch parts");
    }
  },

  /**
   * Retrieves parts by category for a specific service.
   * @param serviceId - The service ID.
   * @param category - The category to filter by.
   * @returns Array of part data.
   */
  getPartsByCategory: async (serviceId: string, category: string): Promise<Part[]> => {
    try {
      const partsRef = collection(db, PARTS_COLLECTION);
      const q = query(
        partsRef,
        where("serviceId", "==", serviceId),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const parts: Part[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parts.push({
          partId: doc.id,
          ...data,
        } as Part);
      });
      
      return parts;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching parts by category: ", err);
      throw new Error(err.message || "Failed to fetch parts by category");
    }
  },

  /**
   * Retrieves parts by status for a specific service.
   * @param serviceId - The service ID.
   * @param status - The status to filter by.
   * @returns Array of part data.
   */
  getPartsByStatus: async (serviceId: string, status: "active" | "inactive" | "out-of-stock" | "low-stock"): Promise<Part[]> => {
    try {
      const partsRef = collection(db, PARTS_COLLECTION);
      const q = query(
        partsRef,
        where("serviceId", "==", serviceId),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const parts: Part[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parts.push({
          partId: doc.id,
          ...data,
        } as Part);
      });
      
      return parts;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching parts by status: ", err);
      throw new Error(err.message || "Failed to fetch parts by status");
    }
  },

  /**
   * Retrieves parts by compatible vehicle make for a specific service.
   * @param serviceId - The service ID.
   * @param make - The vehicle make to filter by.
   * @returns Array of part data.
   */
  getPartsByMake: async (serviceId: string, make: string): Promise<Part[]> => {
    try {
      const partsRef = collection(db, PARTS_COLLECTION);
      const q = query(
        partsRef,
        where("serviceId", "==", serviceId),
        where("compatibleMake", "==", make),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const parts: Part[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parts.push({
          partId: doc.id,
          ...data,
        } as Part);
      });
      
      return parts;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching parts by make: ", err);
      throw new Error(err.message || "Failed to fetch parts by make");
    }
  },

  /**
   * Updates a part document.
   * @param partId - The part's unique ID.
   * @param data - The data to update (partial Part).
   */
  updatePart: async (
    partId: string,
    data: Partial<Omit<Part, "partId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const partRef = doc(db, PARTS_COLLECTION, partId);
      
      // If quantity is being updated, check and update status
      if (data.quantity !== undefined) {
        const currentPart = await getDoc(partRef);
        if (currentPart.exists()) {
          const currentData = currentPart.data() as Part;
          const newQuantity = data.quantity;
          
          if (newQuantity === 0) {
            data.status = "out-of-stock";
          } else if (currentData.minStockLevel && newQuantity <= currentData.minStockLevel) {
            data.status = "low-stock";
          } else if (data.status === "out-of-stock" || data.status === "low-stock") {
            data.status = "active";
          }
        }
      }
      
      await updateDoc(partRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Part document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating part document: ", err);
      throw new Error(err.message || "Failed to update part");
    }
  },

  /**
   * Updates part quantity (for stock adjustments).
   * @param partId - The part's unique ID.
   * @param quantityChange - The change in quantity (positive for addition, negative for subtraction).
   * @returns The new quantity.
   */
  adjustPartQuantity: async (partId: string, quantityChange: number): Promise<number> => {
    try {
      const partRef = doc(db, PARTS_COLLECTION, partId);
      const partSnap = await getDoc(partRef);
      
      if (!partSnap.exists()) {
        throw new Error("Part not found");
      }
      
      const currentData = partSnap.data() as Part;
      const newQuantity = Math.max(0, (currentData.quantity || 0) + quantityChange);
      
      // Update status based on new quantity
      let status: "active" | "inactive" | "out-of-stock" | "low-stock" | null = currentData.status || "active";
      if (newQuantity === 0) {
        status = "out-of-stock";
      } else if (currentData.minStockLevel && newQuantity <= currentData.minStockLevel) {
        status = "low-stock";
      } else if (status === "out-of-stock" || status === "low-stock") {
        status = "active";
      }
      
      await updateDoc(partRef, {
        quantity: newQuantity,
        status,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Part quantity adjusted successfully!");
      return newQuantity;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error adjusting part quantity: ", err);
      throw new Error(err.message || "Failed to adjust part quantity");
    }
  },

  /**
   * Deletes a part document.
   * @param partId - The part's unique ID.
   */
  deletePart: async (partId: string) => {
    try {
      const partRef = doc(db, PARTS_COLLECTION, partId);
      await deleteDoc(partRef);
      console.log("Part document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting part document: ", err);
      throw new Error(err.message || "Failed to delete part");
    }
  },
};
