# Overview

LuxuryHotelSaaS is a comprehensive multi-tenant hotel management platform specifically designed for African hotels with offline-first capabilities. The system supports the complete hotel ecosystem from Super Admin SaaS management to guest booking portals, featuring role-based access control, generator/diesel tracking, WhatsApp integration, and multi-payment processing. Built with React/TypeScript frontend, Express.js backend, PostgreSQL database, and includes PWA functionality for reliable operation during power/internet outages common in African markets.

## Recent Major Progress (2025-08-09)

### ✅ **Core Platform Completed:**
- **Authentication System**: Full implementation with session management and role-based redirects working perfectly
- **Super Admin Dashboard**: Complete owner-first creation flow with hotel management capabilities
- **Professional Homepage**: Premium design matching PRD specifications with ₦35,000-₦120,000 pricing tiers
- **Multi-tenant Database Schema**: PostgreSQL with Drizzle ORM, proper tenant isolation, and all hotel management entities

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

## Critical Remaining Features (Next Priority)
- **Payment Integration**: Paystack, Flutterwave, and Stripe API integration for guest bookings
- **WhatsApp/SMS Integration**: Guest communication and notification system with templates
- **QR Code Generator**: Contactless check-in, menu access, and room service QR codes
- **OTA iCal Sync**: Booking.com, Airbnb calendar synchronization endpoints
- **CSV Import Wizard**: Bulk hotel data import for quick onboarding workflow
- **Mobile Room Key**: Digital access system with QR-based room entry
- **Biometric Staff Login**: Fingerprint/face authentication for enhanced security

## Recent Implementation Progress (2025-08-09)
- ✅ Tenant-based routing system with /{hotel-slug}/{role} format matching PRD exactly
- ✅ Guest booking portal with room selection, availability, and reservation flow
- ✅ Staff dashboards for Housekeeping, Maintenance, Accounting, POS roles
- ✅ Database schema extended with payments, QR codes, and messaging tables
- ✅ Lazy-loaded dashboard components for optimal performance
- ✅ Enhanced Front Desk PWA with offline booking capabilities

## Completed Integrations
- **PostgreSQL Database**: Neon serverless with full schema implementation
- **Session Management**: PostgreSQL-based session store with connect-pg-simple
- **PWA Functionality**: Service worker for offline operations during outages
- **Multi-tenant Architecture**: Complete tenant isolation with hotel-based routing