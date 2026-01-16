"use client";

import {
  CreditCardIcon,
  JoystickIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
  FolderOpenIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";

const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="52"
    height="44"
    viewBox="0 0 53 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.2997 0L52.0461 28.6301V44H38.6311V34.1553L17.7522 13.3607L13.415 13.3607L13.415 44H0L0 0L23.2997 0ZM38.6311 15.2694V0L52.0461 0V15.2694L38.6311 15.2694Z"
      fill="#212326"
    />
  </svg>
);

const menuItems = [
  {
    title: "Workflows",
    url: "/workflows",
    icon: FolderOpenIcon,
  },
  {
    title: "Credentials",
    url: "/credentials",
    icon: KeyIcon,
  },
  {
    title: "Executions",
    url: "/executions",
    icon: JoystickIcon,
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { hasActiveSubscription } = useHasActiveSubscription();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton asChild className="gap-x-4 h-12 px-4">
          <Link href="/workflows" prefetch>
            <Logo className="h-8 w-8" />
            <span className="text-sm font-semibold">NodeBase</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
            {menuItems.map((menuItem) => (
              <SidebarMenuItem key={menuItem.title}>
                <SidebarMenuButton
                  tooltip={menuItem.title}
                  isActive={menuItem.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(menuItem.url)
                  }
                  asChild
                  className="gap-x-4 h-10 px-4"
                >
                  <Link href={menuItem.url} prefetch>
                    <menuItem.icon className="size-4" />
                    <span>{menuItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Upgrade to Pro"
              asChild
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.checkout({ slug: "pro" })}
            >
              <Link href="/" prefetch>
                <StarIcon className="h-4 w-4" />
                <span>Upgrade to Pro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
                    <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={hasActiveSubscription ? "View Billing" : "Upgrade to Pro"}
              asChild
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.customer.portal()}
            >
              <Link href="/" prefetch>
                <CreditCardIcon className="h-4 w-4" />
                <span>Billing Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
                              <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              asChild
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/login")
                    }
                }
              })}
            >
              <Link href="/login" prefetch>
                <LogOutIcon className="h-4 w-4" />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
