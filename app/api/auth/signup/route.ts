import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { polarSync } from "@/lib/polar-sync";
import prisma from "@/lib/db";
import { signupSchema, type SignupInput } from "@/lib/validation";

/**
 * POST /api/auth/signup
 * Handles user signup with Polar customer integration
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { email, password, name }: SignupInput = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if Polar customer exists
    const polarCustomerExists = await polarSync.customerExists(email);

    if (polarCustomerExists) {
      // Create user without Polar customer creation
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: name || email,
        }
      });

      // Link existing Polar customer
      await polarSync.handleExistingCustomer(email, user.id);

      // Sign in the user
      const session = await auth.api.signInEmail({
        body: { email, password }
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully. Existing Polar customer linked.",
        user
      });
    }

    // Normal signup flow
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name: name || email,
      }
    });

    const session = await auth.api.signInEmail({
      body: { email, password }
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error: "Failed to create account",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
