# Retailer Sales Platform - Frontend

> React web application for Sales Representatives to manage their assigned retailers. Built with React 19, TypeScript, Material-UI, and TanStack Query.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)

## Overview

Modern, responsive web interface for the Retailer Sales Platform. Sales Representatives can view and manage their assigned retailers, while Admins have full access to all data and reference management.

**Tech Stack**: React 19, TypeScript, Vite, Material-UI 7, TanStack Query, Zustand, React Router 7  
**State Management**: Zustand for auth, TanStack Query for server state  
**Styling**: Material-UI components with custom theme  
**Authentication**: JWT tokens with automatic refresh and session persistence

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`

### Setup Instructions

**1. Navigate to frontend directory**
```bash
cd frontend
```

**2. Create environment file**
```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

**3. Install dependencies**
```bash
npm install
```

**4. Start development server**
```bash
npm run dev
```

**5. Access**
- **Frontend**: http://localhost:5173
- **Login with test users** (from backend seed):
  - Admin: `admin` / `password123`
  - Sales Rep: `karim_sr` / `password123`

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Usage

### Login Flow

1. Visit http://localhost:5173 → Redirects to login page
2. Enter credentials → Click "Sign In"
3. On success → Redirects to dashboard
4. Session persists in localStorage (survives page refresh)
5. Token expires → Auto-logout and redirect to login

### Navigation

**Sales Representative:**
- Dashboard - Overview and quick stats
- My Retailers - View and manage assigned retailers (search, filter, edit)

**Admin:**
- Dashboard - System overview
- Manage Retailers - Full retailer management
- Reference Data - CRUD for regions, areas, territories, distributors (coming soon)

### Retailers Management

**Search & Filter:**
- Search by name, phone, or UID
- Filter by region, area, distributor, territory
- Pagination (10/25/50/100 rows per page)

**Edit Retailer:**
- Click edit icon on any retailer row
- Update points, routes, and notes
- Changes saved immediately to backend
- Optimistic UI updates with automatic rollback on error

## Features

### Authentication
- JWT-based authentication with role-based access
- Session persistence (localStorage)
- Auto-logout on token expiration
- Protected routes with redirect to login

### Retailers Management
- Paginated list with search and filters
- Real-time updates with TanStack Query
- Edit dialog with form validation
- Loading states and error handling
- Responsive table design

### UI/UX
- Material Design 3 components
- Responsive layout (mobile-friendly)
- Dark/light theme support (custom theme)
- Loading skeletons and progress indicators
- Error messages with user-friendly alerts
- Sidebar navigation with active state

### Performance
- Automatic request caching (TanStack Query)
- Optimistic UI updates
- Code splitting with React Router
- Fast refresh with Vite HMR

## Architecture

```
Browser
   ↓
React App (Vite)
   ↓
├── Zustand (Auth State)
├── TanStack Query (API Cache)
└── Axios (HTTP Client)
   ↓
Backend API (NestJS)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 19 | Modern UI library with concurrent features |
| Language | TypeScript | Type safety and better DX |
| Build Tool | Vite | Fast dev server and optimized builds |
| UI Library | Material-UI 7 | Pre-built components, responsive design |
| Routing | React Router 7 | Client-side routing with protected routes |
| State (Auth) | Zustand | Lightweight state management |
| State (Server) | TanStack Query | Server state caching and synchronization |
| HTTP Client | Axios | API requests with interceptors |
| Forms | React Hook Form | Form validation (ready for complex forms) |
| Validation | Zod | Schema validation |

### State Management Strategy

**Zustand (Client State):**
- User authentication state
- Current user info
- Token storage
- Persisted to localStorage

**TanStack Query (Server State):**
- Retailers data
- Reference data (regions, areas, etc.)
- Automatic caching (5-minute stale time)
- Background refetching
- Optimistic updates

**Why This Split?**
- Auth state is client-side and needs persistence
- Server data is cached and auto-synced
- No Redux boilerplate needed
- Simple and performant

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   ├── ProtectedRoute.tsx  # Auth guard for routes
│   │   └── EditRetailerDialog.tsx  # Edit retailer modal
│   ├── pages/               # Route pages
│   │   ├── LoginPage.tsx    # Login form
│   │   ├── DashboardPage.tsx  # Landing page
│   │   └── RetailersPage.tsx  # Retailers list & management
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Login/logout hooks
│   │   └── useRetailers.ts  # Retailer API hooks
│   ├── store/               # Zustand stores
│   │   └── authStore.ts     # Auth state management
│   ├── lib/                 # Utilities
│   │   └── api.ts           # Axios client with interceptors
│   ├── types/               # TypeScript types
│   │   └── index.ts         # API types matching backend DTOs
│   ├── theme/               # MUI theme
│   │   └── theme.ts         # Custom theme configuration
│   ├── App.tsx              # Router configuration
│   └── main.tsx             # App entry point
├── .env                     # Environment variables
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

### Key Files Explained

**App.tsx** - Defines all routes (public and protected)  
**api.ts** - Axios instance with JWT interceptor and error handling  
**authStore.ts** - Zustand store for auth state with localStorage persistence  
**useRetailers.ts** - TanStack Query hooks for retailer CRUD operations  
**ProtectedRoute.tsx** - Route guard that redirects to login if not authenticated  
**Layout.tsx** - Shared layout with AppBar, sidebar, and user menu

## Development

### Available Scripts

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Environment Variables

```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
```

### Adding New Features

**1. Add API types** in `src/types/index.ts`  
**2. Create API hooks** in `src/hooks/` using TanStack Query  
**3. Build UI components** in `src/components/`  
**4. Create page** in `src/pages/`  
**5. Add route** in `src/App.tsx`

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Functional components with hooks
- Material-UI `sx` prop for styling
- Minimal comments (self-documenting code)

---

**Status**: Production Ready - Core Features Implemented

**Next Steps**: Admin reference data management, bulk operations UI, advanced filtering
