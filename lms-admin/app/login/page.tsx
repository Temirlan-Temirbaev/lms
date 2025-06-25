"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, UserCheck, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || "Ошибка входа");
      }
    } catch (err) {
      setError("Произошла непредвиденная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Image src="/logo.png" alt="Qazaqsha" width={48} height={48} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Панель администратора
              </CardTitle>
              <p className="text-gray-600">
                Войдите в систему управления Qazaqsha
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Электронная почта
                </Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Вход...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Войти в систему
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Безопасный доступ</p>
                  <p className="text-blue-700">
                    Только администраторы могут получить доступ к этой панели
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Проверка роли</p>
                <p className="text-green-700">
                  Ваша роль будет проверена после входа в систему
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
