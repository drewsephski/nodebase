"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export const LogoutButton = () => {
    const router = useRouter();
    return (
        <ShimmerButton className="cursor-pointer" onClick={() => authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
                onError: (ctx) => {
                    console.error(ctx.error);
                },
            },
        })}>Logout</ShimmerButton>
    )
}
