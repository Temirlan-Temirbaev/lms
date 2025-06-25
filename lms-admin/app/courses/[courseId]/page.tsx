"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TestsTable } from "@/components/tables/TestsTable";
import { LessonsTable } from "@/components/tables/LessonsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  order: number;
  courseId?: string;
  course: string | { _id: string; title: string; level: string };
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function CourseDetailPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("lessons");

  // Lesson form states
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    order: 1,
  });
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Test form states
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    order: 1,
    passingScore: 70,
    timeLimit: 30,
    isFinal: false,
  });
  const [creatingTest, setCreatingTest] = useState(false);

  // Fetch course data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const courseData = await courseRes.json();
        if (courseData.success) setCourse(courseData.data);

        // Fetch lessons
        const lessonsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}/lessons`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) setLessons(lessonsData.data);

        // Fetch tests
        const testsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}/tests`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const testsData = await testsRes.json();
        if (testsData.success) setTests(testsData.data);
      } catch (err) {
        setError("Не удалось загрузить данные курса");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [isAuthenticated, token, courseId]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот урок?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Remove lesson from local state
        setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      } else {
        alert(data.message || "Не удалось удалить урок");
      }
    } catch (error) {
      alert("Ошибка при удалении урока");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLesson(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...lessonForm,
            course: courseId, // Changed from courseId to course to match the backend model
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setLessons((prev) => [...prev, data.data]);
        setLessonDialogOpen(false);
        setLessonForm({ title: "", content: "", order: 1 });
      } else {
        alert(data.message || "Не удалось создать урок");
      }
    } catch (error) {
      alert("Ошибка при создании урока");
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот тест?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Remove test from local state
        setTests((prev) => prev.filter((test) => test._id !== testId));
      } else {
        alert(data.message || "Не удалось удалить тест");
      }
    } catch (error) {
      alert("Ошибка при удалении теста");
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTest(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...testForm,
            course: courseId,
            questions: [],
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTests((prev) => [...prev, data.data]);
        setTestDialogOpen(false);
        setTestForm({
          title: "",
          description: "",
          order: 1,
          passingScore: 70,
          timeLimit: 30,
          isFinal: false,
        });
      } else {
        alert(data.message || "Не удалось создать тест");
      }
    } catch (error) {
      alert("Ошибка при создании теста");
    } finally {
      setCreatingTest(false);
    }
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
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/courses")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к курсам
            </Button>
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : course ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground">Level: {course.level}</p>
              </div>{" "}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="lessons">
                      Уроки ({lessons.length})
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                      Тесты ({tests.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    {activeTab === "lessons" && (
                      <Dialog
                        open={lessonDialogOpen}
                        onOpenChange={setLessonDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>+ Новый урок</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Создать новый урок</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateLesson}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="lesson-title">Title</Label>
                              <Input
                                id="lesson-title"
                                placeholder="Название урока"
                                value={lessonForm.title}
                                onChange={(e) =>
                                  setLessonForm((f) => ({
                                    ...f,
                                    title: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="lesson-order">Порядок</Label>
                              <Input
                                id="lesson-order"
                                type="number"
                                placeholder="Порядок"
                                value={lessonForm.order}
                                onChange={(e) =>
                                  setLessonForm((f) => ({
                                    ...f,
                                    order: parseInt(e.target.value),
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="lesson-content">
                                Содержание (Markdown)
                              </Label>
                              <Textarea
                                id="lesson-content"
                                placeholder="Содержание урока в формате markdown"
                                value={lessonForm.content}
                                onChange={(e) =>
                                  setLessonForm((f) => ({
                                    ...f,
                                    content: e.target.value,
                                  }))
                                }
                                rows={10}
                                required
                              />
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={creatingLesson}>
                                {creatingLesson
                                  ? "Создание..."
                                  : "Создать урок"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {activeTab === "tests" && (
                      <Dialog
                        open={testDialogOpen}
                        onOpenChange={setTestDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>+ Новый тест</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Создать новый тест</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateTest}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="test-title">Название</Label>
                              <Input
                                id="test-title"
                                placeholder="Название теста"
                                value={testForm.title}
                                onChange={(e) =>
                                  setTestForm((f) => ({
                                    ...f,
                                    title: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="test-order">Порядок</Label>
                              <Input
                                id="test-order"
                                type="number"
                                placeholder="Порядок"
                                value={testForm.order}
                                onChange={(e) =>
                                  setTestForm((f) => ({
                                    ...f,
                                    order: parseInt(e.target.value),
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="test-description">Описание</Label>
                              <Textarea
                                id="test-description"
                                placeholder="Описание теста"
                                value={testForm.description}
                                onChange={(e) =>
                                  setTestForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                  }))
                                }
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <Label htmlFor="test-passing-score">
                                  Проходной балл (%)
                                </Label>
                                <Input
                                  id="test-passing-score"
                                  type="number"
                                  placeholder="70"
                                  min="0"
                                  max="100"
                                  value={testForm.passingScore}
                                  onChange={(e) =>
                                    setTestForm((f) => ({
                                      ...f,
                                      passingScore: parseInt(e.target.value),
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label htmlFor="test-time-limit">
                                  Ограничение времени (минуты)
                                </Label>
                                <Input
                                  id="test-time-limit"
                                  type="number"
                                  placeholder="30"
                                  min="1"
                                  value={testForm.timeLimit}
                                  onChange={(e) =>
                                    setTestForm((f) => ({
                                      ...f,
                                      timeLimit: parseInt(e.target.value),
                                    }))
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="test-is-final"
                                checked={testForm.isFinal}
                                onChange={(e) =>
                                  setTestForm((f) => ({
                                    ...f,
                                    isFinal: e.target.checked,
                                  }))
                                }
                              />
                              <Label htmlFor="test-is-final">
                                Это финальный тест (открывает следующий уровень)
                              </Label>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={creatingTest}>
                                {creatingTest ? "Создание..." : "Создать тест"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <TabsContent value="lessons">
                  <LessonsTable
                    lessons={lessons}
                    courseId={courseId}
                    onDeleteLesson={handleDeleteLesson}
                  />
                </TabsContent>

                <TabsContent value="tests">
                  <TestsTable
                    tests={tests}
                    courseId={courseId}
                    onDeleteTest={handleDeleteTest}
                    variant="simple"
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div>Курс не найден</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
