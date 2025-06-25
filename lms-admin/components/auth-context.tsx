"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Only authenticate if user is admin
        if (userData.role === "admin") {
          setIsAuthenticated(true);
          setToken(storedToken);
          setUser(userData);
        } else {
          // Clear non-admin user data
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
        }
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password }),
        }
      );
      const data = await res.json();

      if (res.ok && data.token && data.user) {
        // Check if user is admin
        if (data.user.role !== "admin") {
          return {
            success: false,
            error: "Доступ запрещен. Требуются права администратора.",
          };
        }

        setIsAuthenticated(true);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Неверные учетные данные",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Ошибка сети. Попробуйте еще раз.",
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
