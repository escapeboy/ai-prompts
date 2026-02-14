# React Native CLAUDE.md Template

**Copy this template to your React Native project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: React Native application
- **Runtime**: [Expo SDK 52 / React Native CLI 0.76+]
- **Language**: TypeScript [5.x]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **Framework**: [Expo (managed) / Expo (bare) / React Native CLI]
- **Navigation**: [Expo Router / React Navigation]
- **State Management**: [Zustand / Jotai / Redux Toolkit / React Context]
- **Server State**: [TanStack Query / SWR / Custom hooks]
- **Styling**: [StyleSheet / Nativewind / Tamagui / Styled Components]
- **Backend**: [Supabase / Firebase / Custom API / None]
- **Auth**: [Expo AuthSession / Firebase Auth / Custom JWT]

### Directory Structure
```
src/
  app/                    # Expo Router pages (if file-based routing)
  screens/                # Screen components (if React Navigation)
  components/             # Shared UI components
    ui/                   # Primitive UI components
    forms/                # Form components
  hooks/                  # Custom React hooks
  services/               # API clients, external service wrappers
  stores/                 # State management stores
  utils/                  # Utility functions
  types/                  # TypeScript type definitions
  constants/              # App-wide constants
  assets/                 # Images, fonts, static files
  __tests__/              # Test files
```

## Conventions

### Coding Standards
- Strict TypeScript (`"strict": true` in tsconfig)
- Functional components only; no class components
- Named exports for components; default exports for screens
- Absolute imports via `@/` path alias
- ESLint + Prettier for code formatting

### Naming
- **Components**: PascalCase (`SettingsScreen`, `UserAvatar`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useFetch`)
- **Utils**: camelCase (`formatDate`, `validateEmail`)
- **Types**: PascalCase with descriptive suffix (`UserProfile`, `SettingsFormData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Files**: PascalCase for components (`SettingsScreen.tsx`), camelCase for utils (`formatDate.ts`)

### Component Patterns
- Destructure props in function signature
- Use `StyleSheet.create()` for styles (bottom of file or co-located)
- Extract custom hooks for reusable logic
- Keep components under 150 lines; extract subcomponents
- Use `memo()` only when profiling shows a real need
- Always handle loading, error, and empty states

### Navigation
- Define route types in a central `types/navigation.ts` file
- Use typed `useNavigation` and `useRoute` hooks
- Handle deep links in navigation configuration
- Use screen options for header configuration

## Testing

- **Framework**: Jest + React Native Testing Library
- Run all tests: `npm test` or `yarn test`
- Run specific test: `npx jest --testPathPattern=Settings`
- Run with coverage: `npx jest --coverage`
- Test user behavior, not implementation details
- Mock native modules in `jest.setup.js`

## Commands

### Development
```bash
npx expo start                    # Start dev server
npx expo start --ios              # Start with iOS simulator
npx expo start --android          # Start with Android emulator
npx expo start --clear            # Start with cleared cache
```

### Building
```bash
eas build --platform ios --profile development    # iOS dev build
eas build --platform android --profile preview    # Android preview
eas build --platform all --profile production     # Production build
```

### Updates (OTA)
```bash
eas update --branch production --message "description"   # Push OTA update
eas update --branch preview --message "description"      # Preview update
```

### Testing
```bash
npm test                          # Run all tests
npx jest --watch                  # Watch mode
npx jest --coverage               # With coverage
npx jest --testPathPattern=Name   # Specific tests
```

### Code Quality
```bash
npx eslint .                      # Lint
npx prettier --check .            # Format check
npx tsc --noEmit                  # Type check
```

## MCP Servers

This project uses the following MCP servers:
- **Expo MCP** (user/local): EAS Build, EAS Update, project management
- **mobile-mcp** (user): Simulator/emulator control, screenshots
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- [Add project-specific notes here]
- [Example: "Uses Expo Router with file-based routing in src/app/"]
- [Example: "All API calls go through src/services/api.ts"]
- [Example: "Supports offline mode with queue-based sync"]
```

---

## Customization Guide

### If Using Expo Router (File-Based Routing)

Add this section to your CLAUDE.md:

```markdown
### Expo Router
- Pages in: `src/app/`
- Layout files: `_layout.tsx` in each directory
- Dynamic routes: `[id].tsx` for params
- Groups: `(tabs)/` for tab navigation, `(auth)/` for auth flow
- API routes: `src/app/api/` (Expo API Routes)
- Use `<Link>` component for navigation, `router.push()` for programmatic
```

### If Using React Navigation

```markdown
### React Navigation
- Navigator setup in: `src/navigation/`
- Route types in: `src/types/navigation.ts`
- Use typed navigation hooks: `useNavigation<StackNavigationProp<RootStackParamList>>()`
- Tab navigation: `@react-navigation/bottom-tabs`
- Stack navigation: `@react-navigation/native-stack`
```

### If Using Nativewind

```markdown
### Nativewind (Tailwind CSS)
- Config: `tailwind.config.js`
- Use `className` prop on React Native components
- Custom colors in tailwind config, not inline
- Dark mode via `dark:` prefix
- Use `cn()` utility for conditional classes
```

### If Using Firebase

```markdown
### Firebase
- Config in: `src/config/firebase.ts`
- Auth: Firebase Authentication with `@react-native-firebase/auth`
- Database: Firestore with typed converters
- Storage: Firebase Storage for file uploads
- Analytics: Firebase Analytics for event tracking
- Push: Firebase Cloud Messaging for notifications
```
