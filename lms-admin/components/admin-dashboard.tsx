"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react";

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    regular: number;
    recentlyJoined: number;
  };
  courses: {
    total: number;
    byLevel: Record<string, number>;
  };
  lessons: {
    total: number;
    completed: number;
  };
  tests: {
    total: number;
    completed: number;
    averageScore: number;
  };
  placementTests: {
    taken: number;
    notTaken: number;
  };
}

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch users
        const usersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch courses
        const coursesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!usersRes.ok || !coursesRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();

        const users = usersData.data || [];
        const courses = coursesData.data || [];

        // Calculate user statistics
        const userStats = {
          total: users.length,
          admins: users.filter((u: any) => u.role === "admin").length,
          regular: users.filter((u: any) => u.role !== "admin").length,
          recentlyJoined: users.filter((u: any) => {
            const joinDate = new Date(u.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return joinDate > weekAgo;
          }).length,
        };

        // Calculate course statistics by level
        const coursesByLevel = courses.reduce(
          (acc: Record<string, number>, course: any) => {
            const level = course.level || "Unknown";
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {}
        );

        // Calculate lesson and test statistics
        let totalLessons = 0;
        let totalTests = 0;
        let completedLessons = 0;
        let completedTests = 0;
        let totalTestScores = 0;
        let testCompletions = 0;

        users.forEach((user: any) => {
          if (user.progress) {
            completedLessons += user.progress.completedLessons?.length || 0;
            const userCompletedTests =
              user.progress.completedTests?.length || 0;
            completedTests += userCompletedTests;

            user.progress.completedTests?.forEach((test: any) => {
              if (test.score !== undefined) {
                totalTestScores += test.score;
                testCompletions++;
              }
            });
          }
        });

        // Count lessons and tests from courses
        courses.forEach((course: any) => {
          totalLessons += course.lessonCount || 0;
          totalTests += course.testCount || 0;
        });

        // Calculate placement test statistics
        const placementTestStats = {
          taken: users.filter((u: any) => u.progress?.placementTestTaken)
            .length,
          notTaken: users.filter((u: any) => !u.progress?.placementTestTaken)
            .length,
        };

        setStats({
          users: userStats,
          courses: {
            total: courses.length,
            byLevel: coursesByLevel,
          },
          lessons: {
            total: totalLessons,
            completed: completedLessons,
          },
          tests: {
            total: totalTests,
            completed: completedTests,
            averageScore:
              testCompletions > 0
                ? Math.round(totalTestScores / testCompletions)
                : 0,
          },
          placementTests: placementTestStats,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить статистику"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Статистика пользователей
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего пользователей
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                Все зарегистрированные пользователи
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Администраторы
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.admins}</div>
              <p className="text-xs text-muted-foreground">
                Администраторы системы
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Обычные пользователи
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.regular}</div>
              <p className="text-xs text-muted-foreground">
                Изучающие пользователи
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Новые на этой неделе
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.users.recentlyJoined}
              </div>
              <p className="text-xs text-muted-foreground">
                Недавно присоединились
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-green-600" />
          Статистика контента
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего курсов
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses.total}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(stats.courses.byLevel).map(([level, count]) => (
                  <Badge key={level} variant="outline" className="text-xs">
                    {level}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего уроков
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lessons.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.lessons.completed} завершений
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего тестов
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tests.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tests.completed} попыток
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Средний балл
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.tests.averageScore}%
              </div>
              <p className="text-xs text-muted-foreground">Результаты тестов</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Placement Test Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          Статус тестов определения уровня
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Тесты пройдены
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.placementTests.taken}
              </div>
              <p className="text-xs text-muted-foreground">
                Пользователи прошли тест определения уровня
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Тесты ожидают
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.placementTests.notTaken}
              </div>
              <p className="text-xs text-muted-foreground">
                Пользователи должны пройти тест определения уровня
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
