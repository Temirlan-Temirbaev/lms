"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  UniversalDataTable,
  createActionsColumn,
} from "@/components/universal-data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  order: number;
  course: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
}

interface Question {
  _id?: string;
  type:
    | "multiple-choice"
    | "matching"
    | "ordering"
    | "fill-in-blanks"
    | "input"
    | "categories";
  question: string;
  content?: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  points: number;
}

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Көп таңдау" },
  { value: "matching", label: "Сәйкестендіру" },
    { value: "ordering", label: "Реттеу" },
  { value: "fill-in-blanks", label: "Бос орындарды толтыру" },
    { value: "input", label: "Мәтін енгізу" },
  { value: "categories", label: "Санаттар" },
];

export default function QuestionsManagementPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Question columns for table
  const questionColumns: ColumnDef<Question>[] = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => (
        <Badge variant="outline">
          {QUESTION_TYPES.find((t) => t.value === row.getValue("type"))?.label}
        </Badge>
      ),
    },
    {
      accessorKey: "question",
      header: "Сұрақ",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("question")}</div>
      ),
    },
    {
      accessorKey: "points",
      header: "Ұпайлар",
    },
    createActionsColumn<Question>((question) => [
      {
        label: "Өңдеу",
        onClick: () => handleEditQuestion(question),
      },
      {
        label: "Жою",
        onClick: () => handleDeleteQuestion(question),
        isDanger: true,
        separator: true,
      },
    ]),
  ];

  // Fetch test and course data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
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

        // Fetch test details
        const testRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const testData = await testRes.json();
        if (testData.success) {
          setTest(testData.data);
        }
      } catch {
        setError("Тест деректерін жүктеу мүмкін болмады");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, courseId, testId]);

  const handleEditQuestion = (question: Question) => {
    // Find the index of this question in the array
    const questionIndex = test?.questions.findIndex(
      (q) =>
        (q._id && q._id === question._id) ||
        (q.question === question.question && q.type === question.type)
    );

    router.push(
      `/courses/${courseId}/tests/${testId}/questions/${questionIndex}`
    );
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm("Бұл сұрақты жойғыңыз келетініне сенімдісіз бе?")) return;

    if (!test) return;

    // Find the index of this question in the array
    const questionIndex = test.questions.findIndex(
      (q) =>
        (q._id && q._id === question._id) ||
        (q.question === question.question && q.type === question.type)
    );

    if (questionIndex === -1) {
      alert("Сұрақ табылмады");
      return;
    }

    const updatedQuestions = test.questions.filter(
      (_, index) => index !== questionIndex
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questions: updatedQuestions }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setTest({ ...test, questions: updatedQuestions });
      } else {
        alert(data.message || "Сұрақты жою мүмкін болмады");
      }
    } catch {
      alert("Сұрақты жою кезінде қате");
    }
  };

  const handleCreateQuestion = () => {
    router.push(`/courses/${courseId}/tests/${testId}/questions/new`);
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
              onClick={() =>
                router.push(`/courses/${courseId}/tests/${testId}`)
              }
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Тестке оралу
            </Button>
          </div>

          {loading ? (
            <div>Жүктелуде...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : test && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Сұрақтарды басқару</h1>
                  <p className="text-muted-foreground mt-1">
                    Тест: {test.title} • Курс: {course.title}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {test.questions?.length || 0} Сұрақ
                    </Badge>
                    <Badge variant="outline">
                      {test.passingScore}% Өту балы
                    </Badge>
                    <Badge variant="outline">{test.timeLimit} мин</Badge>
                  </div>
                </div>
                <Button
                  onClick={handleCreateQuestion}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Сұрақ қосу
                </Button>
              </div>

              {/* Questions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Сұрақтар</CardTitle>
                </CardHeader>
                <CardContent>
                  <UniversalDataTable
                    columns={questionColumns}
                    data={test.questions || []}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>Тест табылмады</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
