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

export interface JobWorkItem {
    title: string;
    price: number;
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
    jobList: string | null; // JSON stringified array of JobWorkItem
    jobStartDate: Date | null;
    jobEndDate: Date | null;
    jobNotes: string | null;
    jobType: "service" | "repair" | "maintenance" | "other" | null;
}

export interface Invoice {
    invoiceId: string;
    jobId: string;
    customerId: string;
    serviceId: string;
    vehicleId: string;
    invoiceNumber: string;
    workItems: JobWorkItem[];
    subtotal: number;
    tax: number | null;
    discount: number | null;
    total: number;
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    issueDate: Date;
    dueDate: Date | null;
    paidDate: Date | null;
    notes: string | null;
    pdfUrl: string | null; // URL to the PDF stored in Firebase Storage
    createdAt: Date;
    updatedAt: Date;
}

export interface Inventory {
    itemId: string;
    serviceId: string;
    itemName: string | null;
    itemCode: string | null; // SKU or item code
    category: string | null; // e.g., "parts", "tools", "consumables", "fluids"
    quantity: number; // Current stock quantity
    unit: string | null; // e.g., "piece", "kg", "liter", "box"
    costPrice: number | null; // Cost per unit
    sellingPrice: number | null; // Selling price per unit
    minStockLevel: number | null; // Reorder point
    maxStockLevel: number | null; // Maximum stock level
    supplier: string | null;
    location: string | null; // Warehouse or storage location
    status: "active" | "inactive" | "out-of-stock" | "low-stock" | null;
    description: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Part {
    partId: string;
    serviceId: string;
    partName: string | null;
    partNumber: string | null; // OEM or aftermarket part number
    category: string | null; // e.g., "engine", "brakes", "electrical", "suspension", "body", "interior", "exterior"
    compatibleMake: string | null; // Vehicle make (e.g., "Toyota", "Honda")
    compatibleModel: string | null; // Vehicle model
    compatibleYear: string | null; // Year range or specific year
    quantity: number; // Current stock quantity
    unit: string | null; // e.g., "piece", "set", "pair"
    costPrice: number | null; // Cost per unit
    sellingPrice: number | null; // Selling price per unit
    minStockLevel: number | null; // Reorder point
    maxStockLevel: number | null; // Maximum stock level
    supplier: string | null;
    location: string | null; // Warehouse or storage location
    status: "active" | "inactive" | "out-of-stock" | "low-stock" | null;
    description: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}