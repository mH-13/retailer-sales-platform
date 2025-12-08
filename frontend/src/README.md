# Source Code Structure

## Folder Organization

```
src/
├── components/      # Reusable UI components (not page-specific)
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configured libraries
├── pages/           # Page components (one per route)
├── store/           # Global state management (Zustand)
├── theme/           # Material-UI theme configuration
├── types/           # TypeScript type definitions
├── App.tsx          # Root component
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## Key Files Explained

### `types/index.ts`
TypeScript types matching the backend API models. Ensures type safety when calling APIs.

### `lib/api.ts`
Axios HTTP client configured with:
- Base URL from environment variable
- Automatic JWT token attachment
- Response interceptors for error handling

### `store/authStore.ts`
Zustand store for authentication state:
- Stores user info and JWT token
- Persists to localStorage
- Provides login/logout actions

### `hooks/useAuth.ts`
Custom hooks for authentication using TanStack Query:
- `useLogin()` - Login mutation with automatic state updates
- `useLogout()` - Logout with cleanup

### `theme/theme.ts`
Material-UI theme with custom colors:
- Primary: Blue (#2563eb)
- Secondary: Slate (#64748b)
- Success/Error/Warning colors
- Typography settings

### `main.tsx`
Application entry point with providers:
- `QueryClientProvider` - Enables TanStack Query
- `ThemeProvider` - Applies MUI theme
- `CssBaseline` - CSS reset
- Auth initialization on startup

## How Things Connect

1. **API Calls**: Components use hooks from `hooks/` → hooks call `lib/api.ts` → api calls backend
2. **State**: Components use Zustand stores from `store/` → stores update on actions
3. **Types**: All API responses/requests use types from `types/`
4. **Styling**: Components use MUI components styled with `theme/theme.ts`

## Development Workflow

1. **Add a new page**: Create in `pages/`, add to router
2. **Add API call**: Create hook in `hooks/`, use TanStack Query
3. **Add component**: Create in `components/`, use MUI components
4. **Add global state**: Add Zustand store in `store/`
5. **Add types**: Update `types/index.ts` to match backend

## Environment Variables

Create `.env` file in `/frontend`:
```
VITE_API_URL=http://localhost:3000
```

## Example: Making an API Call

```tsx
// 1. Define hook in hooks/useRetailers.ts
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Retailer } from '../types';

export const useRetailers = () => {
  return useQuery({
    queryKey: ['retailers'],
    queryFn: async () => {
      const response = await api.get<Retailer[]>('/retailers');
      return response.data;
    },
  });
};

// 2. Use in component
import { useRetailers } from '../hooks/useRetailers';

function RetailersPage() {
  const { data, isLoading, error } = useRetailers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div>
      {data.map(retailer => (
        <div key={retailer.id}>{retailer.name}</div>
      ))}
    </div>
  );
}
```

## Tech Stack Summary

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **TanStack Query** - API state management
- **Zustand** - Global state
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Validation
- **Vite** - Build tool
