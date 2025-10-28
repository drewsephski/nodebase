import { getAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import {
  Workflow,
  Zap,
  Database,
  Code,
  Mail,
  MessageSquare,
  Shield,
  ArrowRight,
  Github,
  Sparkles,
  Clock
} from "lucide-react";

export default async function HomePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await getAuth();

  if (session) {
    redirect("/workflows");
  }

  const showAuthForm = (typeof searchParams.auth === 'string' && (searchParams.auth === "login" || searchParams.auth === "signup")) ? searchParams.auth : null;

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {showAuthForm === "login" ? "Welcome back" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {showAuthForm === "login" 
                  ? "Sign in to your account to continue" 
                  : "Get started with workflow automation"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showAuthForm === "login" ? (
                <LoginForm />
              ) : (
                <RegisterForm />
              )}
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  asChild
                >
                  <Link href={`?auth=${showAuthForm === "login" ? "signup" : "login"}`}>
                    {showAuthForm === "login"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"
                    }
                  </Link>
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  asChild
                >
                  <Link href="/">
                    Back to home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">N8N Clone</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-1" />
              Open Source Workflow Automation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Automate Your Workflows
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect APIs, databases, and services to create powerful automation workflows. 
              No coding required - just point, click, and automate.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8"
              >
                <Link href="/workflows">
                  Try Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-accent/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Automation Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build complex workflows with our visual editor and comprehensive integration library.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Visual Workflow Builder</CardTitle>
                <CardDescription>
                  Drag-and-drop interface to create complex automation workflows without writing code.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Database Integrations</CardTitle>
                <CardDescription>
                  Connect to PostgreSQL, MongoDB, and other databases to automate data operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Custom Code Nodes</CardTitle>
                <CardDescription>
                  Add custom JavaScript and TypeScript nodes for advanced logic and data transformations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Communication Tools</CardTitle>
                <CardDescription>
                  Send emails, Slack messages, and Discord notifications directly from your workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Scheduled Triggers</CardTitle>
                <CardDescription>
                  Set up time-based triggers to run workflows automatically at specified intervals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with encrypted credentials and reliable execution monitoring.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Automate?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already automating their workflows and saving hours of manual work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/signup">
                  Start Building
                  <Zap className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-accent/20 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Workflow className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">N8N Clone</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Open Source</span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
