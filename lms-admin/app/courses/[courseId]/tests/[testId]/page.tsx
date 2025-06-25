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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Edit3, Eye, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      } catch (err) {
        setError("Не удалось получить данные теста");
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
        alert(data.message || "Не удалось обновить тест");
      }
    } catch (error) {
      alert("Ошибка при обновлении теста");
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
              Назад к курсу
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
                  <h1 className="text-3xl font-bold">{test.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Курс: {course?.title || "Неизвестно"} • Порядок:{" "}
                    {test?.order || "Н/Д"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Тест {test.order}</Badge>
                    <Badge variant="outline">
                      {course?.level || "Неизвестно"}
                    </Badge>
                    <Badge variant="outline">
                      {test.questions?.length || 0} Вопросов
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
                    Управление вопросами
                  </Button>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Редактировать тест
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Редактировать тест</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Название</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Название теста"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order">Порядок</Label>
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
                          placeholder="Порядок"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Описание теста"
                        rows={6}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passing-score">
                          Проходной балл (%)
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
                          Ограничение времени (минуты)
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
                        Это финальный тест (открывает следующий уровень)
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
                          Описание теста
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.description ? (
                          <div className="whitespace-pre-wrap text-sm">
                            {test.description}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Описание недоступно
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Вопросы ({test.questions?.length || 0})</span>
                          <Button
                            size="sm"
                            onClick={handleManageQuestions}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Добавить вопросы
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
                                    Вопрос {index + 1}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {question.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {typeof question.question === "string"
                                    ? question.question
                                    : "Текст вопроса отсутствует"}
                                </p>
                                {question.points && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.points} баллов
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">
                              Вопросы еще не добавлены
                            </p>
                            <Button onClick={handleManageQuestions}>
                              Добавить первый вопрос
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
                        <CardTitle>Детали теста</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            ID теста
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {test._id}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            ID курса
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {typeof test.course === "string"
                              ? test.course
                              : test.course?._id || "Неизвестно"}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Порядок
                          </Label>
                          <Badge variant="secondary">{test.order}</Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Всего вопросов
                          </Label>
                          <Badge variant="outline">
                            {test.questions?.length || 0}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Проходной балл
                          </Label>
                          <Badge variant="secondary">
                            {test.passingScore}%
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Ограничение времени
                          </Label>
                          <Badge variant="outline">{test.timeLimit} мин</Badge>
                        </div>

                        {test.isFinal && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Тип теста
                            </Label>
                            <Badge variant="destructive">Финальный тест</Badge>
                          </div>
                        )}

                        {test.createdAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Создано
                            </Label>
                            <p className="text-sm">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {test.updatedAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Последнее обновление
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
            <div>Тест не найден</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
