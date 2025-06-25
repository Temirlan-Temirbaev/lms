"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-context";
import { Button } from "../../../components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  UniversalDataTable,
  createActionsColumn,
} from "@/components/universal-data-table";
import { ColumnDef } from "@tanstack/react-table";
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
  courseId: string;
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
  });
  const [creatingTest, setCreatingTest] = useState(false);
  // Lesson columns
  const lessonColumns: ColumnDef<Lesson>[] = [
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600"
          onClick={() =>
            router.push(`/courses/${courseId}/lessons/${row.original._id}`)
          }
        >
          {row.getValue("order")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 font-medium"
          onClick={() =>
            router.push(`/courses/${courseId}/lessons/${row.original._id}`)
          }
        >
          {row.getValue("title")}
        </span>
      ),
    },
    createActionsColumn<Lesson>((lesson) => [
      {
        label: "View/Edit",
        onClick: () => handleEditLesson(lesson),
      },
      {
        label: "Delete",
        onClick: () => handleDeleteLesson(lesson._id),
        isDanger: true,
        separator: true,
      },
    ]),
  ];
  // Test columns
  const testColumns: ColumnDef<Test>[] = [
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600"
          onClick={() =>
            router.push(`/courses/${courseId}/tests/${row.original._id}`)
          }
        >
          {row.getValue("order")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 font-medium"
          onClick={() =>
            router.push(`/courses/${courseId}/tests/${row.original._id}`)
          }
        >
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "questions",
      header: "Questions",
      cell: ({ getValue }) => (getValue() as any[])?.length || 0,
    },
    createActionsColumn<Test>((test) => [
      {
        label: "View/Edit",
        onClick: () => handleEditTest(test),
      },
      {
        label: "Manage Questions",
        onClick: () =>
          router.push(`/courses/${courseId}/tests/${test._id}/questions`),
      },
      {
        label: "Delete",
        onClick: () => handleDeleteTest(test._id),
        isDanger: true,
        separator: true,
      },
    ]),
  ];

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
        setError("Failed to fetch course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [isAuthenticated, token, courseId]);
  // Lesson handlers
  const handleEditLesson = (lesson: Lesson) => {
    // Navigate to lesson detail page for editing
    router.push(`/courses/${courseId}/lessons/${lesson._id}`);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

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
        alert(data.message || "Failed to delete lesson");
      }
    } catch (error) {
      alert("Error deleting lesson");
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
        alert(data.message || "Failed to create lesson");
      }
    } catch (error) {
      alert("Error creating lesson");
    } finally {
      setCreatingLesson(false);
    }
  };
  // Test handlers
  const handleEditTest = (test: Test) => {
    // Navigate to test detail page for editing
    router.push(`/courses/${courseId}/tests/${test._id}`);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

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
        alert(data.message || "Failed to delete test");
      }
    } catch (error) {
      alert("Error deleting test");
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
          body: JSON.stringify({ ...testForm, courseId, questions: [] }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTests((prev) => [...prev, data.data]);
        setTestDialogOpen(false);
        setTestForm({ title: "", description: "", order: 1 });
      } else {
        alert(data.message || "Failed to create test");
      }
    } catch (error) {
      alert("Error creating test");
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
              Back to Courses
            </Button>
          </div>

          {loading ? (
            <div>Loading...</div>
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
                      Lessons ({lessons.length})
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                      Tests ({tests.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    {activeTab === "lessons" && (
                      <Dialog
                        open={lessonDialogOpen}
                        onOpenChange={setLessonDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>+ New Lesson</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create New Lesson</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateLesson}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="lesson-title">Title</Label>
                              <Input
                                id="lesson-title"
                                placeholder="Lesson title"
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
                              <Label htmlFor="lesson-order">Order</Label>
                              <Input
                                id="lesson-order"
                                type="number"
                                placeholder="Order"
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
                                Content (Markdown)
                              </Label>
                              <Textarea
                                id="lesson-content"
                                placeholder="Lesson content in markdown"
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
                                  ? "Creating..."
                                  : "Create Lesson"}
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
                          <Button>+ New Test</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Test</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateTest}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1">
                              <Label htmlFor="test-title">Title</Label>
                              <Input
                                id="test-title"
                                placeholder="Test title"
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
                              <Label htmlFor="test-order">Order</Label>
                              <Input
                                id="test-order"
                                type="number"
                                placeholder="Order"
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
                              <Label htmlFor="test-description">
                                Description
                              </Label>
                              <Textarea
                                id="test-description"
                                placeholder="Test description"
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
                            <DialogFooter>
                              <Button type="submit" disabled={creatingTest}>
                                {creatingTest ? "Creating..." : "Create Test"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <TabsContent value="lessons">
                  <UniversalDataTable columns={lessonColumns} data={lessons} />
                </TabsContent>

                <TabsContent value="tests">
                  <UniversalDataTable columns={testColumns} data={tests} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div>Course not found</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
