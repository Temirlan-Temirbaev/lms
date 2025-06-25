"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../components/auth-context";
import { Button } from "../../../../../components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Edit3, Eye, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  questions: any[];
  createdAt?: string;
  updatedAt?: string;
}

export default function TestDetailPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // Fetch test and course data
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

        // Fetch test details
        const testRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const testData = await testRes.json();
        if (testData.success) {
          setTest(testData.data);
          setEditForm({
            title: testData.data.title,
            description: testData.data.description,
            order: testData.data.order,
          });
        }
      } catch (err) {
        setError("Failed to fetch test data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, courseId, testId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
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
        setTest(data.data);
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update test");
      }
    } catch (error) {
      alert("Error updating test");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (test) {
      setEditForm({
        title: test.title,
        description: test.description,
        order: test.order,
      });
    }
    setIsEditing(false);
  };

  const handleManageQuestions = () => {
    router.push(`/courses/${courseId}/tests/${testId}/questions`);
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
              Back to Course
            </Button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : test && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{test.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Course: {course.title} • Order: {test.order}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Test {test.order}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge variant="outline">
                      {test.questions?.length || 0} Questions
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleManageQuestions}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Questions
                  </Button>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Test
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Test</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Test title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order">Order</Label>
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
                          placeholder="Order"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Test description"
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Eye className="h-5 w-5 mr-2" />
                          Test Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.description ? (
                          <div className="whitespace-pre-wrap text-sm">
                            {test.description}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No description available
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Questions ({test.questions?.length || 0})</span>
                          <Button
                            size="sm"
                            onClick={handleManageQuestions}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Questions
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.questions && test.questions.length > 0 ? (
                          <div className="space-y-2">
                            {test.questions.map((question, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg bg-gray-50"
                              >
                                <p className="font-medium">
                                  Question {index + 1}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {question.text || "Question text"}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">
                              No questions added yet
                            </p>
                            <Button onClick={handleManageQuestions}>
                              Add First Question
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Test ID
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {test._id}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Course ID
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {test.courseId}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Order
                          </Label>
                          <Badge variant="secondary">{test.order}</Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Total Questions
                          </Label>
                          <Badge variant="outline">
                            {test.questions?.length || 0}
                          </Badge>
                        </div>

                        {test.createdAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Created
                            </Label>
                            <p className="text-sm">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {test.updatedAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Last Updated
                            </Label>
                            <p className="text-sm">
                              {new Date(test.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>Test not found</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
