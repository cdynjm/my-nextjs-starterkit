"use client";

import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      {session ? (
        <>
          <AppSidebar />
          <div className="flex flex-col w-full bg-white m-2 shadow rounded-md">
            <AppTopbar />
            <main className="flex-1">{children}</main>
          </div>
        </>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </SidebarProvider>
  );
}