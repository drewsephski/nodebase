# N8N Clone - Workflow Automation Platform

A modern, full-stack workflow automation platform built with Next.js, inspired by n8n. This application allows users to create, manage, and execute automated workflows by connecting various services and APIs together.

## 🚀 Technology Stack Overview

### Core Framework & Runtime
- **Next.js 15** - React framework using the App Router for server-side rendering, static generation, and API routes
- **React 19** - UI library for building interactive user interfaces
- **TypeScript** - Provides type safety and enhanced developer experience throughout the application

### API Layer & Data Fetching
- **tRPC** - Type-safe API layer that enables seamless communication between frontend and backend with full type safety
  - Used for creating strongly-typed API endpoints without code generation
  - Integrates with React Query for efficient data fetching and caching
  - Provides authentication middleware for protected routes
- **TanStack React Query** - Handles server state management, caching, and synchronization
  - Optimizes data fetching and reduces unnecessary API calls
  - Provides loading states and error handling

### Database & ORM
- **Prisma** - Modern database ORM for type-safe database access
  - Generates type-safe database client
  - Handles database migrations and schema management
- **PostgreSQL** - Robust relational database for storing user data, workflows, and execution logs

### Authentication & Security
- **Better Auth** - Modern authentication system handling multiple providers
  - Manages user sessions, account linking, and verification flows
  - Provides secure session management and token handling

### UI/UX & Styling
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
  - Enables responsive design and consistent styling
  - Customizable design system with CSS variables
- **Radix UI** - Accessible, unstyled UI components
  - Provides the foundation for custom component library
  - Ensures accessibility compliance
- **Lucide React** - Beautiful icon library for consistent iconography
- **Next Themes** - Theme management for dark/light mode support

### Forms & Validation
- **React Hook Form** - Performant form handling with minimal re-renders
- **Zod** - TypeScript-first schema validation
  - Ensures data integrity and type safety
  - Used for both client and server-side validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS post-processing for TailwindCSS
- **Turbo** - Next.js bundler for faster development builds

## 🏗️ Architecture Overview

### Frontend Architecture
The application uses Next.js App Router with a component-based architecture:

- **Server Components** - Handle initial page loads and SEO
- **Client Components** - Manage interactive UI elements
- **Layout System** - Consistent navigation and theming across routes

### API Architecture
tRPC provides a unified API layer:

```typescript
// Example tRPC router structure
const appRouter = createTRPCRouter({
  workflows: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Type-safe database queries
      return await prisma.workflow.findMany({
        where: { userId: ctx.auth.user.id }
      });
    }),
    create: protectedProcedure
      .input(workflowSchema)
      .mutation(async ({ ctx, input }) => {
        // Validated input with Zod schema
        return await prisma.workflow.create({
          data: { ...input, userId: ctx.auth.user.id }
        });
      })
  })
});
```

### Database Architecture
Prisma manages the database schema and provides type-safe queries:

```prisma
model Workflow {
  id          String   @id @default(cuid())
  name        String
  description String?
  nodes       Json     // Store workflow nodes as JSON
  connections Json     // Store node connections
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Authentication Flow
Better Auth handles the complete authentication lifecycle:

1. **User Registration/Login** - Multiple provider support
2. **Session Management** - Secure token-based sessions
3. **Route Protection** - Middleware for protected pages
4. **Account Linking** - Social login integration

## 🔧 Key Features Implementation

### Workflow Engine
- **Node-based Interface** - Visual workflow builder
- **Service Integration** - REST API, webhook, and database connectors
- **Execution Engine** - Asynchronous workflow processing
- **Real-time Updates** - Live execution status and logging

### Type Safety Throughout
- **End-to-end Types** - tRPC ensures API and frontend share types
- **Database Safety** - Prisma generates types from schema
- **Form Validation** - Zod schemas validate all user inputs

### Performance Optimizations
- **Server Components** - Reduce client-side JavaScript bundle
- **React Query Caching** - Minimize redundant API calls
- **Database Optimization** - Efficient queries with Prisma
- **Image Optimization** - Next.js automatic image optimization

## 🚀 Getting Started

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your database URL and auth secrets
   ```

2. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🎯 Project Goals

This n8n clone aims to provide:
- **Visual Workflow Builder** - Drag-and-drop interface for creating automations
- **Extensive Integrations** - Support for popular services and APIs
- **Scalable Architecture** - Handle complex workflows and high loads
- **Developer-Friendly** - Full TypeScript support and excellent DX
- **Self-Hostable** - Easy deployment and maintenance

## 🤝 Contributing

Contributions are welcome! This project serves as both a functional workflow automation platform and a learning resource for modern web development practices.
