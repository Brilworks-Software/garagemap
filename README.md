# 🚗 GarageMap

A modern, comprehensive garage management web application designed to streamline daily workshop operations. GarageMap helps manage customers, vehicles, job cards, invoices, inventory, and business operations — all in one unified platform.

Built with **Next.js**, **Tailwind CSS**, and **Firebase**, GarageMap provides a fast, responsive, and scalable solution for garage owners and service centers.

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)

---

## ✨ Features

### 👤 Customer Management

- Add, edit, and delete customers
- Store comprehensive contact information
- Track service history and vehicle associations
- Link multiple vehicles to a single customer
- Customer status management (Active, Inactive, Blocked)

### 🚘 Vehicle Management

- Register and manage customer vehicles
- Track vehicle details (make, model, year, VIN, etc.)
- Associate vehicles with service jobs
- View vehicle service history

### 🛠 Job Management

- Create and manage job cards
- Assign service tasks with work lists
- Track job status (Pending, In Progress, Completed)
- Record service notes, labor charges, and descriptions
- Set job start and due dates
- Link jobs to customers and vehicles

### 🧾 Invoice Management

- Generate invoices from completed jobs
- Calculate labor and parts costs
- Track payment status (Paid, Pending, Overdue)
- View and download invoices

### 📦 Inventory Management

- Add and manage spare parts and inventory items
- Track stock quantities and units
- Low stock alerts
- Category-based organization
- Price tracking

### 🛍 Parts Management

- Manage vehicle parts and components
- Track suppliers and pricing
- Stock level monitoring
- Vehicle type associations

### 💰 Financial Management

- Track transactions (Income/Expense)
- Sales management
- Financial reports and analytics
- Revenue and expense tracking

### 📊 Reports & Analytics

- Sales reports
- Job completion statistics
- Customer analytics
- Inventory reports
- Financial summaries

### 🔔 Reminders & Notifications

- Create and manage reminders
- Priority-based task management
- Due date tracking
- Status monitoring

### 🛡 Policy Management

- Manage business policies and terms
- Warranty policies
- Return and refund policies
- Payment terms

### 📝 Audit Log

- Track all system activities
- User action logging
- Timestamp and IP tracking
- Change history

### ⚙️ Configuration

- Service settings management
- User account management
- Business information configuration

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Firebase account** with a project set up
- **Git** (optional, for version control)

### Installation

1. **Clone the repository** (or download the project)

   ```bash
   git clone <repository-url>
   cd garagemap
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (if needed)

   ```bash
   # Create .env.local file
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```
