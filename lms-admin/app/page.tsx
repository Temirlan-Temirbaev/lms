"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminCharts } from "@/components/admin-charts";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "../components/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen flex-1 rounded-xl bg-muted/50 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Добро пожаловать, {user?.name || user?.email}! Вот что
                происходит в вашей системе.
              </h1>
            </div>
            <AdminDashboard />

            <div className="mt-12">
              <AdminCharts />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
