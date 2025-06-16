"use client";

import { usePageTitle } from "@/components/PageTitleContext";
import { useEffect } from "react";

export default function DashboardPage() {
  
  const { setTitle } = usePageTitle();
  
    useEffect(() => {
      setTitle("Dashboard");
      return () => setTitle("");
    }, [setTitle]);
  return (
    <section className="p-4">
      
    </section>
  );
}
