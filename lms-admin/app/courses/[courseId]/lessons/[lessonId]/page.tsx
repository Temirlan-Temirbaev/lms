"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Edit3, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import type { NotionEditorHandle } from "@/components/editors/NotionEditor";

// Dynamically import NotionEditor to avoid SSR issues
const NotionEditor = dynamic(
  () => import("@/components/editors/NotionEditor").then((mod) => mod.default),
  { ssr: false }
);

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LessonViewPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    order: 1,
  });

  const notionEditorRef = useRef<NotionEditorHandle>(null);

  // Fetch lesson and course data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const courseData = await courseRes.json();
        if (courseData.success) setCourse(courseData.data);

        // Fetch lesson details
        const lessonRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const lessonData = await lessonRes.json();
        if (lessonData.success) {
          setLesson(lessonData.data);
          setEditForm({
            title: lessonData.data.title,
            content: lessonData.data.content,
            order: lessonData.data.order,
          });
        }
      } catch (err) {
        setError("Failed to fetch lesson data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, courseId, lessonId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setLesson(data.data);
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update lesson");
      }
    } catch (error) {
      alert("Error updating lesson");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    if (lesson) {
      setEditForm({
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
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
              onClick={() => router.push(`/courses/${courseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к курсу
            </Button>
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : lesson && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{lesson.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Course: {course.title} • Order: {lesson.order}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Урок {lesson.order}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Редактировать урок
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Редактировать урок</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Название</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Название урока"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order">Порядок</Label>
                        <Input
                          id="order"
                          type="number"
                          value={editForm.order}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              order: parseInt(e.target.value),
                            })
                          }
                          placeholder="Порядок"
                        />
                      </div>
                    </div>{" "}
                    <div className="space-y-2">
                      <Label htmlFor="content">Содержание</Label>
                      <div className="border rounded-md overflow-hidden">
                        {" "}
                        <NotionEditor
                          ref={notionEditorRef}
                          content={editForm.content}
                          onChange={(markdown) =>
                            setEditForm({ ...editForm, content: markdown })
                          }
                          placeholder="Начните писать содержание урока..."
                          onTableInsert={() => setShowTableDialog(true)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList>
                    <TabsTrigger
                      value="preview"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Предварительный просмотр
                    </TabsTrigger>
                    <TabsTrigger
                      value="raw"
                      className="flex items-center gap-2"
                    >
                      Исходное содержание
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <Card>
                      <CardHeader>
                        <CardTitle>Содержание урока</CardTitle>
                      </CardHeader>{" "}
                      <CardContent>
                        {lesson.content ? (
                          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 prose-pre:border prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:pl-6 prose-ol:pl-6 prose-li:my-1">
                            {" "}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                // Custom components for better styling
                                h1: ({ children }) => (
                                  <h1 className="text-3xl font-bold text-slate-900 mb-4 mt-6 border-b pb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-2xl font-semibold text-slate-800 mb-3 mt-5">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-xl font-medium text-slate-800 mb-2 mt-4">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-slate-700 mb-3 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-6 mb-3 space-y-1 text-slate-700">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-6 mb-3 space-y-1 text-slate-700">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="ml-0">{children}</li>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 my-4 bg-blue-50 py-2 rounded-r">
                                    {children}
                                  </blockquote>
                                ),
                                code: ({ children, className }) => {
                                  // Check if it's a code block or inline code
                                  const isCodeBlock = /language-(\w+)/.test(
                                    className || ""
                                  );
                                  if (isCodeBlock) {
                                    return (
                                      <code className="block bg-slate-100 border rounded p-3 text-sm font-mono overflow-x-auto text-slate-800">
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  );
                                },
                                pre: ({ children }) => (
                                  <pre className="bg-slate-100 border rounded p-3 mb-3 overflow-x-auto">
                                    {children}
                                  </pre>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-slate-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-slate-700">
                                    {children}
                                  </em>
                                ),
                                a: ({ href, children }) => {
                                  // If it's a dummy link (#), render as underlined text
                                  if (href === "#") {
                                    return (
                                      <span className="underline text-current">
                                        {children}
                                      </span>
                                    );
                                  }
                                  // If the link is an audio file or the text is 'audio', render an audio player
                                  const isAudio =
                                    (typeof children === "string" &&
                                      children
                                        .toLowerCase()
                                        .includes("audio")) ||
                                    /\.(mp3|m4a|ogg|wav|aac)$/i.test(
                                      href || ""
                                    );
                                  if (isAudio) {
                                    return (
                                      <audio controls style={{ width: "100%" }}>
                                        <source src={href} />
                                        Your browser does not support the audio
                                        element.
                                      </audio>
                                    );
                                  }
                                  // Otherwise render as normal link
                                  return (
                                    <a
                                      href={href}
                                      className="text-blue-600 hover:text-blue-800 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {children}
                                    </a>
                                  );
                                },
                                img: ({ src, alt }) => (
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="rounded-lg my-4 max-w-full max-h-64 object-contain mx-auto"
                                  />
                                ),
                                audio: ({ node, ...props }) => (
                                  <audio
                                    controls
                                    style={{ width: "100%" }}
                                    {...props}
                                  >
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                ),
                              }}
                            >
                              {lesson.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No content available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>{" "}
                  <TabsContent value="raw">
                    <Card>
                      <CardHeader>
                        <CardTitle>Raw Markdown Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm font-mono">
                          {lesson.content || "No content available"}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Lesson ID:</span>
                      <p className="text-muted-foreground font-mono">
                        {lesson._id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Course ID:</span>
                      <p className="text-muted-foreground font-mono">
                        {lesson.courseId}
                      </p>
                    </div>
                    {lesson.createdAt && (
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">
                          {new Date(lesson.createdAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {lesson.updatedAt && (
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <p className="text-muted-foreground">
                          {new Date(lesson.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>Lesson not found</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
