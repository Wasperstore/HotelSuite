# Overview

LuxuryHotelSaaS is a comprehensive multi-tenant hotel management platform designed for modern hoteliers. The system supports multiple hotels with role-based access control, offline-first functionality, and integrated payment processing. It features a React-based frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM for data management.

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

## Future Integrations (Planned)
- **Payment Processing**: Paystack, Flutterwave, and Stripe integration
- **Communication**: WhatsApp Business API and SMS services
- **OTA Integration**: iCal synchronization with booking platforms
- **File Storage**: S3 or Cloudinary for asset management
- **Caching**: Redis for session storage and performance optimization
- **Queue Management**: BullMQ for background job processing