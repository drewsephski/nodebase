"use client";
  
import React from "react";
import { Button } from "./ui/button";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
  
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}
  
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
  
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced logging with component stack trace
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Placeholder for monitoring service (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }
  
  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }
  
      // Error categorization logic
      const error = this.state.error!;
      let errorType: 'network' | 'auth' | 'notFound' | 'app' = 'app';
      let errorMessage = "Something went wrong. Please try again.";
      let showRetry = true;
      let redirectHref: string | null = null;
  
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorType = 'network';
        errorMessage = "Network error. Check your connection and try again.";
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorType = 'auth';
        errorMessage = "Authentication required. Please log in.";
        showRetry = false;
        redirectHref = "/login";
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorType = 'notFound';
        errorMessage = "Page or resource not found.";
        showRetry = false;
        redirectHref = "/workflows";
      }
  
      return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4 p-4">
          <AlertTriangleIcon className="size-8 text-destructive" />
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-lg font-semibold">Oops! An error occurred</h2>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mt-4">
                <summary className="cursor-pointer text-sm font-medium">Error Details (Dev Mode)</summary>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center mt-4">
              {showRetry && (
                <Button onClick={this.resetError} size="sm">
                  <RefreshCwIcon className="size-4 mr-2" />
                  Retry
                </Button>
              )}
              {redirectHref ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={redirectHref}>
                    {errorType === 'auth' ? 'Go to Login' : 'Go to Workflows'}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href="/workflows">Back to Workflows</Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              If the problem persists, <Link href="/support" className="underline">report this issue</Link>.
            </p>
          </div>
        </div>
      );
    }
  
    return this.props.children;
  }
}
