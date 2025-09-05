"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  UniversalDataTable,
  createActionsColumn,
} from "@/components/universal-data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  progress?: {
    currentLevel: string;
    completedLessons: string[];
    completedTests: string[];
    placementTestTaken: boolean;
  };
}

export default function UsersPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "user",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const userColumns: ColumnDef<User>[] = [
    { accessorKey: "email", header: "Email" },
    { accessorKey: "name", header: "Имя" },
    { accessorKey: "role", header: "Роль" },
    {
      accessorKey: "progress.currentLevel",
      header: "Уровень",
      cell: ({ row }) => {
        const level = row.original.progress?.currentLevel;
        return level || "Не определен";
      },
    },
    createActionsColumn<User>((user) => [
      {
        label: "Редактировать",
        onClick: () => router.push(`/users/${user._id}`),
      },
      {
        label: "Удалить",
        onClick: () => handleDeleteUser(user._id),
        isDanger: true,
        separator: true,
      },
    ]),
  ];

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        alert("Не удалось удалить пользователя");
      }
    } catch (error) {
      alert("Ошибка при удалении пользователя");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.data);
        else setError(data.message || "Не удалось загрузить пользователей");
      })
      .catch(() => setError("Не удалось загрузить пользователей"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Пользователи</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                  + Новый пользователь
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать пользователя</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCreating(true);
                    setFormError("");
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify(form),
                        }
                      );
                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(
                          data.message || "Не удалось создать пользователя"
                        );
                      setOpen(false);
                      setForm({
                        email: "",
                        name: "",
                        role: "user",
                        password: "",
                      });
                      // Refresh users
                      setUsers((prev) => [...prev, data.data]);
                    } catch (err: any) {
                      setFormError(err.message);
                    } finally {
                      setCreating(false);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="user-name">Имя</Label>
                    <Input
                      id="user-name"
                      placeholder="Имя"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="user-password">Пароль</Label>
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Пароль"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="user-role">Роль</Label>
                    <Select
                      value={form.role}
                      onValueChange={(role) => setForm((f) => ({ ...f, role }))}
                    >
                      <SelectTrigger id="user-role">
                        <SelectValue placeholder="Роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Создание..." : "Создать"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <UniversalDataTable
              columns={userColumns}
              data={users}
              onRowClick={(user: User) => router.push(`/users/${user._id}`)}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
