import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/api/config(.*)',
  '/api/templates(.*)',
  '/api/mcp(.*)',
  '/api/test-mcp-connection(.*)',
  '/api/workflows(.*)', // Allow all workflow routes without auth
])

// Define API routes that require API key authentication (bypass Clerk auth)
const isApiKeyRoute = createRouteMatcher([
  // External API-only routes that bypass Clerk
  '/api/workflows/(.*)/execute-api',  // Only external API calls
])

export default clerkMiddleware(async (auth, request) => {
  // Skip Clerk auth for all API routes - they handle their own auth
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return
  }

  // API key routes bypass Clerk auth (will be validated in the route handler)
  if (isApiKeyRoute(request)) {
    return
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
