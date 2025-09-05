"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
}

export default function CoursesPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    level: "A1",
    description: "Курс",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const courseColumns: ColumnDef<Course>[] = [
    { accessorKey: "title", header: "Название" },
    { accessorKey: "level", header: "Уровень" },
    createActionsColumn<Course>((course) => [
      {
        label: "Редактировать",
        onClick: () => handleEditCourse(course),
      },
      {
        label: "Удалить",
        onClick: () => handleDeleteCourse(course._id),
        isDanger: true,
        separator: true,
      },
    ]),
  ];

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.data);
        else setError(data.message || "Не удалось загрузить курсы");
      })
      .catch(() => setError("Не удалось загрузить курсы"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      level: course.level,
      description: course.description,
    });
    setEditOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот курс?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      } else {
        alert("Не удалось удалить курс");
      }
    } catch (error) {
      alert("Ошибка при удалении курса");
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${editingCourse._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c._id === editingCourse._id ? data.data : c))
        );
        setEditOpen(false);
        setEditingCourse(null);
        setForm({ title: "", level: "A1", description: "" });
      } else {
        setFormError(data.message || "Не удалось обновить курс");
      }
    } catch (error) {
      setFormError("Ошибка при обновлении курса");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (editOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditOpen(false);
          setEditingCourse(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [editOpen]);

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
            <h1 className="text-2xl font-bold">Курсы</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>+ Новый курс</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать курс</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCreating(true);
                    setFormError("");
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`,
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
                          data.message || "Не удалось создать курс"
                        );
                      setOpen(false);
                      setForm({ title: "", level: "A1", description: "" });
                      // Refresh courses
                      setCourses((prev) => [...prev, data.data]);
                    } catch (err: any) {
                      setFormError(err.message);
                    } finally {
                      setCreating(false);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="course-title">Название</Label>
                    <Input
                      id="course-title"
                      placeholder="Название"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="course-level">Уровень</Label>
                    <Select
                      value={form.level}
                      onValueChange={(level) =>
                        setForm((f) => ({ ...f, level }))
                      }
                    >
                      <SelectTrigger id="course-level">
                        <SelectValue placeholder="Уровень" />
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
                  <div className="flex-col gap-1 hidden">
                    <Label htmlFor="course-description">Описание</Label>
                    <Textarea
                      id="course-description"
                      placeholder="Описание"
                      value={form.description}
                      onChange={(e: any) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
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
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать курс</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleUpdateCourse}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-course-title">Название</Label>
                    <Input
                      id="edit-course-title"
                      placeholder="Название"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-course-level">Уровень</Label>
                    <Select
                      value={form.level}
                      onValueChange={(level) =>
                        setForm((f) => ({ ...f, level }))
                      }
                    >
                      <SelectTrigger id="edit-course-level">
                        <SelectValue placeholder="Уровень" />
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
                  <div className="flex-col gap-1 hidden">
                    <Label htmlFor="edit-course-description">Описание</Label>
                    <Textarea
                      id="edit-course-description"
                      placeholder="Описание"
                      value={form.description}
                      onChange={(e: any) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                  </div>
                  {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Обновление..." : "Обновить"}
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
              columns={courseColumns}
              data={courses}
              onRowClick={(course: Course) =>
                router.push(`/courses/${course._id}`)
              }
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
