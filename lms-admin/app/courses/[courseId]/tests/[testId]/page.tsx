"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Save, Edit3, Eye, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Question type translations
const questionTypeTranslations: Record<string, string> = {
  "multiple-choice": "Көп таңдау",
  "matching": "Сәйкестендіру",
  "ordering": "Реттеу",
  "fill-in-blanks": "Бос орындарды толтыру",
  "input": "Мәтін енгізу",
  "categories": "Санаттар",
};

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
  course: string | { _id: string; title: string; level: string };
  questions: any[];
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function TestDetailPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    order: 1,
    passingScore: 70,
    timeLimit: 30,
    isFinal: false,
  });

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
          setEditForm({
            title: testData.data.title,
            description: testData.data.description,
            order: testData.data.order,
            passingScore: testData.data.passingScore || 70,
            timeLimit: testData.data.timeLimit || 30,
            isFinal: testData.data.isFinal || false,
          });
        }
      } catch {
        setError("Тест деректерін алу мүмкін болмады");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, courseId, testId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTest(data.data);
        setIsEditing(false);
      } else {
        alert(data.message || "Тестті жаңарту мүмкін болмады");
      }
    } catch {
      alert("Тестті жаңарту кезінде қате");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (test) {
      setEditForm({
        title: test.title,
        description: test.description,
        order: test.order,
        passingScore: test.passingScore || 70,
        timeLimit: test.timeLimit || 30,
        isFinal: test.isFinal || false,
      });
    }
    setIsEditing(false);
  };

  const handleManageQuestions = () => {
    router.push(`/courses/${courseId}/tests/${testId}/questions`);
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
              onClick={() => router.push(`/courses/${courseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Курсқа оралу
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
                  <h1 className="text-3xl font-bold">{test.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Курс: {course?.title || "Белгісіз"} • Реті:{" "}
                    {test?.order || "Белгісіз"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Тест {test.order}</Badge>
                    <Badge variant="outline">
                      {course?.level || "Белгісіз"}
                    </Badge>
                    <Badge variant="outline">
                      {test.questions?.length || 0} Сұрақ
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleManageQuestions}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Сұрақтарды басқару
                  </Button>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Тестті өңдеу
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Болдырмау
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Сақталуда..." : "Өзгерістерді сақтау"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Тестті өңдеу</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Атауы</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Тест атауы"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order">Реті</Label>
                        <Input
                          id="order"
                          type="number"
                          value={editForm.order}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              order: parseInt(e.target.value),
                            })
                          }
                          placeholder="Реттік нөмір"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Сипаттама</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Тест сипаттамасы"
                        rows={6}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passing-score">
                          Өту балы (%)
                        </Label>
                        <Input
                          id="passing-score"
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.passingScore}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              passingScore: parseInt(e.target.value) || 70,
                            })
                          }
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time-limit">
                          Уақыт шектеуі (минут)
                        </Label>
                        <Input
                          id="time-limit"
                          type="number"
                          min="1"
                          value={editForm.timeLimit}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              timeLimit: parseInt(e.target.value) || 30,
                            })
                          }
                          placeholder="30"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-final"
                        checked={editForm.isFinal}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            isFinal: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="is-final">
                        Бұл қорытынды тест (келесі деңгейді ашады)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Eye className="h-5 w-5 mr-2" />
                          Тест сипаттамасы
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.description ? (
                          <div className="whitespace-pre-wrap text-sm">
                            {test.description}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Сипаттама қолжетімсіз
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Сұрақтар ({test.questions?.length || 0})</span>
                          <Button
                            size="sm"
                            onClick={handleManageQuestions}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Сұрақтар қосу
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.questions && test.questions.length > 0 ? (
                          <div className="space-y-2">
                            {test.questions.map((question, index) => (
                              <div
                                key={question._id || index}
                                className="p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-medium">
                                    Сұрақ {index + 1}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {questionTypeTranslations[question.type] || question.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {typeof question.question === "string"
                                    ? question.question
                                    : "Сұрақ мәтіні жоқ"}
                                </p>
                                {question.points && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.points} ұпай
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">
                              Сұрақтар әлі қосылмаған
                            </p>
                            <Button onClick={handleManageQuestions}>
                              Алғашқы сұрақты қосу
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Тест мәліметтері</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Тест ID
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {test._id}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Курс ID
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {typeof test.course === "string"
                              ? test.course
                              : test.course?._id || "Белгісіз"}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Реті
                          </Label>
                          <Badge variant="secondary">{test.order}</Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Барлық сұрақтар
                          </Label>
                          <Badge variant="outline">
                            {test.questions?.length || 0}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Өту балы
                          </Label>
                          <Badge variant="secondary">
                            {test.passingScore}%
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Уақыт шектеуі
                          </Label>
                          <Badge variant="outline">{test.timeLimit} мин</Badge>
                        </div>

                        {test.isFinal && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Тест түрі
                            </Label>
                            <Badge variant="destructive">Қорытынды тест</Badge>
                          </div>
                        )}

                        {test.createdAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Жасалған күні
                            </Label>
                            <p className="text-sm">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {test.updatedAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Соңғы жаңарту
                            </Label>
                            <p className="text-sm">
                              {new Date(test.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>Тест табылмады</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
