"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppTopbar() {
  return (
    <header className="w-full h-16 px-4 flex items-center justify-between bg-white border-b rounded-t-md">
      <div className="flex items-center gap-4">
        {/* 👇 Sidebar toggle button */}
        <SidebarTrigger />
        <span className="text-xl font-semibold">My App</span>
      </div>

      <div>
        {/* User info / menu */}
        <button className="text-sm text-gray-700">Logout</button>
      </div>
    </header>
  );
}
