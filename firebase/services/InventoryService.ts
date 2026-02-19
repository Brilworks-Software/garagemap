import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Inventory } from "../types";

const INVENTORY_COLLECTION = "inventory";

export const InventoryService = {
  /**
   * Creates a new inventory item document in the 'inventory' collection.
   * @param serviceId - The service ID that owns this inventory item.
   * @param inventoryData - The inventory data (excluding itemId, serviceId, createdAt, updatedAt).
   * @returns The generated itemId.
   */
  createInventoryItem: async (
    serviceId: string,
    inventoryData: Omit<Inventory, "itemId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique itemId
      const itemRef = doc(collection(db, INVENTORY_COLLECTION));
      const itemId = itemRef.id;
      
      // Determine status based on quantity
      let status: "active" | "inactive" | "out-of-stock" | "low-stock" | null = inventoryData.status || "active";
      if (inventoryData.quantity === 0) {
        status = "out-of-stock";
      } else if (inventoryData.minStockLevel && inventoryData.quantity <= inventoryData.minStockLevel) {
        status = "low-stock";
      }
      
      await setDoc(itemRef, {
        itemId,
        serviceId,
        ...inventoryData,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Inventory item document created successfully!");
      return itemId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating inventory item document: ", err);
      throw new Error(err.message || "Failed to create inventory item");
    }
  },

  /**
   * Retrieves an inventory item document from Firestore by itemId.
   * @param itemId - The inventory item's unique ID.
   * @returns The inventory item data or null if not found.
   */
  getInventoryItem: async (itemId: string): Promise<Inventory | null> => {
    try {
      const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
      const docSnap = await getDoc(itemRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          itemId,
          ...data,
        } as Inventory;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching inventory item document: ", err);
      throw new Error(err.message || "Failed to fetch inventory item");
    }
  },

  /**
   * Retrieves all inventory items for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of inventory item data.
   */
  getInventoryByServiceId: async (serviceId: string): Promise<Inventory[]> => {
    try {
      const inventoryRef = collection(db, INVENTORY_COLLECTION);
      const q = query(
        inventoryRef,
        where("serviceId", "==", serviceId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const items: Inventory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          itemId: doc.id,
          ...data,
        } as Inventory);
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching inventory by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch inventory");
    }
  },

  /**
   * Retrieves inventory items by category for a specific service.
   * @param serviceId - The service ID.
   * @param category - The category to filter by.
   * @returns Array of inventory item data.
   */
  getInventoryByCategory: async (serviceId: string, category: string): Promise<Inventory[]> => {
    try {
      const inventoryRef = collection(db, INVENTORY_COLLECTION);
      const q = query(
        inventoryRef,
        where("serviceId", "==", serviceId),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const items: Inventory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          itemId: doc.id,
          ...data,
        } as Inventory);
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching inventory by category: ", err);
      throw new Error(err.message || "Failed to fetch inventory by category");
    }
  },

  /**
   * Retrieves inventory items by status for a specific service.
   * @param serviceId - The service ID.
   * @param status - The status to filter by.
   * @returns Array of inventory item data.
   */
  getInventoryByStatus: async (serviceId: string, status: "active" | "inactive" | "out-of-stock" | "low-stock"): Promise<Inventory[]> => {
    try {
      const inventoryRef = collection(db, INVENTORY_COLLECTION);
      const q = query(
        inventoryRef,
        where("serviceId", "==", serviceId),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const items: Inventory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          itemId: doc.id,
          ...data,
        } as Inventory);
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching inventory by status: ", err);
      throw new Error(err.message || "Failed to fetch inventory by status");
    }
  },

  /**
   * Updates an inventory item document.
   * @param itemId - The inventory item's unique ID.
   * @param data - The data to update (partial Inventory).
   */
  updateInventoryItem: async (
    itemId: string,
    data: Partial<Omit<Inventory, "itemId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
      
      // If quantity is being updated, check and update status
      if (data.quantity !== undefined) {
        const currentItem = await getDoc(itemRef);
        if (currentItem.exists()) {
          const currentData = currentItem.data() as Inventory;
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
      
      await updateDoc(itemRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Inventory item document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating inventory item document: ", err);
      throw new Error(err.message || "Failed to update inventory item");
    }
  },

  /**
   * Updates inventory quantity (for stock adjustments).
   * @param itemId - The inventory item's unique ID.
   * @param quantityChange - The change in quantity (positive for addition, negative for subtraction).
   * @returns The new quantity.
   */
  adjustInventoryQuantity: async (itemId: string, quantityChange: number): Promise<number> => {
    try {
      const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        throw new Error("Inventory item not found");
      }
      
      const currentData = itemSnap.data() as Inventory;
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
      
      await updateDoc(itemRef, {
        quantity: newQuantity,
        status,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Inventory quantity adjusted successfully!");
      return newQuantity;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error adjusting inventory quantity: ", err);
      throw new Error(err.message || "Failed to adjust inventory quantity");
    }
  },

  /**
   * Deletes an inventory item document.
   * @param itemId - The inventory item's unique ID.
   */
  deleteInventoryItem: async (itemId: string) => {
    try {
      const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
      await deleteDoc(itemRef);
      console.log("Inventory item document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting inventory item document: ", err);
      throw new Error(err.message || "Failed to delete inventory item");
    }
  },
};
