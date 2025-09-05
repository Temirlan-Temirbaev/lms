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
        setError("Пайдаланушы деректерін алу мүмкін болмады");
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
      console.error("Сабақ мәліметтерін алу мүмкін болмады:", err);
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
      console.error("Тест мәліметтерін алу мүмкін болмады:", err);
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
        alert(data.message || "Пайдаланушыны жаңарту мүмкін болмады");
      }
    } catch (error) {
      alert("Пайдаланушыны жаңарту кезінде қате");
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
              Пайдаланушыларға оралу
            </Button>
          </div>

          {loading ? (
            <div>Жүктелуде...</div>
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
                        ? "Деңгей анықтау тесті өтілген"
                        : "Деңгей анықтау тесті өтілмеген"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Пайдаланушыны өңдеу
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline">
                        Болдырмау
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Сақталуда..." : "Өзгерістерді сақтау"}
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
                          Аяқталған сабақтар
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
                          Аяқталған тесттер
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
                          Орташа ұпай
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
                          Ағымдағы деңгей
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
                    Пайдаланушы туралы ақпарат
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Аты</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Электрондық пошта</Label>
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
                          <Label htmlFor="age">Жасы</Label>
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
                          <Label htmlFor="role">Рөлі</Label>
                          <Select
                            value={editForm.role}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Рөлді таңдаңыз" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пайдаланушы</SelectItem>
                              <SelectItem value="admin">
                          Әкімші
                        </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="level">Ағымдағы деңгей</Label>
                          <Select
                            value={editForm.currentLevel}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, currentLevel: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Деңгейді таңдаңыз" />
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
                          <Label htmlFor="gender">Жынысы</Label>
                          <Select
                            value={editForm.gender}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, gender: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Жынысты таңдаңыз" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Ер</SelectItem>
                        <SelectItem value="female">Әйел</SelectItem>
                        <SelectItem value="other">Басқа</SelectItem>
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
                              Аты:
                            </Label>
                            <p className="text-lg">{user.name || "Көрсетілмеген"}</p>
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
                            {user.telephone || "Көрсетілмеген"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                      Жасы:
                    </Label>
                    <p className="text-lg">{user.age || "Көрсетілмеген"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                              Рөлі:
                            </Label>
                            <p className="text-lg">{user.role}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                              Ағымдағы деңгей:
                            </Label>
                          <p className="text-lg">
                            {user.progress?.currentLevel || "A1"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Жынысы
                          </Label>
                          <p className="text-lg">
                            {user.gender === "male"
                              ? "Ер"
                              : user.gender === "female"
                              ? "Әйел"
                              : user.gender === "other"
                              ? "Басқа"
                              : "Көрсетілмеген"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Деңгей анықтау тесті
                          </Label>
                          <p className="text-lg">
                            {user.progress?.placementTestTaken
                            ? "Өтілген"
                            : "Өтілмеген"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Аяқталған сабақтар
                          </Label>
                          <p className="text-lg">
                            {user.progress?.completedLessons?.length || 0}{" "}
                            сабақ
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Тіркелген күні
                          </Label>
                          <p className="text-lg">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Көрсетілмеген"}
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
                          Аяқталған сабақтар (
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
                  Сабақ мәліметтері жүктелуде...
                </span>
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Реті</TableHead>
                                  <TableHead>Атауы</TableHead>
                                  <TableHead>Курс</TableHead>
                                  <TableHead>Мазмұн алдын ала қарау</TableHead>
                                  <TableHead>Сабақ ID</TableHead>
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
                                          {lesson.title || "Атаусыз сабақ"}
                                        </TableCell>
                                        <TableCell>
                                          {typeof lesson.course === "object"
                                            ? lesson.course?.title
                                            : "Жоқ"}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                          <p className="truncate text-sm text-muted-foreground">
                                            {lesson.content
                                              ? lesson.content.substring(
                                                  0,
                                                  100
                                                ) + "..."
                                              : "Мазмұн жоқ"}
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
                                            Сабақ ID: {lessonId}
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
                          Аяқталған тесттер ({user.progress.completedTests.length}
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
                              Тест мәліметтері жүктелуде...
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Реті</TableHead>
                                  <TableHead>Тест атауы</TableHead>
                                  <TableHead>Курс</TableHead>
                                  <TableHead>Ұпайлар</TableHead>
                                  <TableHead>Сұрақтар</TableHead>
                                  <TableHead>Уақыт шектеуі</TableHead>
                                  <TableHead>Аяқталған күні</TableHead>
                                  <TableHead>Тест түрі</TableHead>
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
                                            {test.order || "Белгісіз"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {test.title || "Атаусыз тест"}
                                        </TableCell>
                                        <TableCell>
                                          {typeof test.course === "object"
                                            ? test.course?.title
                                            : "Белгісіз"}
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
                                              ? "Өтті"
                                              : "Сәтсіз"}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {test.questions?.length || 0}{" "}
                                            сұрақ
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {test.timeLimit || "Белгісіз"} мин
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
                                              ? "Қорытынды"
                                              : "Қарапайым"}
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
                                            <span>Тест ID: {test.testId}</span>
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
                    Деңгейлер бойынша прогресс
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Қол жетімді деңгейлер
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
                        Деңгей анықтау тестінің мәртебесі
                      </p>
                      <Badge
                        variant={
                          user.progress?.placementTestTaken
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.progress?.placementTestTaken
                          ? "Аяқталған"
                          : "Өтілмеген"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>Пайдаланушы табылмады</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
