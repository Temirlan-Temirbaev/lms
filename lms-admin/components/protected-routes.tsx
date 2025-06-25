"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

export default function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Small delay to allow auth context to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Allow access to public routes (like login)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-6">
            Вам необходимо войти в систему для доступа к этой странице.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Перейти к входу
          </a>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-4">
            У вас нет прав администратора для доступа к этой панели.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Текущая роль:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {user?.role || "неизвестно"}
            </span>
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти с учетной записью администратора
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role
  return <>{children}</>;
}
