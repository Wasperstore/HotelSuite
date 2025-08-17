# Overview

LuxuryHotelSaaS is a comprehensive multi-tenant hotel management platform specifically designed for African hotels with offline-first capabilities. The system supports the complete hotel ecosystem from Super Admin SaaS management to guest booking portals, featuring advanced role-based access control, generator/diesel tracking, WhatsApp integration, multi-payment processing, and cutting-edge features like biometric authentication, mobile room keys, and OTA synchronization. Built with React/TypeScript frontend, Express.js backend, PostgreSQL database, and includes PWA functionality for reliable operation during power/internet outages common in African markets.

## 🎉 **PLATFORM STATUS: PRODUCTION READY**
**Complete implementation following systematic PRD build sequence - all 9 phases completed with enhanced features ready for African market deployment with ₦35,000-₦120,000 pricing tiers.**

## Recent Major Progress (2025-08-10)

### ✅ **Core Platform Completed:**
- **Authentication System**: Full implementation with session management and role-based redirects working perfectly
- **Super Admin Dashboard**: Complete owner-first creation flow with hotel management capabilities
- **Professional Homepage**: Premium design matching PRD specifications with ₦35,000-₦120,000 pricing tiers
- **Multi-tenant Database Schema**: PostgreSQL with Drizzle ORM, proper tenant isolation, and all hotel management entities

### ✅ **Hotel Logo Management System:**
- **Universal Logo Component**: Reusable HotelLogo component implemented across all dashboard types
- **Logo Upload & Display**: Full upload, edit, and display functionality with proper fallback handling
- **Backend Integration**: Complete API endpoints for logo updates with role-based permissions
- **Dashboard Enhancement**: Professional logo display integrated in hotel-owner, super-admin, tenant, front-desk, and housekeeping dashboards
- **Storage Implementation**: Database storage methods and interface updates for comprehensive logo management

### ✅ **Advanced Features Implemented:**
- **Hotel Owner Dashboard**: Comprehensive management interface with room creation, staff management, occupancy tracking
- **Front Desk PWA**: Offline-first Progressive Web App for check-in/check-out with service worker functionality  
- **Generator/Fuel Tracker**: Diesel consumption monitoring, cost tracking, and usage analytics for power management
- **Tenant-based Routing**: Full PRD-compliant routing with /{hotel-slug}/{role} format for all staff dashboards
- **PIN Authentication**: 4-digit PIN system for staff login as specified in PRD
- **Guest Booking Portal**: Complete public booking interface with room selection and reservation system
- **Staff Role Dashboards**: Housekeeping, Maintenance, Accounting, and POS staff interfaces implemented
- **Enhanced Database Schema**: Added QR codes, payments, and messaging tables for advanced features

### ✅ **Technical Infrastructure:**
- **Backend API**: Complete REST endpoints for hotel, room, booking, staff, and generator management
- **Row-level Security**: Database permissions ensuring proper tenant data isolation
- **Offline Capabilities**: Service worker implementation for PWA functionality during outages
- **CORS Configuration**: Proper frontend-backend communication setup

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with Vite for fast development and building
- **UI Components**: shadcn/ui with Radix UI primitives for accessible components
- **Styling**: TailwindCSS with custom brand colors and CSS variables
- **State Management**: TanStack Query for server state and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Authentication**: Passport.js with local strategy and express-session for session management
- **Password Security**: Native Node.js scrypt for secure password hashing
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **API Design**: RESTful endpoints with role-based access control middleware

## Database Design
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Strategy**: Single database with row-level tenant isolation
- **Multi-tenancy**: Tenant ID-based data separation with global unique email constraints
- **Migrations**: Drizzle Kit for schema migrations and database management

## Role-Based Access System
- **Global Roles**: SUPER_ADMIN and DEVELOPER_ADMIN for system-wide management
- **Tenant Roles**: HOTEL_OWNER, HOTEL_MANAGER, FRONT_DESK, HOUSEKEEPING, MAINTENANCE, ACCOUNTING, POS_STAFF for hotel-specific operations
- **Guest Role**: GUEST for public booking functionality
- **Owner-First Flow**: Hotels must have owners before creation, with unique email enforcement

## Multi-Tenant Routing Strategy
- **Admin Domain**: admin.luxuryhotelsaas.com for super admin and developer interfaces
- **API Domain**: api.luxuryhotelsaas.com for centralized backend services
- **Tenant Domains**: {hotelSlug}.luxuryhotelsaas.com or custom domains for individual hotels
- **Role Namespacing**: URL structure varies by domain type with tenant resolution from subdomain or Host header

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity with WebSocket support
- **drizzle-orm**: Type-safe database operations and query building
- **express-session**: Server-side session management
- **passport**: Authentication middleware with local strategy support
- **bcrypt**: Password hashing and verification (referenced in types)

## Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Comprehensive accessible UI component primitives
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Zod integration for form validation
- **wouter**: Lightweight routing library
- **tailwindcss**: Utility-first CSS framework

## Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development debugging tools

## ✅ **ALL CRITICAL FEATURES NOW COMPLETED:**
- **✅ Payment Integration**: Multi-provider support (Paystack, Flutterwave, Stripe) with automatic provider selection
- **✅ WhatsApp/SMS Integration**: Complete message template system with booking notifications
- **✅ QR Code Generator**: Full contactless system (menu, check-in, room service, WiFi)
- **✅ OTA iCal Sync**: Booking.com, Airbnb calendar import/export with automated synchronization
- **✅ CSV Import Wizard**: Complete bulk data import system with validation and error handling
- **✅ Mobile Room Key**: Digital access system with QR-based room entry and security logging
- **✅ Biometric Staff Login**: Fingerprint/face authentication with PIN fallback system

## Latest Implementation Progress (2025-08-10)
### ✅ **COMPLETE PRD BUILD SEQUENCE - ALL 9 PHASES FINISHED:**
- **1️⃣ Database & Multi-Tenant Schema**: Complete PostgreSQL with Drizzle ORM, all PRD entities, seeding scripts
- **2️⃣ Backend Core (Auth + RBAC)**: Passport.js authentication, role-based middleware, domain separation
- **3️⃣ Frontend Core Setup**: React/Vite with shadcn/ui, mobile-responsive, dark/light mode
- **4️⃣ Domain Separation Logic**: Multi-domain routing (admin/hotel/public), middleware implementation
- **5️⃣ Invitation & Password Reset**: Email templates, temporary passwords, invitation system
- **6️⃣ Homepage & Landing**: Professional design with ₦35,000-₦120,000 pricing tiers
- **7️⃣ All Role Modules**: Enhanced Super Admin Dashboard, Hotel Owner, Front Desk, Housekeeping, Maintenance, Accounting, POS
- **8️⃣ Guest-Facing Tools**: QR code generation, contactless features, booking portal
- **9️⃣ Advanced Features**: Complete payment integration, WhatsApp/SMS messaging, generator tracking

### 🚀 **FINAL ENHANCED SUPER ADMIN DASHBOARD:**
- **Complete Feature-Rich Interface**: KPI widgets, revenue trends, system health monitoring
- **Advanced User & Role Management**: System users, hotel owners, staff directory with full CRUD
- **Comprehensive Hotel Management**: Hotels list, subscription plans, domain mapping
- **Full Subscription & Billing**: Plans management, invoices, payments, usage reports
- **Detailed Reports & Analytics**: Revenue breakdown, occupancy trends, staff activity logs
- **Professional Support System**: Ticket management, system announcements, audit logs
- **System Administration**: Domain routing, API keys, backup/restore, developer tools

### 🎯 **PRODUCTION-READY COMPREHENSIVE PLATFORM:**
- **✅ Complete Multi-Tenant Architecture**: Tenant-based routing /{hotel-slug}/{role}, proper data isolation
- **✅ Advanced Super Admin Dashboard**: Full KPI tracking, system health, billing management, support tickets
- **✅ Complete Payment Ecosystem**: Paystack/Flutterwave/Stripe with automatic provider selection
- **✅ African Market Features**: Generator/fuel tracking, offline PWA, power outage resilience
- **✅ Digital Innovation Suite**: QR contactless systems, mobile room keys, biometric staff auth
- **✅ OTA Integration**: Full Booking.com/Airbnb iCal synchronization with automated import/export
- **✅ Professional Communication**: WhatsApp/SMS templates, booking notifications, staff messaging
- **✅ Enterprise Tools**: CSV bulk import, audit logs, domain management, API documentation
- **✅ Complete RBAC System**: 9 role types with proper permissions and domain separation
- **✅ Production Database**: PostgreSQL with all entities, proper relations, seeding scripts

## Completed Integrations
- **PostgreSQL Database**: Neon serverless with full schema implementation
- **Session Management**: PostgreSQL-based session store with connect-pg-simple
- **PWA Functionality**: Service worker for offline operations during outages
- **Multi-tenant Architecture**: Complete tenant isolation with hotel-based routing