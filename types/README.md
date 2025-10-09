# Global Types Documentation

This directory contains all TypeScript type definitions used throughout the Better Auth application.

## File Structure

- `global.ts` - Main types file containing all type definitions
- `index.ts` - Re-exports all types for easier imports
- `README.md` - This documentation file

## Type Categories

### 1. Authentication Types

- `User` - User data structure
- `Session` - Session data structure
- `AuthError` - Authentication error structure

### 2. Form Types

- `SignupFormData` - Signup form data structure
- `LoginFormData` - Login form data structure
- `ForgotPasswordFormData` - Forgot password form data
- `ResetPasswordFormData` - Reset password form data

### 3. API Response Types

- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated data response

### 4. Dashboard Types

- `DashboardStats` - Dashboard statistics data
- `ActivityItem` - Activity feed item
- `QuickAction` - Quick action button data

### 5. UI Component Types

- `InputProps` - Input component props
- `ButtonProps` - Button component props
- `CardProps` - Card component props
- `LabelProps` - Label component props

### 6. Social Auth Types

- `SocialProvider` - Supported social providers
- `SocialAuthConfig` - Social auth configuration

### 7. Validation Types

- `ValidationRule` - Individual validation rule
- `ValidationSchema` - Complete validation schema
- `ValidationError` - Validation error structure

### 8. Navigation Types

- `NavItem` - Navigation item structure
- `BreadcrumbItem` - Breadcrumb item structure

### 9. Theme Types

- `Theme` - Theme options
- `ThemeConfig` - Theme configuration

### 10. Notification Types

- `Notification` - Notification data structure

### 11. Modal Types

- `ModalProps` - Modal component props

### 12. Table Types

- `TableColumn<T>` - Table column definition
- `TableProps<T>` - Table component props

### 13. Form Hook Types

- `UseFormOptions<T>` - Form hook options
- `FormState<T>` - Form state structure

### 14. Utility Types

- `Optional<T, K>` - Make specific keys optional
- `Required<T, K>` - Make specific keys required
- `DeepPartial<T>` - Make all properties optional recursively

### 15. Environment Types

- `EnvironmentConfig` - Environment variables structure

### 16. Error Types

- `AppError` - Application error structure
- `ErrorBoundaryState` - Error boundary state

### 17. Loading Types

- `LoadingState` - Loading state structure

### 18. Search Types

- `SearchFilters` - Search filter options
- `SearchResult<T>` - Search result structure

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { User, Session, SignupFormData } from "@/types/global";

// Import all types
import * as Types from "@/types/global";

// Import from index (recommended)
import { User, SignupFormData, DashboardStats } from "@/types";
```

### Using Types in Components

```typescript
import { User, SignupFormData, ButtonProps } from "@/types";

interface MyComponentProps {
  user: User;
  onSubmit: (data: SignupFormData) => void;
  buttonProps: ButtonProps;
}

const MyComponent: React.FC<MyComponentProps> = ({
  user,
  onSubmit,
  buttonProps,
}) => {
  // Component implementation
};
```

### Using Types in Hooks

```typescript
import { FormState, UseFormOptions } from "@/types";

const useMyForm = <T>(options: UseFormOptions<T>) => {
  const [formState, setFormState] = useState<FormState<T>>({
    values: options.initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  // Hook implementation
};
```

## Best Practices

1. **Always use global types** instead of defining local interfaces
2. **Import from `@/types`** for consistency
3. **Use generic types** when possible for reusability
4. **Keep types focused** - one responsibility per type
5. **Document complex types** with comments
6. **Use utility types** for transformations
7. **Keep types up to date** when changing data structures

## Adding New Types

When adding new types:

1. Add the type definition to `global.ts`
2. Add the export to `index.ts` if needed
3. Update this README with the new type
4. Use the type in your components
5. Update any related documentation

## Type Safety

All types are designed to provide maximum type safety:

- **Strict typing** - No `any` types unless absolutely necessary
- **Generic constraints** - Proper generic type constraints
- **Optional properties** - Clearly marked optional properties
- **Union types** - Proper union types for variants
- **Utility types** - Leverage TypeScript utility types

This ensures compile-time error checking and better IDE support.
