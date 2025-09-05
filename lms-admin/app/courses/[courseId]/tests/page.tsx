"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { TestsTable } from "../../../../components/tables/TestsTable";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface Test {
  _id: string;
  title: string;
  description: string;
  order: number;
  course: string | { _id: string; title: string; level: string };
  questions: any[];
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Course {
  _id: string;
  title: string;
  level: string;
}

export default function TestsPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [tests, setTests] = useState<Test[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}/tests`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Тесттерді алу сәтсіз аяқталды");
      }
      const data = await response.json();
      if (data.success) setTests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Тесттерді алу сәтсіз аяқталды");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Курсты алу сәтсіз аяқталды");
      }
      const data = await response.json();
      if (data.success) setCourse(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Курсты алу сәтсіз аяқталды");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (courseId) {
      fetchTests();
      fetchCourse();
    }
  }, [isAuthenticated, token, courseId]);

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Бұл тестті жоюға сенімдісіз бе?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Тестті жою сәтсіз аяқталды");
      }

      // Refresh tests after successful deletion
      await fetchTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Тестті жою сәтсіз аяқталды");
    }
  };

  const handleCreateTest = () => {
    // Navigate to create new test page
    router.push(`/courses/${courseId}/tests/new`);
  };

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
        <div className="flex flex-1 flex-col p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Тесттер жүктелуде...</p>
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
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h1 className="text-3xl font-bold">Тесттер</h1>
                    {course && (
                      <p className="text-gray-600">
                        Course: {course.title} ({course.level})
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCreateTest}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Тест қосу</span>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Барлық тесттер ({tests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tests.length > 0 ? (
                    <TestsTable
                      tests={tests}
                      courseId={courseId}
                      onDeleteTest={handleDeleteTest}
                      variant="detailed"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Бұл курс үшін тесттер табылмады.
                      </p>
                      <Button onClick={handleCreateTest} variant="outline">
                        Алғашқы тестті жасау
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
