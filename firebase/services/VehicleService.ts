import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Vehicle } from "../types";

const VEHICLES_COLLECTION = "vehicles";

export const VehicleService = {
  /**
   * Creates a new vehicle document in the 'vehicles' collection.
   * @param customerId - The customer ID that owns this vehicle.
   * @param serviceId - The service ID that this vehicle belongs to.
   * @param vehicleData - The vehicle data (excluding vehicleId, customerId, serviceId, createdAt, updatedAt).
   * @returns The generated vehicleId.
   */
  createVehicle: async (
    customerId: string,
    serviceId: string,
    vehicleData: Omit<Vehicle, "vehicleId" | "customerId" | "serviceId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique vehicleId
      const vehicleRef = doc(collection(db, VEHICLES_COLLECTION));
      const vehicleId = vehicleRef.id;
      
      await setDoc(vehicleRef, {
        vehicleId,
        customerId,
        serviceId,
        ...vehicleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Vehicle document created successfully!");
      return vehicleId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating vehicle document: ", err);
      throw new Error(err.message || "Failed to create vehicle");
    }
  },

  /**
   * Retrieves a vehicle document from Firestore by vehicleId.
   * @param vehicleId - The vehicle's unique ID.
   * @returns The vehicle data or null if not found.
   */
  getVehicle: async (vehicleId: string): Promise<Vehicle | null> => {
    try {
      const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      const docSnap = await getDoc(vehicleRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          vehicleId,
          ...data,
        } as Vehicle;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching vehicle document: ", err);
      throw new Error(err.message || "Failed to fetch vehicle");
    }
  },

  /**
   * Retrieves all vehicles for a specific customer.
   * @param customerId - The customer ID.
   * @returns Array of vehicle data.
   */
  getVehiclesByCustomerId: async (customerId: string): Promise<Vehicle[]> => {
    try {
      const vehiclesRef = collection(db, VEHICLES_COLLECTION);
      const q = query(vehiclesRef, where("customerId", "==", customerId));
      const querySnapshot = await getDocs(q);
      
      const vehicles: Vehicle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vehicles.push({
          vehicleId: doc.id,
          ...data,
        } as Vehicle);
      });
      
      return vehicles;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching vehicles by customerId: ", err);
      throw new Error(err.message || "Failed to fetch vehicles");
    }
  },

  /**
   * Retrieves all vehicles for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of vehicle data.
   */
  getVehiclesByServiceId: async (serviceId: string): Promise<Vehicle[]> => {
    try {
      const vehiclesRef = collection(db, VEHICLES_COLLECTION);
      const q = query(vehiclesRef, where("serviceId", "==", serviceId));
      const querySnapshot = await getDocs(q);
      
      const vehicles: Vehicle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vehicles.push({
          vehicleId: doc.id,
          ...data,
        } as Vehicle);
      });
      
      return vehicles;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching vehicles by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch vehicles");
    }
  },

  /**
   * Updates a vehicle's document in Firestore.
   * @param vehicleId - The vehicle's unique ID.
   * @param data - The data to update (excluding vehicleId, customerId, serviceId, createdAt).
   */
  updateVehicle: async (
    vehicleId: string,
    data: Partial<Omit<Vehicle, "vehicleId" | "customerId" | "serviceId" | "createdAt">>
  ) => {
    try {
      const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await updateDoc(vehicleRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Vehicle document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating vehicle document: ", err);
      throw new Error(err.message || "Failed to update vehicle");
    }
  },

  /**
   * Deletes a vehicle's document from Firestore.
   * @param vehicleId - The vehicle's unique ID.
   */
  deleteVehicle: async (vehicleId: string) => {
    try {
      const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await deleteDoc(vehicleRef);
      console.log("Vehicle document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting vehicle document: ", err);
      throw new Error(err.message || "Failed to delete vehicle");
    }
  },
};
