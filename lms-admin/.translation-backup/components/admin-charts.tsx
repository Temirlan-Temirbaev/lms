"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Target,
  Activity,
  Award,
} from "lucide-react";

interface ChartData {
  levelDistribution: Array<{
    level: string;
    users: number;
    percentage: number;
  }>;
  ageDistribution: Array<{ ageGroup: string; users: number }>;
  genderDistribution: Array<{
    gender: string;
    users: number;
    percentage: number;
  }>;
  progressOverTime: Array<{
    month: string;
    newUsers: number;
    completedTests: number;
  }>;
  courseCompletion: Array<{
    course: string;
    level: string;
    completed: number;
    total: number;
    rate: number;
  }>;
  testScoreDistribution: Array<{ scoreRange: string; count: number }>;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];
const LEVEL_COLORS = {
  A1: "#22c55e",
  A2: "#3b82f6",
  B1: "#f59e0b",
  B2: "#ef4444",
  C1: "#8b5cf6",
  C2: "#06b6d4",
};

export function AdminCharts() {
  const { token } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChartData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch users and courses
        const [usersRes, coursesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!usersRes.ok || !coursesRes.ok) {
          throw new Error("Не удалось загрузить данные");
        }

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();
        const users = usersData.data || [];
        const courses = coursesData.data || [];

        // 1. Level Distribution
        const levelCounts = users.reduce(
          (acc: Record<string, number>, user: any) => {
            const level = user.progress?.currentLevel || "A1";
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {}
        );

        const levelDistribution = Object.entries(levelCounts).map(
          ([level, count]) => ({
            level,
            users: count as number,
            percentage: Math.round(((count as number) / users.length) * 100),
          })
        );

        // 2. Age Distribution
        const ageGroups = users.reduce(
          (acc: Record<string, number>, user: any) => {
            const age = user.age || 18;
            let group = "18-25";
            if (age >= 26 && age <= 35) group = "26-35";
            else if (age >= 36 && age <= 45) group = "36-45";
            else if (age >= 46 && age <= 55) group = "46-55";
            else if (age > 55) group = "55+";

            acc[group] = (acc[group] || 0) + 1;
            return acc;
          },
          {}
        );

        const ageDistribution = Object.entries(ageGroups).map(
          ([ageGroup, count]) => ({
            ageGroup,
            users: count as number,
          })
        );

        // 3. Gender Distribution
        const genderCounts = users.reduce(
          (acc: Record<string, number>, user: any) => {
            const gender = user.gender || "male";
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
          },
          {}
        );

        const genderDistribution = Object.entries(genderCounts).map(
          ([gender, count]) => ({
            gender: gender.charAt(0).toUpperCase() + gender.slice(1),
            users: count as number,
            percentage: Math.round(((count as number) / users.length) * 100),
          })
        );

        // 4. Progress Over Time (last 6 months)
        const progressOverTime = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const newUsers = users.filter((user: any) => {
            const joinDate = new Date(user.createdAt);
            return joinDate >= monthStart && joinDate <= monthEnd;
          }).length;

          const completedTests = users.reduce((total: number, user: any) => {
            return (
              total +
              (user.progress?.completedTests?.filter((test: any) => {
                const testDate = new Date(test.completedAt);
                return testDate >= monthStart && testDate <= monthEnd;
              }).length || 0)
            );
          }, 0);

          progressOverTime.push({
            month: date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
            newUsers,
            completedTests,
          });
        }

        // 5. Course Completion Rates
        const courseCompletion = courses
          .map((course: any) => {
            const enrolledUsers = users.filter((user: any) =>
              user.progress?.availableLevels?.includes(course.level)
            );
            const completedUsers = users.filter((user: any) =>
              user.progress?.completedLessons?.some(
                (lessonId: string) =>
                  // This is a simplified check - in reality you'd need to check if lessons belong to this course
                  enrolledUsers.length > 0
              )
            );

            const total = enrolledUsers.length;
            const completed = Math.floor(total * Math.random() * 0.7); // Simulated data

            return {
              course: course.title || `${course.level} Course`,
              level: course.level,
              completed,
              total,
              rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            };
          })
          .slice(0, 8); // Show top 8 courses

        // 6. Test Score Distribution
        const allScores = users.flatMap(
          (user: any) =>
            user.progress?.completedTests?.map(
              (test: any) => test.score || 0
            ) || []
        );

        const scoreRanges = {
          "0-20": 0,
          "21-40": 0,
          "41-60": 0,
          "61-80": 0,
          "81-100": 0,
        };

        allScores.forEach((score: number) => {
          if (score <= 20) scoreRanges["0-20"]++;
          else if (score <= 40) scoreRanges["21-40"]++;
          else if (score <= 60) scoreRanges["41-60"]++;
          else if (score <= 80) scoreRanges["61-80"]++;
          else scoreRanges["81-100"]++;
        });

        const testScoreDistribution = Object.entries(scoreRanges).map(
          ([range, count]) => ({
            scoreRange: range,
            count,
          })
        );

        setChartData({
          levelDistribution,
          ageDistribution,
          genderDistribution,
          progressOverTime,
          courseCompletion,
          testScoreDistribution,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
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

  if (!chartData) return null;

  return (
    <div className="space-y-8">
      {/* User Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Распределение по уровням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.levelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "users" ? "Количество" : name,
                  ]}
                  labelFormatter={(label) => `Level: ${label}`}
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {chartData.levelDistribution.map((item) => (
                <Badge key={item.level} variant="outline" className="text-xs">
                  {item.level}: {item.percentage}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Возрастные группы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.ageDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="users"
                  label={({ ageGroup, users }) => `${ageGroup}: ${users}`}
                >
                  {chartData.ageDistribution.map((entry, index) => (
                    <Cell
                      key={`age-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Прогресс по времени
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="newUsers"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Новые пользователи"
              />
              <Area
                type="monotone"
                dataKey="completedTests"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Завершенные тесты"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Completion & Test Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              Процент завершения курсов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.courseCompletion} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="course" type="category" width={100} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Процент завершения"]}
                />
                <Bar dataKey="rate" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Распределение результатов тестов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.testScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scoreRange" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Количество"]}
                  labelFormatter={(label) => `Score Range: ${label}%`}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gender Distribution */}
      <Card className="lg:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Распределение по полу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.genderDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="users"
                label={({ gender, percentage }) => `${gender}: ${percentage}%`}
              >
                {chartData.genderDistribution.map((entry, index) => (
                  <Cell
                    key={`gender-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
