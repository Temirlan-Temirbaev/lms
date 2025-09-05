"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { PlacementTestsTable } from "@/components/tables/PlacementTestsTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: any[];
  createdAt?: string;
  updatedAt?: string;
}

export default function PlacementTestsPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();


  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlacementTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Деректерді жүктеу сәтсіз аяқталды');
      }
      const data = await response.json();
      if (data.success) setPlacementTests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Деректерді жүктеу сәтсіз аяқталды');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlacementTest = async (testId: string) => {
    if (!confirm('Бұл тестті жою керек пе?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Жою сәтсіз аяқталды');
      }

      // Refresh placement tests after successful deletion
      await fetchPlacementTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Жою сәтсіз аяқталды');
    }
  };

  const handleCreatePlacementTest = () => {
    // Navigate to create new placement test page
    router.push(`/placement-tests/new`);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetchPlacementTests();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Жүктелуде...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Қайта көру
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold">Деңгей анықтау тесттері</h1>
                    <p className="text-gray-600">
                      Студенттердің тіл деңгейін анықтау үшін тесттерді басқару
                    </p>
                  </div>
                </div>
                  {/* <Button
                    onClick={handleCreatePlacementTest}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Placement Test</span>
                  </Button> */}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Барлық тесттер ({placementTests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {placementTests.length > 0 ? (
                    <PlacementTestsTable
                      placementTests={placementTests}
                      onDeletePlacementTest={handleDeletePlacementTest}
                      variant="detailed"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Тесттер табылмады
                      </p>
                      <Button onClick={handleCreatePlacementTest} variant="outline">
                        Алғашқы тестті құру
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>

    </SidebarProvider>
  );
}