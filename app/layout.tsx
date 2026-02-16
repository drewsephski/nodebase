"use client";

import { GeistMono } from "geist/font/mono";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import ColorStyles from "@/components/shared/color-styles/color-styles";
import Scrollbar from "@/components/ui/scrollbar";
import { BigIntProvider } from "@/components/providers/BigIntProvider";
import "styles/main.css";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
});

// Metadata must be in a separate server component
// For now, set via document head

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en">
      <head>
        <title>Nodebase</title>
        <meta name="description" content="Build Nodebase workflows and automations with a visual programming canvas" />
        <link rel="icon" href="/favicon.png" />
        <ColorStyles />
      </head>
      <body
        className={`${GeistMono.variable} ${robotoMono.variable} font-sans text-accent-black bg-background-base overflow-x-clip`}
      >
        <BigIntProvider>
          <main className="overflow-x-clip">{children}</main>
          <Scrollbar />
          <Toaster position="bottom-right" />
        </BigIntProvider>
      </body>
    </html>
  );

  return (
    <ClerkProvider>
      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {content}
        </ConvexProviderWithClerk>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
