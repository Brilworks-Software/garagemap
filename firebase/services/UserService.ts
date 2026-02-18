import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { User } from "../types";

const USERS_COLLECTION = "users";

export const UserService = {
  /**
   * Creates a new user document in the 'users' collection.
   * @param user - The user object, requires at least a uid.
   */
  createUser: async (user: Pick<User, 'uid'> & Partial<User>) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("User document created successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating user document: ", err);
      throw new Error(err.message || "Failed to create user document");
    }
  },

  /**
   * Retrieves a user document from Firestore.
   * @param uid - The user's unique ID.
   * @returns The user data or null if not found.
   */
  getUser: async (uid: string): Promise<User | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as User;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching user document: ", err);
      throw new Error(err.message || "Failed to fetch user document");
    }
  },

  /**
   * Updates a user's document in Firestore.
   * @param uid - The user's unique ID.
   * @param data - The data to update.
   */
  updateUser: async (uid: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("User document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating user document: ", err);
      throw new Error(err.message || "Failed to update user document");
    }
  },

  /**
   * Deletes a user's document from Firestore.
   * @param uid - The user's unique ID.
   */
  deleteUser: async (uid: string) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await deleteDoc(userRef);
      console.log("User document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting user document: ", err);
      throw new Error(err.message || "Failed to delete user document");
    }
  },
};