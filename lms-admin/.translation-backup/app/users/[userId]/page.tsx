"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  ArrowLeft,
  Save,
  Edit3,
  User,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  progress: {
    currentLevel: string;
    availableLevels: string[];
    completedLessons: string[];
    completedTests: any[];
    placementTestTaken: boolean;
  };
  telephone?: string;
  gender?: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserDetailPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCompletedLessons, setShowCompletedLessons] = useState(false);
  const [showCompletedTests, setShowCompletedTests] = useState(false);
  const [lessonDetails, setLessonDetails] = useState<any[]>([]);
  const [testDetails, setTestDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    currentLevel: "",
    telephone: "",
    gender: "",
    age: 18,
  });

  // Fetch user data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.data);
          setEditForm({
            name: userData.data.name || "",
            email: userData.data.email || "",
            role: userData.data.role || "user",
            currentLevel: userData.data.progress?.currentLevel || "A1",
            telephone: userData.data.telephone || "",
            gender: userData.data.gender || "male",
            age: userData.data.age || 18,
          });
        }
      } catch (err) {
        setError("Не удалось получить данные пользователя");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, token, userId]);

  // Fetch lesson details
  const fetchLessonDetails = async () => {
    if (!user?.progress?.completedLessons?.length) return;

    setLoadingDetails(true);
    try {
      const lessonPromises = user.progress.completedLessons.map(
        async (lessonId) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.success ? data.data : null;
          }
          return null;
        }
      );

      const lessons = await Promise.all(lessonPromises);
      setLessonDetails(lessons.filter((lesson) => lesson !== null));
    } catch (err) {
      console.error("Не удалось получить детали уроков:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch test details
  const fetchTestDetails = async () => {
    if (!user?.progress?.completedTests?.length) return;

    setLoadingDetails(true);
    try {
      const testPromises = user.progress.completedTests.map(
        async (completedTest) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${completedTest.testId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.success ? { ...data.data, ...completedTest } : null;
          }
          return null;
        }
      );

      const tests = await Promise.all(testPromises);
      setTestDetails(tests.filter((test) => test !== null));
    } catch (err) {
      console.error("Не удалось получить детали тестов:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Transform the form data to match the User model structure
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        telephone: editForm.telephone,
        gender: editForm.gender,
        age: editForm.age,
        progress: {
          ...user?.progress,
          currentLevel: editForm.currentLevel,
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUser(data.data);
        setIsEditing(false);
      } else {
        alert(data.message || "Не удалось обновить пользователя");
      }
    } catch (error) {
      alert("Ошибка при обновлении пользователя");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        currentLevel: user.progress?.currentLevel || "A1",
        telephone: user.telephone || "",
        gender: user.gender || "male",
        age: user.age || 18,
      });
    }
    setIsEditing(false);
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
              onClick={() => router.push(`/users`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к пользователям
            </Button>
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : user ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground mt-1">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        user.role === "admin" ? "destructive" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                    <Badge variant="outline">
                      {user.progress?.currentLevel || "A1"}
                    </Badge>
                    <Badge
                      variant={
                        user.progress?.placementTestTaken
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.progress?.placementTestTaken
                        ? "Тест определения уровня пройден"
                        : "Тест определения уровня не пройден"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Редактировать пользователя
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline">
                        Отмена
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Завершенные уроки
                        </p>
                        <p className="text-2xl font-bold">
                          {user.progress?.completedLessons?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Завершенные тесты
                        </p>
                        <p className="text-2xl font-bold">
                          {user.progress?.completedTests?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Средний балл
                        </p>
                        <p className="text-2xl font-bold">
                          {user.progress?.completedTests?.length > 0
                            ? Math.round(
                                user.progress.completedTests.reduce(
                                  (acc, test) => acc + test.score,
                                  0
                                ) / user.progress.completedTests.length
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Текущий уровень
                        </p>
                        <p className="text-2xl font-bold">
                          {user.progress?.currentLevel || "A1"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Информация о пользователе
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Имя</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telephone">Телефон</Label>
                          <Input
                            id="telephone"
                            value={editForm.telephone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                telephone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Возраст</Label>
                          <Input
                            id="age"
                            type="number"
                            min="1"
                            max="120"
                            value={editForm.age}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                age: parseInt(e.target.value) || 18,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="role">Роль</Label>
                          <Select
                            value={editForm.role}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите роль" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="admin">
                                Администратор
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="level">Текущий уровень</Label>
                          <Select
                            value={editForm.currentLevel}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, currentLevel: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите уровень" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A1">A1</SelectItem>
                              <SelectItem value="A2">A2</SelectItem>
                              <SelectItem value="B1">B1</SelectItem>
                              <SelectItem value="B2">B2</SelectItem>
                              <SelectItem value="C1">C1</SelectItem>
                              <SelectItem value="C2">C2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="gender">Пол</Label>
                          <Select
                            value={editForm.gender}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, gender: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите пол" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Мужской</SelectItem>
                              <SelectItem value="female">Женский</SelectItem>
                              <SelectItem value="other">Другой</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Имя
                          </Label>
                          <p className="text-lg">{user.name || "Не указано"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Email
                          </Label>
                          <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Телефон
                          </Label>
                          <p className="text-lg">
                            {user.telephone || "Не указано"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Возраст
                          </Label>
                          <p className="text-lg">{user.age || "Не указано"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Роль
                          </Label>
                          <p className="text-lg">{user.role}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Текущий уровень
                          </Label>
                          <p className="text-lg">
                            {user.progress?.currentLevel || "A1"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Пол
                          </Label>
                          <p className="text-lg">
                            {user.gender || "Не указано"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Тест определения уровня
                          </Label>
                          <p className="text-lg">
                            {user.progress?.placementTestTaken
                              ? "Пройден"
                              : "Не пройден"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Завершенные уроки
                          </Label>
                          <p className="text-lg">
                            {user.progress?.completedLessons?.length || 0}{" "}
                            уроков
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Дата создания
                          </Label>
                          <p className="text-lg">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Н/Д"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Lessons */}
              {user.progress?.completedLessons &&
                user.progress.completedLessons.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto"
                        onClick={() => {
                          setShowCompletedLessons(!showCompletedLessons);
                          if (
                            !showCompletedLessons &&
                            lessonDetails.length === 0
                          ) {
                            fetchLessonDetails();
                          }
                        }}
                      >
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Completed Lessons (
                          {user.progress.completedLessons.length})
                        </CardTitle>
                        {showCompletedLessons ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    {showCompletedLessons && (
                      <CardContent>
                        {loadingDetails ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">
                              Loading lesson details...
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Order</TableHead>
                                  <TableHead>Title</TableHead>
                                  <TableHead>Course</TableHead>
                                  <TableHead>Content Preview</TableHead>
                                  <TableHead>Lesson ID</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {lessonDetails.length > 0 ? (
                                  lessonDetails
                                    .sort(
                                      (a, b) => (a.order || 0) - (b.order || 0)
                                    )
                                    .map((lesson, index) => (
                                      <TableRow key={lesson._id || index}>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {lesson.order || "N/A"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {lesson.title || "Untitled Lesson"}
                                        </TableCell>
                                        <TableCell>
                                          {typeof lesson.course === "object"
                                            ? lesson.course?.title
                                            : "N/A"}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                          <p className="truncate text-sm text-muted-foreground">
                                            {lesson.content
                                              ? lesson.content.substring(
                                                  0,
                                                  100
                                                ) + "..."
                                              : "No content"}
                                          </p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {lesson._id}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      {user.progress.completedLessons.map(
                                        (lessonId, index) => (
                                          <div key={index} className="mb-2">
                                            Lesson ID: {lessonId}
                                          </div>
                                        )
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )}

              {/* Completed Tests */}
              {user.progress?.completedTests &&
                user.progress.completedTests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto"
                        onClick={() => {
                          setShowCompletedTests(!showCompletedTests);
                          if (!showCompletedTests && testDetails.length === 0) {
                            fetchTestDetails();
                          }
                        }}
                      >
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Completed Tests ({user.progress.completedTests.length}
                          )
                        </CardTitle>
                        {showCompletedTests ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    {showCompletedTests && (
                      <CardContent>
                        {loadingDetails ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">
                              Загрузка деталей теста...
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Порядок</TableHead>
                                  <TableHead>Название теста</TableHead>
                                  <TableHead>Курс</TableHead>
                                  <TableHead>Баллы</TableHead>
                                  <TableHead>Вопросы</TableHead>
                                  <TableHead>Ограничение времени</TableHead>
                                  <TableHead>Дата завершения</TableHead>
                                  <TableHead>Тип теста</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {testDetails.length > 0 ? (
                                  testDetails
                                    .sort(
                                      (a, b) =>
                                        new Date(b.completedAt).getTime() -
                                        new Date(a.completedAt).getTime()
                                    )
                                    .map((test, index) => (
                                      <TableRow key={test._id || index}>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {test.order || "Н/Д"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {test.title || "Тест без названия"}
                                        </TableCell>
                                        <TableCell>
                                          {typeof test.course === "object"
                                            ? test.course?.title
                                            : "Н/Д"}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              test.score >= 70
                                                ? "default"
                                                : test.score >= 50
                                                ? "secondary"
                                                : "destructive"
                                            }
                                          >
                                            {Math.round(test.score)}%
                                          </Badge>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {test.score >=
                                            (test.passingScore || 70)
                                              ? "Сдан"
                                              : "Не сдан"}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {test.questions?.length || 0}{" "}
                                            вопросов
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {test.timeLimit || "Н/Д"} мин
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {new Date(
                                            test.completedAt
                                          ).toLocaleDateString()}
                                          <div className="text-xs text-muted-foreground">
                                            {new Date(
                                              test.completedAt
                                            ).toLocaleTimeString()}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              test.isFinal
                                                ? "destructive"
                                                : "secondary"
                                            }
                                          >
                                            {test.isFinal
                                              ? "Финальный"
                                              : "Обычный"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={8}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      {user.progress.completedTests.map(
                                        (test, index) => (
                                          <div
                                            key={index}
                                            className="mb-2 flex justify-between items-center max-w-md mx-auto"
                                          >
                                            <span>ID теста: {test.testId}</span>
                                            <Badge
                                              variant={
                                                test.score >= 70
                                                  ? "default"
                                                  : "destructive"
                                              }
                                            >
                                              {Math.round(test.score)}%
                                            </Badge>
                                            <span className="text-xs">
                                              {new Date(
                                                test.completedAt
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )}

              {/* Available Levels Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Прогресс по уровням
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Доступные уровни
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {(user.progress?.availableLevels || ["A1"]).map(
                          (level) => (
                            <Badge
                              key={level}
                              variant={
                                level === user.progress?.currentLevel
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {level}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Тест определения уровня
                      </p>
                      <Badge
                        variant={
                          user.progress?.placementTestTaken
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.progress?.placementTestTaken
                          ? "Завершен"
                          : "Не пройден"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>Пользователь не найден</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
