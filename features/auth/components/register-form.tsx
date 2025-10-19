"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email(
            {
                email: values.email,
                password: values.password,
                name: values.email,
                callbackURL: "/",
            },
            {
                onSuccess: () => {
                    router.push("/");
                },
                onError: (ctx) => {
                    // Handle specific Polar customer exists error
                    if (ctx.error.message.includes("customer with this email address already exists")) {
                        toast.error("This email is already registered with Polar. Please login instead.");
                        // Optionally redirect to login
                        router.push("/login");
                    } else {
                        toast.error(ctx.error.message);
                    }
                },
            }
        )
    };

    const handleSocialLogin = async (provider: "github" | "google") => {
        await authClient.signIn.social({
            provider,
            callbackURL: "/",
        }, {
            onSuccess: () => {
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
        });
    };

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6 mx-auto min-w-sm">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Register to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline"
                                        className="w-full cursor-pointer"
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleSocialLogin("github")}
                                    >
                                        <Image src="/logos/github.svg" alt="GitHub" width={22} height={22} />
                                        Continue with GitHub</Button>
                                    <Button variant="outline"
                                        className="w-full cursor-pointer"
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleSocialLogin("google")}
                                    >
                                        <Image src="/logos/google.svg" alt="Google" width={20} height={20} />
                                        Continue with Google</Button>
                                </div>
                                <div className="grid gap-6 w-full">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input {...field}
                                                        type="email"
                                                        placeholder="example@gmail.com" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input {...field}
                                                        type="password"
                                                        placeholder="*********" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input {...field}
                                                        type="password"
                                                        placeholder="*********" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <ShimmerButton type="submit"
                                        disabled={isPending}
                                        className="w-full cursor-pointer"
                                    >Register</ShimmerButton>
                                </div>
                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4 cursor-pointer">Login</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

