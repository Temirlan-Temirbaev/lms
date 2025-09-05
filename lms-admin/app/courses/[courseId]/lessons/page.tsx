"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { LessonsTable } from "../../../../components/tables/LessonsTable";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  courseId?: string;
  course?: string | { _id: string; title: string; level: string };
}

interface Course {
  _id: string;
  title: string;
  level: string;
}

export default function LessonsPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}/lessons`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Сабақтарды алу сәтсіз аяқталды");
      }
      const data = await response.json();
      if (data.success) setLessons(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сабақтарды алу сәтсіз аяқталды");
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
      fetchLessons();
      fetchCourse();
    }
  }, [isAuthenticated, token, courseId]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Бұл сабақты жоюға сенімдісіз бе?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Сабақты жою сәтсіз аяқталды");
      }

      // Refresh lessons after successful deletion
      await fetchLessons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сабақты жою сәтсіз аяқталды");
    }
  };

  const handleCreateLesson = () => {
    // Navigate to create new lesson page
    router.push(`/courses/${courseId}/lessons/new`);
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
                <p className="text-gray-600">Сабақтар жүктелуде...</p>
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
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold">Сабақтар</h1>
                    {course && (
                      <p className="text-gray-600">
                        Course: {course.title} ({course.level})
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCreateLesson}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Сабақ қосу</span>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Барлық сабақтар ({lessons.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lessons.length > 0 ? (
                    <LessonsTable
                      lessons={lessons}
                      courseId={courseId}
                      onDeleteLesson={handleDeleteLesson}
                      variant="simple"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Бұл курс үшін сабақтар табылмады.
                      </p>
                      <Button onClick={handleCreateLesson} variant="outline">
                        Алғашқы сабақты жасау
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
