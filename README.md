# 🚗 GarageMap

A modern, comprehensive garage management web application designed to streamline daily workshop operations. GarageMap helps manage customers, vehicles, job cards, invoices, inventory, and business operations — all in one unified platform.

Built with **Next.js**, **Tailwind CSS**, and **Firebase**, GarageMap provides a fast, responsive, and scalable solution for garage owners and service centers.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Firebase Configuration](#-firebase-configuration)
- [Available Pages](#-available-pages)
- [Development](#-development)
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

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.6** - React Framework with App Router
- **React 19.2.3** - UI Library
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript 5** - Type-safe JavaScript
- **Lucide React** - Icon library
- **shadcn/ui** - UI component library
- **Radix UI** - Accessible component primitives

### Backend & Services
- **Firebase 12.9.0**
  - **Firestore** - NoSQL database
  - **Firebase Authentication** - User authentication
  - **Firebase Storage** - File storage (optional)

### State Management & Data Fetching
- **TanStack Query (React Query) 5.90.21** - Server state management
- **React Query DevTools** - Development tools

### Utilities
- **class-variance-authority** - Component variants
- **clsx** - Conditional class names
- **tailwind-merge** - Tailwind class merging

---

## 📁 Project Structure

```
garagemap/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── forgotpassword/      # Password reset page
│   ├── user/                     # User dashboard pages
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # User layout with sidebar
│   │   ├── jobs/                 # Job management
│   │   ├── customers/            # Customer management
│   │   ├── vehicles/             # Vehicle management
│   │   ├── inventory/            # Inventory management
│   │   ├── parts/                # Parts management
│   │   ├── sell/                 # Sales management
│   │   ├── invoices/             # Invoice management
│   │   ├── transactions/        # Transaction tracking
│   │   ├── policy/               # Policy management
│   │   ├── reports/              # Reports & analytics
│   │   ├── audit/                # Audit logs
│   │   ├── reminders/            # Reminders & tasks
│   │   ├── upload/               # Bulk stock upload
│   │   └── configure/            # Settings & configuration
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Providers.tsx             # App providers (React Query, etc.)
│   └── ui/                       # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── firebase/                     # Firebase integration
│   ├── config/
│   │   └── firebaseConfig.ts     # Firebase configuration
│   ├── services/                 # Firebase service layer
│   │   ├── AuthService.ts        # Authentication services
│   │   ├── UserService.ts        # User data services
│   │   ├── ServiceService.ts     # Service/garage data services
│   │   ├── CustomerService.ts    # Customer data services
│   │   ├── VehicleService.ts    # Vehicle data services
│   │   └── JobService.ts         # Job data services
│   ├── hooks/                    # React Query hooks
│   │   ├── useAuth.ts            # Authentication hooks
│   │   ├── useUser.ts            # User data hooks
│   │   ├── useService.ts         # Service data hooks
│   │   ├── useCustomer.ts        # Customer data hooks
│   │   ├── useVehicle.ts         # Vehicle data hooks
│   │   └── useJob.ts             # Job data hooks
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── lib/
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

---

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

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database** and **Authentication**
   - Copy your Firebase configuration
   - Update `firebase/config/firebaseConfig.ts` with your credentials

4. **Set up environment variables** (if needed)
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   # ... other Firebase config variables
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firebase Configuration

### Required Firebase Services

1. **Firestore Database**
   - Create a Firestore database in production mode
   - The following collections will be created automatically:
     - `users` - User account information
     - `services` - Service/garage information
     - `customers` - Customer data
     - `vehicles` - Vehicle data
     - `jobs` - Job card data

2. **Firebase Authentication**
   - Enable **Email/Password** authentication
   - Enable **Email verification** (optional but recommended)

### Firebase Security Rules

Set up appropriate Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Services are accessible by the owner
    match /services/{serviceId} {
      allow read, write: if request.auth != null && request.auth.uid == serviceId;
    }
    
    // Add similar rules for other collections
  }
}
```

---

## 📄 Available Pages

### Public Pages
- **`/`** - Landing page
- **`/auth/login`** - User login
- **`/auth/register`** - User registration
- **`/auth/forgotpassword`** - Password reset

### Protected Pages (Requires Authentication)
- **`/user`** - Dashboard with overview statistics
- **`/user/jobs`** - Job card management
- **`/user/customers`** - Customer management
- **`/user/vehicles`** - Vehicle management
- **`/user/inventory`** - Inventory management
- **`/user/parts`** - Parts management
- **`/user/sell`** - Sales management
- **`/user/invoices`** - Invoice management
- **`/user/transactions`** - Financial transactions
- **`/user/policy`** - Policy management
- **`/user/reports`** - Reports and analytics
- **`/user/audit`** - Audit logs
- **`/user/reminders`** - Reminders and tasks
- **`/user/upload`** - Bulk stock upload
- **`/user/configure`** - Settings and configuration

---

## 💻 Development

### Code Structure

- **Components**: Reusable UI components in `components/ui/`
- **Pages**: Next.js pages in `app/` directory
- **Services**: Firebase service layer in `firebase/services/`
- **Hooks**: React Query hooks in `firebase/hooks/`
- **Types**: TypeScript definitions in `firebase/types/`

### Key Patterns

1. **Service Layer Pattern**: All Firebase operations are abstracted through service classes
2. **React Query**: Used for data fetching, caching, and state management
3. **Type Safety**: Full TypeScript support with defined interfaces
4. **Component Composition**: Using shadcn/ui components for consistent UI

### Adding New Features

1. **Create Service**: Add a new service in `firebase/services/`
2. **Create Hooks**: Add React Query hooks in `firebase/hooks/`
3. **Define Types**: Add TypeScript interfaces in `firebase/types/index.ts`
4. **Create Page**: Add a new page in `app/user/`
5. **Update Sidebar**: Add navigation item in `app/user/layout.tsx`

---

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

---

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark interface with machined alloy aesthetic
- **Responsive Design**: Mobile-friendly layout
- **Real-time Updates**: Live data synchronization with Firebase
- **Form Validation**: Client-side validation for all forms
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Search & Filter**: Advanced filtering capabilities across all pages

---

## 📝 License

This project is private and proprietary.

---

## 🤝 Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ using Next.js and Firebase**
