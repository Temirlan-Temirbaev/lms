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
    { accessorKey: "title", header: "Атауы" },
    { accessorKey: "level", header: "Деңгей" },
    createActionsColumn<Course>((course) => [
      {
        label: "Өңдеу",
        onClick: () => handleEditCourse(course),
      },
      {
        label: "Жою",
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
        else setError(data.message || "Курстарды жүктеу мүмкін болмады");
      })
      .catch(() => setError("Курстарды жүктеу мүмкін болмады"))
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
    if (!confirm("Бұл курсты жоюға сенімдісіз бе?")) return;

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
        alert("Курсты жою мүмкін болмады");
      }
    } catch (error) {
      alert("Курсты жою кезінде қате");
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
        setFormError(data.message || "Курсты жаңарту мүмкін болмады");
      }
    } catch (error) {
      setFormError("Курсты жаңарту кезінде қате");
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
            <h1 className="text-2xl font-bold">Курстар</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>+ Жаңа курс</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Курс жасау</DialogTitle>
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
                        data.message || "Курс жасау мүмкін болмады"
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
                    <Label htmlFor="course-title">Атауы</Label>
                    <Input
                      id="course-title"
                      placeholder="Атауы"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="course-level">Деңгей</Label>
                    <Select
                      value={form.level}
                      onValueChange={(level) =>
                        setForm((f) => ({ ...f, level }))
                      }
                    >
                      <SelectTrigger id="course-level">
                        <SelectValue placeholder="Деңгей" />
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
                    <Label htmlFor="course-description">Сипаттама</Label>
                    <Textarea
                      id="course-description"
                      placeholder="Сипаттама"
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
                      {creating ? "Жасалуда..." : "Жасау"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Курсты өңдеу</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleUpdateCourse}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-course-title">Атауы</Label>
                    <Input
                      id="edit-course-title"
                      placeholder="Атауы"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-course-level">Деңгей</Label>
                    <Select
                      value={form.level}
                      onValueChange={(level) =>
                        setForm((f) => ({ ...f, level }))
                      }
                    >
                      <SelectTrigger id="edit-course-level">
                        <SelectValue placeholder="Деңгей" />
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
                    <Label htmlFor="edit-course-description">Сипаттама</Label>
                    <Textarea
                      id="edit-course-description"
                      placeholder="Сипаттама"
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
                      {creating ? "Жаңартылуда..." : "Жаңарту"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div>Жүктелуде...</div>
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
