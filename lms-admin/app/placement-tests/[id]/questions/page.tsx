"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  UniversalDataTable,
  createActionsColumn,
} from "@/components/universal-data-table";
import { ColumnDef } from "@tanstack/react-table";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";


interface Question {
  _id?: string;
  question: string;
  type: "multiple-choice";
  content?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  level: "beginner" | "intermediate" | "advanced";
}

interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  createdAt?: string;
  updatedAt?: string;
}

// These will be moved inside the component to access t() function

export default function PlacementTestQuestionsPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const placementTestId = params.id as string;

  const [placementTest, setPlacementTest] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const QUESTION_TYPES = [
    { value: "multiple-choice", label: "Көп нұсқалы" },
  ];

  const QUESTION_LEVELS = [
    { value: "beginner", label: "Бастапқы" },
    { value: "intermediate", label: "Орташа" },
    { value: "advanced", label: "Жоғары" },
  ];

  // Function to render question content preview
  const renderContentPreview = (content?: string) => {
    if (!content) return <span className="text-muted-foreground italic">Мазмұн жоқ</span>;
    
    // Strip HTML tags and limit length for preview
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
    const preview = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    
    return (
      <div className="max-w-xs">
        <span className="text-sm text-muted-foreground">{preview}</span>
      </div>
    );
  };

  // Question columns for table
  const questionColumns: ColumnDef<Question>[] = [
    {
      accessorKey: "type",
      header: "Түрі",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("type") === "multiple-choice" ? "Көп нұсқалы" : row.getValue("type")}
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
      header: "Ұпай",
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

  // Fetch placement test data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchPlacementTest = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setPlacementTest(data.data);
        } else {
          setError(data.message || "Орналастыру тестін жүктеу қатесі");
        }
      } catch (error) {
        console.error("Error fetching placement test:", error);
        setError("Орналастыру тестін жүктеу қатесі");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementTest();
  }, [isAuthenticated, token, placementTestId]);

  const handleEditQuestion = (question: Question) => {
    // Find the index of this question in the array
    const questionIndex = placementTest?.questions.findIndex(
      (q) =>
        (q._id && q._id === question._id) ||
        (q.question === question.question && q.type === question.type)
    );

    router.push(
      `/placement-tests/${placementTestId}/questions/${questionIndex}`
    );
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm("Сұрақты жоюды растайсыз ба?")) return;

    if (!placementTest) return;

    // Find the index of this question in the array
    const questionIndex = placementTest.questions.findIndex(
      (q) =>
        (q._id && q._id === question._id) ||
        (q.question === question.question && q.type === question.type)
    );

    if (questionIndex === -1) {
      alert("Сұрақ табылмады");
      return;
    }

    const updatedQuestions = placementTest.questions.filter(
      (_, index) => index !== questionIndex
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...placementTest,
            questions: updatedQuestions,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPlacementTest({ ...placementTest, questions: updatedQuestions });
      } else {
        alert(data.message || "Сұрақты жою қатесі");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Сұрақты жою қатесі");
    }
  };

  const handleCreateQuestion = () => {
    router.push(`/placement-tests/${placementTestId}/questions/new`);
  };

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
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/placement-tests/${placementTestId}`)
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
          ) : placementTest ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Сұрақтарды басқару</h1>
                  <p className="text-muted-foreground mt-1">
                    Тақырып: {placementTest.title}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {placementTest.questions?.length || 0} сұрақ
                    </Badge>
                    <Badge variant="outline">
                      {placementTest.timeLimit} минут
                    </Badge>
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
                    data={placementTest.questions || []}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>Орналастыру тесті табылмады</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}