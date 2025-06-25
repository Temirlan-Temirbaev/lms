"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Save, Edit3, Plus, Trash2, Eye } from "lucide-react";
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
  { value: "multiple-choice", label: "Множественный выбор" },
  { value: "matching", label: "Сопоставление" },
  { value: "ordering", label: "Упорядочивание" },
  { value: "fill-in-blanks", label: "Заполнить пропуски" },
  { value: "input", label: "Текстовый ввод" },
  { value: "categories", label: "Категории" },
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
  const [saving, setSaving] = useState(false);

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
      header: "Вопрос",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("question")}</div>
      ),
    },
    {
      accessorKey: "points",
      header: "Баллы",
    },
    createActionsColumn<Question>((question) => [
      {
        label: "Редактировать",
        onClick: () => handleEditQuestion(question),
      },
      {
        label: "Удалить",
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
      } catch (err) {
        setError("Не удалось загрузить данные теста");
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
    if (!confirm("Вы уверены, что хотите удалить этот вопрос?")) return;

    if (!test) return;

    // Find the index of this question in the array
    const questionIndex = test.questions.findIndex(
      (q) =>
        (q._id && q._id === question._id) ||
        (q.question === question.question && q.type === question.type)
    );

    if (questionIndex === -1) {
      alert("Вопрос не найден");
      return;
    }

    const updatedQuestions = test.questions.filter(
      (_, index) => index !== questionIndex
    );

    try {
      setSaving(true);
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
        alert(data.message || "Не удалось удалить вопрос");
      }
    } catch (error) {
      alert("Ошибка при удалении вопроса");
    } finally {
      setSaving(false);
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
              Назад к тесту
            </Button>
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : test && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Управление вопросами</h1>
                  <p className="text-muted-foreground mt-1">
                    Тест: {test.title} • Курс: {course.title}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {test.questions?.length || 0} Вопросов
                    </Badge>
                    <Badge variant="outline">
                      {test.passingScore}% Проходной балл
                    </Badge>
                    <Badge variant="outline">{test.timeLimit} мин</Badge>
                  </div>
                </div>
                <Button
                  onClick={handleCreateQuestion}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить вопрос
                </Button>
              </div>

              {/* Questions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Вопросы</CardTitle>
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
            <div>Тест не найден</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
