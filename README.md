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
- **Node-based Interface** - Visual workflow builder with drag-and-drop functionality
- **Service Integration** - REST API, webhook, and database connectors
- **Execution Engine** - Asynchronous workflow processing with real-time status updates
- **Real-time Updates** - Live execution status and logging

### AI Workflow Generation
- **AI-Powered Creation** - Generate complete workflows from natural language descriptions using Google Gemini
- **How to Use** - Click the "Create with AI" button in the workflows list to open the AI chat interface
- **Example Prompts** - "Send daily email report", "Monitor website uptime", "Process form submissions"
- **Powered by Google Gemini** - Leverages Google's advanced AI models for intelligent workflow generation
- **Environment Requirement** - Requires `GOOGLE_AI_API_KEY` in your environment variables

### Type Safety Throughout
- **End-to-end Types** - tRPC ensures API and frontend share types
- **Database Safety** - Prisma generates types from schema
- **Form Validation** - Zod schemas validate all user inputs

### Performance Optimizations
- **Server Components** - Reduce client-side JavaScript bundle
- **React Query Caching** - Minimize redundant API calls
- **Database Optimization** - Efficient queries with Prisma
- **Image Optimization** - Next.js automatic image optimization

## 📦 Available Node Types

The platform supports a comprehensive set of node types across multiple categories:

### 🎯 Triggers
Start workflows automatically based on events or schedules:

- **Manual Trigger** - Execute workflows manually (only one per workflow)
- **Webhook Trigger** - HTTP webhooks with authentication support
- **Schedule Trigger** - Cron-based or interval scheduling

### 💬 Communication
Send messages and notifications:

- **HTTP Request** - Make REST API calls with full request customization
- **Slack** - Send messages to Slack channels or users
- **Discord** - Send messages via webhooks or bot tokens
- **Email** - Send emails via SMTP or email service APIs

### 🤖 AI Services
Integrate with leading AI platforms:

- **OpenAI** - Chat completions with GPT-4, GPT-4 Turbo, and GPT-3.5
- **Anthropic** - Chat with Claude 3 models (Sonnet, Opus, Haiku)
- **Google Gemini** - Chat with Gemini 2.0 Flash and 1.5 Pro

### 🔄 Data Operations
Transform and manipulate data:

- **JSON** - Parse, stringify, extract, and transform JSON data
- **Filter** - Filter arrays based on conditions (AND/OR logic)
- **Set Variable** - Store data in workflow variables for later use
- **Code Execute** - Run JavaScript code with access to workflow data

### 🗄️ Database
Query and manipulate databases:

- **PostgreSQL** - Execute SQL queries with parameter binding
- **MongoDB** - Find, insert, update, delete, and aggregate operations

### 🛠️ Utilities
Control workflow execution flow:

- **Delay** - Wait for fixed durations or until specific times
- **IF Condition** - Conditional branching based on data conditions
- **Merge** - Combine data from multiple sources (append, merge by key, combine objects)

## 👤 Guest Mode

Users can create and edit workflows without signing up for an account:

- **Local Storage Persistence** - Workflows are automatically saved to your browser's localStorage
- **Automatic Migration** - When you sign up or log in, your guest workflows are seamlessly migrated to your account
- **Full Editor Access** - Create, edit, and design workflows with the complete visual editor
- **Limitations** - Guest workflows cannot be executed, shared, or accessed from other devices
- **Device-Specific** - Workflows are stored locally and not synced across browsers or devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### 1. Environment Setup
```bash
cp .env.example .env.local
# Configure your database URL and auth secrets
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random secret key for authentication
- `BETTER_AUTH_URL` - Your app's URL (http://localhost:3000 for development)
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Same as above, for client-side access

**Optional Variables:**
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - For GitHub OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `POLAR_ACCESS_TOKEN` - For Polar payment integration
- `SENTRY_DSN` - For error monitoring

**AI Features:**
- `GOOGLE_AI_API_KEY` - Required for AI workflow generation. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔐 Setting Up Credentials

Many nodes require API credentials for authentication:

1. **Navigate to Credentials** - Go to the credentials section in the app
2. **Create New Credential** - Click "Add Credential"
3. **Select Type** - Choose from API_KEY, BEARER_TOKEN, DATABASE, etc.
4. **Configure Details** - Enter your API keys, tokens, or connection details
5. **Test Connection** - Verify the credential works before using in nodes

### Credential Types
- **API_KEY** - For services like OpenAI, Slack, email providers
- **BEARER_TOKEN** - For Discord bots, authentication tokens
- **DATABASE** - PostgreSQL and MongoDB connection strings
- **OAUTH2** - OAuth 2.0 flows (for future expansion)

## 🐛 Recent Bug Fixes

- **Fixed Routing Issues** - Corrected 404 errors in workflows, credentials, and executions navigation
- **Improved User Experience** - Enhanced support for both guest and authenticated users
- **Landing Page Optimization** - Converted to server component for better performance
- **Workflow Persistence** - Seamless localStorage-based workflow saving for guest users

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
