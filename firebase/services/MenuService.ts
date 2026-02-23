import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { MenuItem } from "../types";

const MENU_COLLECTION = "menu";

export const MenuService = {
  /**
   * Creates a new menu item document in the 'menu' collection.
   * @param serviceId - The service ID that owns this menu item.
   * @param menuData - The menu item data (excluding menuId, serviceId, createdAt, updatedAt).
   * @returns The generated menuId.
   */
  createMenuItem: async (
    serviceId: string,
    menuData: Omit<MenuItem, "menuId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique menuId
      const menuRef = doc(collection(db, MENU_COLLECTION));
      const menuId = menuRef.id;
      
      await setDoc(menuRef, {
        menuId,
        serviceId,
        ...menuData,
        status: menuData.status || "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item document created successfully!");
      return menuId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating menu item document: ", err);
      throw new Error(err.message || "Failed to create menu item");
    }
  },

  /**
   * Retrieves a menu item document from Firestore by menuId.
   * @param menuId - The menu item's unique ID.
   * @returns The menu item data or null if not found.
   */
  getMenuItem: async (menuId: string): Promise<MenuItem | null> => {
    try {
      const menuRef = doc(db, MENU_COLLECTION, menuId);
      const docSnap = await getDoc(menuRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          menuId,
          ...data,
        } as MenuItem;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching menu item document: ", err);
      throw new Error(err.message || "Failed to fetch menu item");
    }
  },

  /**
   * Retrieves all menu items for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of menu item data.
   */
  getMenuByServiceId: async (serviceId: string): Promise<MenuItem[]> => {
    try {
      const menuRef = collection(db, MENU_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          menuRef,
          where("serviceId", "==", serviceId),
          orderBy("createdAt", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            menuRef,
            where("serviceId", "==", serviceId)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          menuId: doc.id,
          ...data,
        } as MenuItem);
      });
      
      // Sort manually if orderBy wasn't used
      items.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 
          (a.createdAt as any)?.toDate?.()?.getTime() || 
          (a.createdAt as any)?.seconds * 1000 || 0;
        const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 
          (b.createdAt as any)?.toDate?.()?.getTime() || 
          (b.createdAt as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching menu by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch menu");
    }
  },

  /**
   * Retrieves active menu items for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of active menu item data.
   */
  getActiveMenuByServiceId: async (serviceId: string): Promise<MenuItem[]> => {
    try {
      const menuRef = collection(db, MENU_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          menuRef,
          where("serviceId", "==", serviceId),
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            menuRef,
            where("serviceId", "==", serviceId),
            where("status", "==", "active")
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          menuId: doc.id,
          ...data,
        } as MenuItem);
      });
      
      // Sort manually if orderBy wasn't used
      items.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 
          (a.createdAt as any)?.toDate?.()?.getTime() || 
          (a.createdAt as any)?.seconds * 1000 || 0;
        const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 
          (b.createdAt as any)?.toDate?.()?.getTime() || 
          (b.createdAt as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching active menu by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch active menu");
    }
  },

  /**
   * Retrieves menu items by category for a specific service.
   * @param serviceId - The service ID.
   * @param category - The category to filter by.
   * @returns Array of menu item data.
   */
  getMenuByCategory: async (serviceId: string, category: string): Promise<MenuItem[]> => {
    try {
      const menuRef = collection(db, MENU_COLLECTION);
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        const q = query(
          menuRef,
          where("serviceId", "==", serviceId),
          where("category", "==", category),
          orderBy("createdAt", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If orderBy fails (index not created), use simple where query
        if (orderByError?.code === "failed-precondition" || orderByError?.message?.includes("index")) {
          const q = query(
            menuRef,
            where("serviceId", "==", serviceId),
            where("category", "==", category)
          );
          querySnapshot = await getDocs(q);
        } else {
          throw orderByError;
        }
      }
      
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          menuId: doc.id,
          ...data,
        } as MenuItem);
      });
      
      // Sort manually if orderBy wasn't used
      items.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 
          (a.createdAt as any)?.toDate?.()?.getTime() || 
          (a.createdAt as any)?.seconds * 1000 || 0;
        const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 
          (b.createdAt as any)?.toDate?.()?.getTime() || 
          (b.createdAt as any)?.seconds * 1000 || 0;
        return bDate - aDate;
      });
      
      return items;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching menu by category: ", err);
      throw new Error(err.message || "Failed to fetch menu by category");
    }
  },

  /**
   * Updates a menu item document.
   * @param menuId - The menu item's unique ID.
   * @param data - The data to update (partial MenuItem).
   */
  updateMenuItem: async (
    menuId: string,
    data: Partial<Omit<MenuItem, "menuId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const menuRef = doc(db, MENU_COLLECTION, menuId);
      await updateDoc(menuRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating menu item document: ", err);
      throw new Error(err.message || "Failed to update menu item");
    }
  },

  /**
   * Deletes a menu item document.
   * @param menuId - The menu item's unique ID.
   */
  deleteMenuItem: async (menuId: string) => {
    try {
      const menuRef = doc(db, MENU_COLLECTION, menuId);
      await deleteDoc(menuRef);
      console.log("Menu item document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting menu item document: ", err);
      throw new Error(err.message || "Failed to delete menu item");
    }
  },
};
