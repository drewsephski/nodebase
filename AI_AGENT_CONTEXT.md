# AI Agent Universal Context - N8N Clone

## Project Overview
**N8N Clone** - A modern, full-stack workflow automation platform inspired by n8n, built with Next.js 15 and modern web technologies.

### Core Architecture
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: tRPC for type-safe APIs, Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with multiple providers (Google, GitHub, etc.)
- **UI Framework**: TailwindCSS + Radix UI (shadcn/ui components)
- **State Management**: TanStack React Query
- **Package Manager**: Bun

### Key Technologies Stack
- **Runtime**: Node.js 18+
- **Build Tool**: Turbopack (Next.js 15)
- **Styling**: TailwindCSS with CSS variables for theming
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Monitoring**: Sentry integration

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (tRPC, auth, etc.)
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── react-flow/       # Workflow visualization components
├── features/             # Feature-specific modules
│   ├── auth/            # Authentication logic
│   ├── editor/          # Workflow editor
│   ├── executions/      # Workflow execution handling
│   └── subscriptions/   # Subscription management
├── lib/                 # Utility functions and configurations
├── hooks/               # Custom React hooks
├── prisma/              # Database schema and migrations
├── trpc/                # tRPC routers and procedures
└── services/            # External service integrations
```

## Development Guidelines

### Code Style & Standards
- **TypeScript**: Strict mode enabled, ES2017 target
- **Imports**: Use path mapping `@/*` for src directory
- **Linting**: ESLint with Next.js and TypeScript rules
- **Formatting**: Consistent indentation and naming conventions

### Component Development
- **UI Library**: Radix UI primitives with shadcn/ui styling
- **Patterns**: Compound components, proper prop typing
- **State**: React Hook Form for forms, TanStack Query for server state
- **Styling**: TailwindCSS with utility-first approach

### API Development
- **tRPC**: Type-safe procedures with `createTRPCRouter`
- **Authentication**: `protectedProcedure` for authenticated routes
- **Validation**: Zod schemas for input/output validation
- **Error Handling**: Consistent error responses

## Current Focus Areas

### HTTP Request Component
Located in `features/executions/components/http-request/`
- **Purpose**: Configure HTTP requests for workflow execution
- **Features**:
  - Dynamic form with endpoint, method, and optional body
  - Template variable support: `{{variables}}` and `{{json variable}}`
  - Conditional rendering based on HTTP method
  - Form validation with Zod schemas

### Key Features in Development
1. **Workflow Editor**: Visual workflow building with React Flow
2. **Node System**: HTTP requests, triggers, and custom nodes
3. **Execution Engine**: Background job processing
4. **Authentication**: Multi-provider auth with Better Auth
5. **Subscription Management**: User plans and billing

## Setup & Development Commands

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Bun package manager

### Key Commands
```bash
# Install dependencies
bun install

# Environment setup
cp .env.example .env.local

# Database setup
bunx prisma generate
bunx prisma db push

# Development server
bun run dev

# Build for production
bun run build
bun run start
```

## API Patterns

### tRPC Router Structure
```typescript
export const workflowRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.workflow.findMany({
      where: { userId: ctx.auth.user.id }
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.workflow.create({
        data: { ...input, userId: ctx.auth.user.id }
      });
    })
});
```

### Component Patterns
```typescript
// Form components with proper validation
<FormField
  control={form.control}
  name="endpoint"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Endpoint</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>
        Static URL or use {"{{variables}}"} for dynamic values
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Security Considerations
- Input validation with Zod schemas
- Protected procedures for authenticated routes
- Proper session management with Better Auth
- Rate limiting on sensitive endpoints
- HTTPS enforcement in production

## Performance Optimizations
- React Server Components for static content
- Proper loading states with React Query
- Image optimization with Next.js Image component
- Database query optimization with Prisma

## Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for API routes
- Component tests for UI interactions
- E2E tests for critical user flows

## Deployment
- Framework: Next.js 15 with Turbopack
- Database: Prisma with PostgreSQL
- Authentication: Better Auth
- Monitoring: Sentry integration
- Hosting: Vercel/Netlify compatible

This context file provides essential information for AI agents working on the N8N Clone project, ensuring consistent understanding of architecture, patterns, and current development focus.
