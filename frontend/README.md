# IP Workflow Tracker Frontend

A modern React + Vite frontend for the IP Workflow Tracker application.

## Overview

This frontend provides a beautiful, responsive user interface for managing Intellectual Property workflows. Built with React 18, Vite, TypeScript, and Tailwind CSS, it offers a seamless experience for tracking IP applications through their entire lifecycle.

## Features

- **Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS 3.4
- **Authentication**: Secure login/logout with JWT token handling
- **Application Management**: Complete CRUD operations for IP applications
- **Workflow Engine**: Full state machine with transitions (Draft → Submitted → Under Review → Approved/Rejected/Need More Info)
- **Kanban Board**: Intuitive drag-and-drop interface for workflow management
- **Dashboard**: Analytics, statistics, trends, and distribution charts
- **Settings**: User profile management, notification preferences, application settings
- **Real-time API Integration**: Communicates with Django + Django Ninja backend
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Notifications**: Toast notifications for user feedback and system messages
- **Keyboard Shortcuts**: Enhanced productivity with keyboard navigation
- **Theme Support**: Dark/Light mode switching with persistent preferences
- **Error Handling**: Graceful error display and recovery mechanisms
- **Loading States**: Skeletons and spinners for better user experience

## Technology Stack

- **React 18.3.1** - Modern React with hooks and functional components
- **Vite 5.2.0** - Blazing fast frontend toolchain
- **TypeScript 5.5.4** - Type-safe JavaScript development
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **React Router DOM 6.26.2** - Declarative routing
- **Framer Motion** - Animations and transitions
- **Lucide React** - Beautiful open-source icons
- **Recharts** - Composable charting library for data visualization
- **@dnd-kit** - Modern drag-and-drop toolkit for Kanban board
- **Sonner** - Toast notification system
- **Axios/Fetch** - HTTP client for API communication (via custom apiClient)

## Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                 # API service files
│   │   ├── apiClient.js     # HTTP client configuration and request handling
│   │   ├── applicationsApi.js  # Application CRUD and workflow operations
│   │   ├── authApi.js       # Authentication endpoints (login, logout, profile)
│   │   ├── dashboardApi.js  # Dashboard statistics and analytics endpoints
│   │   ├── mockData.js      # Mock data (development fallback)
│   │   └── settingsApi.js   # Settings endpoints (profile, password, notifications, etc.)
│   ├── assets/              # Static assets (images, logos, etc.)
│   ├── components/          # Reusable UI components
│   │   ├── applications/    # Application-specific components (forms, tables, cards)
│   │   ├── auth/            # Authentication-related components
│   │   ├── layout/          # Layout components (header, footer, sidebar, containers)
│   │   └── ui/              # Generic UI components (buttons, inputs, modals, badges, etc.)
│   ├── context/             # React context providers (Auth, Theme)
│   ├── docs/                # Documentation files and resources
│   ├── lib/                 # Utility functions, helpers, and constants
│   ├── pages/               # Page components (route components)
│   │   ├── ApplicationsListPage.jsx
│   │   ├── ApplicationDetailPage.jsx
│   │   ├── ApplicationCreatePage.jsx
│   │   ├── ApplicationEditPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── KanbanPage.jsx
│   │   ├── DocsPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SettingsPage.jsx
│   ├── types/               # TypeScript type definitions and interfaces
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   └── index.css            # Global styles, Tailwind imports, and CSS variables
├── .env                     # Environment variables (VITE_API_URL)
├── .eslintrc.cjs            # ESLint configuration for code quality
├── .gitignore               # Git ignore rules
├── index.html               # HTML template
├── package.json             # Dependencies, scripts, and project metadata
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration with custom settings
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript configuration for Node.js environment
└── vite.config.ts           # Vite configuration with plugins and optimization
```

## Setup Instructions

### Prerequisites

- Node.js 18+ (Recommended: Node.js 20.x)
- npm 9+ or yarn 1.22+
- Backend server running (see backend README for setup instructions)

### Installation

1. **Navigate to the frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Ensure the `.env` file exists in the frontend directory with:
```env
VITE_API_URL=http://localhost:8000/api/v1
```
*(This should already be present from the integration process)*

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
The application will be available at `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server with hot module replacement (HMR)
- `npm run build` - Build for production (outputs to `dist/` directory)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checking
- `npm run test` - Run tests (if/when testing framework is added)

## API Integration

The frontend communicates with the backend through a centralized API client service:

### apiClient.js
- Automatically prefixes requests with the base URL from `VITE_API_URL`
- Handles JSON serialization/deserialization automatically
- Implements consistent error handling with standardized error format
- Simulates network latency for development realism (can be disabled)
- Supports all HTTP methods: GET, POST, PUT, DELETE, PATCH
- Includes proper headers for JSON content type
- Handles network errors gracefully with fallback error messages

### API Service Files
Each feature area has its own API service file:
- `applicationsApi.js` - Application CRUD operations and workflow transitions
- `authApi.js` - Authentication (login, logout, get current user)
- `dashboardApi.js` - Statistics, trends, distribution, and recent applications
- `settingsApi.js` - Profile management, password change, notifications, app settings, team, sessions

## Development Guidelines

### Code Style & Best Practices

- **TypeScript Strict Mode**: Utilize TypeScript's full power with strict type checking
- **Functional Components**: Use React hooks (`useState`, `useEffect`, `useContext`, etc.)
- **Component Composition**: Keep components small, focused, and reusable
- **Props & State**: Define explicit TypeScript interfaces for all props and state
- **Error Boundaries**: Implement error boundaries where appropriate for graceful error handling
- **Accessibility**: Follow WCAG guidelines for accessible UI components
- **Performance**: Use `React.memo`, `useCallback`, and `useMemo` where beneficial
- **Code Organization**: Follow the established folder structure and naming conventions

### Styling with Tailwind CSS

- **Utility-First Approach**: Compose styles using Tailwind utility classes
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Dark Mode**: Utilize Tailwind's dark mode variant (`dark:`) for theme support
- **Custom CSS Variables**: Define theme colors in `src/index.css` using CSS variables
- **Component Extraction**: Extract repeated utility patterns into reusable components
- **Hover/Focus States**: Use Tailwind's state variants (`hover:`, `focus:`, `active:`)

### State Management

- **React Context**: Used for global state (Authentication, Theme)
- **Local Component State**: Managed with `useState` and `useReducer` hooks
- **Server State**: Handled through direct API calls with loading/error states
- **Form State**: Managed individually per form with validation
- **Consider Future Migration**: For complex state, consider React Query or Zustand

## Features in Detail

### Authentication System
- JWT-based authentication with secure token storage
- Protected routes that automatically redirect unauthenticated users
- Login/logout functionality with proper error handling
- User profile retrieval and display
- Role-based UI rendering (different views for Admin/Reviewer/Applicant)

### Application Workflow
Complete IP application lifecycle management:
1. **Draft**: Initial creation - fully editable
2. **Submitted**: Application submitted for review - view-only
3. **Under Review**: Active review process - view-only
4. **Approved**: Final approved status - terminal state (view-only)
5. **Rejected**: Rejected with required comments - terminal state (view-only)
6. **Need More Info**: Requires additional information - requires comment to transition
7. **Withdrawn**: Withdrawn by applicant - returns to Draft state

### Workflow Transitions
- **Submit**: Draft/Need More Info → Submitted
- **Start Review**: Submitted → Under Review (Reviewer/Admin only)
- **Make Decision**: Under Review → {Approved, Rejected, Need More Info} (Reviewer/Admin only)
  - Requires comment for Rejected and Need More Info transitions
- **Withdraw**: Submitted → Draft (Applicant only)
- **Resubmit**: Need More Info → Submitted (Applicant only)
- **Kanban Updates**: Drag-and-drop status changes with validation

### Dashboard Components
- **Statistics Cards**: Total applications, pending review, approved this month, rejected this month
- **Trend Charts**: Application volume over time (selectable periods: 7d, 30d, 90d)
- **Status Distribution**: Pie chart showing breakdown by application status
- **Recent Applications**: List of most recently updated applications
- **Performance Metrics**: Monthly comparisons and key performance indicators

### Settings Management
- **Profile Management**: Update name, email, avatar, and preferences
- **Password Change**: Secure password update with current password verification
- **Notification Preferences**: Email notifications, push notifications, digest frequency
- **Application Settings**: Default application type, auto-assign reviewer, comment requirements
- **Team Directory**: View all users with their roles and contact information
- **Session Management**: View active sessions and terminate specific sessions

## Environment Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `VITE_API_URL` | Base URL for backend API | `http://localhost:8000/api/v1` | Yes |

*Note: Environment variables must be prefixed with `VITE_` to be exposed to Vite's process.env*

## Browser Support

- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest 2 versions
- Mobile Safari: Latest 2 versions
- Android Chrome: Latest 2 versions

## Development Workflow

1. **Feature Development**
   - Create branch: `git checkout -b feature/feature-name`
   - Implement changes following established patterns
   - Write clean, typed, tested code
   - Commit with descriptive messages

2. **Testing**
   - Manual testing in development environment
   - Cross-browser testing
   - Responsive design testing
   - Accessibility testing (WCAG compliance)

3. **Code Review**
   - Open Pull Request
   - Address reviewer feedback
   - Ensure all checks pass

4. **Release**
   - Merge to main branch after approval
   - Tag release if appropriate
   - Deploy to staging/production

## Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# The built assets will be in the /dist directory
```

Production builds are optimized for:
- Smaller bundle sizes through code splitting
- Asset fingerprinting for cache busting
- Minification of JavaScript, CSS, and HTML
- Removal of development-only code and warnings

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - **Problem**: Cannot connect to backend API
   - **Solution**: 
     - Verify backend server is running on `http://localhost:8000`
     - Check `VITE_API_URL` in `.env` file
     - Ensure no firewall blocking the connection
     - Try accessing `http://localhost:8000/api/v1/docs` directly in browser

2. **Authentication Issues**
   - **Problem**: Login fails or token invalid
   - **Solution**:
     - Verify credentials are correct
     - Check that backend server is running
     - Clear localStorage and try again
     - Verify JWT token expiration (default 1 hour)

3. **Styling Problems**
   - **Problem**: Styles not applying correctly
   - **Solution**:
     - Verify Tailwind CSS is properly configured
     - Check for typos in class names
     - Ensure `npm run dev` is running (for JIT compilation in development)
     - Check PostCSS configuration

4. **Build Failures**
   - **Problem**: `npm run build` fails
   - **Solution**:
     - Delete `node_modules` and `package-lock.json`, then reinstall
     - Check for TypeScript errors (`npm run build` will show them)
     - Verify all dependencies are compatible with current Node.js version

### Getting Help

1. **Check the Browser Console**: For JavaScript errors and warnings
2. **Check Network Tab**: For failed API requests and responses
3. **Review Backend Logs**: For server-side errors and validation issues
4. **Consult Documentation**: This README and inline code comments
5. **Ask Team Members**: For project-specific questions and guidance

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ using React, Vite, and TypeScript
- Styling powered by Tailwind CSS
- Icons provided by Lucide (beautiful open-source icons)
- Data visualization by Recharts (composable charting library)
- Animations by Framer Motion (production-ready motion library)
- Drag and drop functionality by @dnd-kit (modern, accessible, performant)
- Notifications by Sonner (opinionated toast component)
- Inspired by modern IP management and workflow tracking systems
- API backbone provided by Django + Django Ninja (robust, secure, scalable)

---

**Ready to track IP workflows efficiently?** Start the application and begin managing your intellectual property portfolio with confidence!