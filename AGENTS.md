# AGENTS.md - AI Coding Agent Instructions

## Project Overview

**N8N Clone** - A modern, full-stack workflow automation platform built with Next.js 15, inspired by n8n. This application allows users to create, manage, and execute automated workflows by connecting various services and APIs together.

### Core Architecture

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: tRPC for type-safe APIs, Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with multiple providers
- **UI Framework**: TailwindCSS + Radix UI (shadcn/ui components)
- **State Management**: TanStack React Query
- **Package Manager**: Bun

## Setup and Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Bun package manager

### Initial Setup Steps

1. **Clone and navigate to project**

   ```bash
   git clone <repository-url>
   cd n8n
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment configuration**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following in `.env.local`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/n8n_db"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Database setup**

   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Start development server**

   ```bash
   bun run dev
   ```

   Application will be available at `http://localhost:3000`

### Alternative Development Setup

```bash
# Run all services (app + inngest)
bun run dev:all

# Run only the inngest service
bun run inngest:dev
```

## Build and Deployment

### Build Commands

```bash
# Production build
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

### Deployment Configuration

- **Framework**: Next.js 15 with Turbopack
- **Database**: Prisma with PostgreSQL
- **Authentication**: Better Auth
- **Monitoring**: Sentry integration

## Code Style and Standards

### TypeScript Configuration

- **Target**: ES2017
- **Strict Mode**: Enabled
- **Path Mapping**: `@/*` → `./*`
- **File Extensions**: `.ts`, `.tsx`

### ESLint Rules

- Extends: `next/core-web-vitals`, `next/typescript`
- **Ignored Directories**:
  - `node_modules/**`
  - `.next/**`
  - `out/**`
  - `build/**`
  - `next-env.d.ts`

### Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── ...                # Route handlers
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── utils.ts         # General utilities
│   └── ...              # Shared libraries
├── hooks/               # Custom React hooks
├── features/            # Feature-specific modules
└── trpc/               # tRPC routers and procedures
```

### Import Aliases

```typescript
// Components
import { Button } from "@/components/ui/button"

// Utilities
import { cn } from "@/lib/utils"

// Types
import type { RouterOutputs } from "@/trpc/shared"
```

## Database and API Guidelines

### Prisma Schema Management

- Models defined in `prisma/schema.prisma`
- Generate client: `bunx prisma generate`
- Apply migrations: `bunx prisma db push`

### tRPC API Structure

```typescript
// Router definition
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

### API Route Protection

- Use `protectedProcedure` for authenticated routes
- Access user context via `ctx.auth.user`
- Validate inputs with Zod schemas

## Component Development

### UI Component Library

- **Base**: Radix UI primitives
- **Styling**: TailwindCSS with shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

### Component Structure

```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## Testing Strategy

### Testing Commands

```bash
# Run test suite (when implemented)
bun run test

# Run specific test file
bun run test components/button.test.tsx
```

### Testing Guidelines

- Unit tests for utilities and hooks
- Integration tests for API routes
- Component tests for UI interactions
- E2E tests for critical user flows

## Git and Collaboration

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following code standards
3. Add tests for new functionality
4. Update documentation if needed
5. Submit PR with descriptive title
6. Request review from maintainers

### Branch Naming Convention

```
feature/add-workflow-templates
fix/authentication-bug
refactor/api-optimization
```

## Security Guidelines

### Authentication

- Use `protectedProcedure` for all authenticated routes
- Validate all user inputs with Zod schemas
- Implement proper session management with Better Auth

### Database Security

- Never expose raw database URLs in client code
- Use Prisma's type-safe query builder
- Implement proper input sanitization

### API Security

- Validate all API inputs
- Implement rate limiting on sensitive endpoints
- Use HTTPS in production

## Dependency Management

### Adding New Dependencies

```bash
# Production dependencies
bun add package-name

# Development dependencies
bun add -d package-name

# Update lockfile
bun install
```

### Dependency Guidelines

- **Frontend**: React ecosystem libraries
- **Backend**: Node.js compatible packages
- **UI**: Radix UI, TailwindCSS ecosystem
- **Development**: ESLint, TypeScript, testing frameworks

### Version Management

- Use specific versions in `package.json`
- Regularly update dependencies for security
- Test thoroughly after major version updates

## Performance Considerations

### Optimization Techniques

- Use React Server Components for static content
- Implement proper loading states with React Query
- Optimize images with Next.js Image component
- Minimize client-side JavaScript bundle

### Monitoring

- Sentry integration for error tracking
- Performance monitoring in production
- Database query optimization

## Troubleshooting

### Common Issues

**Build Errors:**

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
bunx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install
```

**Database Issues:**

```bash
# Reset database
bunx prisma db push --force-reset

# Check database connection
bunx prisma studio
```

**Type Errors:**

```bash
# Regenerate types
bunx prisma generate
bunx tsc --noEmit
```

## Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Community

- GitHub Issues for bug reports
- Discussions for feature requests
- Discord/Server for real-time support

---

*This AGENTS.md file provides comprehensive operational instructions for AI coding agents working on the N8N Clone project. Keep this file updated as the project evolves.*
