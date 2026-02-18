import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Job } from "../types";

const JOBS_COLLECTION = "jobs";

export const JobService = {
  /**
   * Creates a new job document in the 'jobs' collection.
   * @param serviceId - The service ID that owns this job.
   * @param customerId - The customer ID associated with this job.
   * @param vehicleId - The vehicle ID associated with this job.
   * @param jobData - The job data (excluding jobId, serviceId, customerId, vehicleId, createdAt, updatedAt).
   * @returns The generated jobId.
   */
  createJob: async (
    serviceId: string,
    customerId: string,
    vehicleId: string,
    jobData: Omit<Job, "jobId" | "serviceId" | "customerId" | "vehicleId" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Generate a unique jobId
      const jobRef = doc(collection(db, JOBS_COLLECTION));
      const jobId = jobRef.id;
      
      await setDoc(jobRef, {
        jobId,
        serviceId,
        customerId,
        vehicleId,
        ...jobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Job document created successfully!");
      return jobId;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error creating job document: ", err);
      throw new Error(err.message || "Failed to create job");
    }
  },

  /**
   * Retrieves a job document from Firestore by jobId.
   * @param jobId - The job's unique ID.
   * @returns The job data or null if not found.
   */
  getJob: async (jobId: string): Promise<Job | null> => {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      const docSnap = await getDoc(jobRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          jobId,
          ...data,
        } as Job;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching job document: ", err);
      throw new Error(err.message || "Failed to fetch job");
    }
  },

  /**
   * Retrieves all jobs for a specific service.
   * @param serviceId - The service ID.
   * @returns Array of job data.
   */
  getJobsByServiceId: async (serviceId: string): Promise<Job[]> => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const q = query(jobsRef, where("serviceId", "==", serviceId));
      const querySnapshot = await getDocs(q);
      
      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          jobId: doc.id,
          ...data,
        } as Job);
      });
      
      return jobs;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching jobs by serviceId: ", err);
      throw new Error(err.message || "Failed to fetch jobs");
    }
  },

  /**
   * Retrieves all jobs for a specific customer.
   * @param customerId - The customer ID.
   * @returns Array of job data.
   */
  getJobsByCustomerId: async (customerId: string): Promise<Job[]> => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const q = query(jobsRef, where("customerId", "==", customerId));
      const querySnapshot = await getDocs(q);
      
      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          jobId: doc.id,
          ...data,
        } as Job);
      });
      
      return jobs;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching jobs by customerId: ", err);
      throw new Error(err.message || "Failed to fetch jobs");
    }
  },

  /**
   * Retrieves all jobs for a specific vehicle.
   * @param vehicleId - The vehicle ID.
   * @returns Array of job data.
   */
  getJobsByVehicleId: async (vehicleId: string): Promise<Job[]> => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const q = query(jobsRef, where("vehicleId", "==", vehicleId));
      const querySnapshot = await getDocs(q);
      
      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          jobId: doc.id,
          ...data,
        } as Job);
      });
      
      return jobs;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error fetching jobs by vehicleId: ", err);
      throw new Error(err.message || "Failed to fetch jobs");
    }
  },

  /**
   * Updates a job's document in Firestore.
   * @param jobId - The job's unique ID.
   * @param data - The data to update (excluding jobId, serviceId, customerId, vehicleId, createdAt).
   */
  updateJob: async (
    jobId: string,
    data: Partial<Omit<Job, "jobId" | "serviceId" | "customerId" | "vehicleId" | "createdAt">>
  ) => {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      await updateDoc(jobRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Job document updated successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error updating job document: ", err);
      throw new Error(err.message || "Failed to update job");
    }
  },

  /**
   * Deletes a job's document from Firestore.
   * @param jobId - The job's unique ID.
   */
  deleteJob: async (jobId: string) => {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      await deleteDoc(jobRef);
      console.log("Job document deleted successfully!");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error deleting job document: ", err);
      throw new Error(err.message || "Failed to delete job");
    }
  },
};
