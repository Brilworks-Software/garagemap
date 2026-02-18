export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    ownerName: string | null;
    serviceId: string | null;
    userRole: "owner" | "member" | null;
    photoURL: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    serviceId: string;
    serviceType: "garage" | "service" | null;
    serviceName: string | null;
    memberCount: number | null;
    phoneNumber: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
}

export interface Customer {
    customerId: string;
    customerStatus: "active" | "inactive" | "blocked" | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    customerAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
    jobCount: number | null;
    jobId : string | null;
    serviceId: string;
    customerType: "individual" | "company" | null;
    customerNotes: string | null;
    customerGSTNumber: string | null;
    customerGender: "male" | "female" | "other" | null;
}

export interface Vehicle {
    vehicleId: string;
    vehicleName: string | null;
    vehicleYear: number | null;
    vehicleCompany: string | null;
    vehicleModel: string | null;
    vehicleColor: string | null;
    vehicleNumber: string | null;
    vehicleType: "car" | "bike" | "other" | null;
    createdAt: Date;
    updatedAt: Date;
    customerId: string;
    serviceId: string;
}

export interface Job {
    jobId: string;
    jobTitle: string | null;
    jobDescription: string | null;
    jobStatus: "pending" | "in-progress" | "completed" | "cancelled" | null;
    createdAt: Date;
    updatedAt: Date;
    customerId: string;
    serviceId: string;
    vehicleId: string;
    jobAmount: number | null;
    jobDueDate: Date | null;
    jobList: string | null;
    jobStartDate: Date | null;
    jobEndDate: Date | null;
    jobNotes: string | null;
    jobType: "service" | "repair" | "maintenance" | "other" | null;
}