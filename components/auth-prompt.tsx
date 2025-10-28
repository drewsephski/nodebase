"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useState } from "react";

interface AuthPromptProps {
  title?: string;
  description?: string;
  mode?: "login" | "register" | "both";
}

export function AuthPrompt({ 
  title = "Sign in required", 
  description = "Please sign in to access this feature",
  mode = "login" 
}: AuthPromptProps) {
  const [showForm, setShowForm] = useState<"login" | "register" | null>(null);

  if (showForm) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {showForm === "login" ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {showForm === "login" 
              ? "Sign in to continue" 
              : "Create an account to get started"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForm === "login" ? <LoginForm /> : <RegisterForm />}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowForm(null)}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mode === "both" ? (
              <>
                <Button 
                  onClick={() => setShowForm("login")} 
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm("register")}
                  className="w-full"
                >
                  Create Account
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setShowForm(mode)} 
                className="w-full"
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}