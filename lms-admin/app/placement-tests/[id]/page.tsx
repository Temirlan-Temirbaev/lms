"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Edit3, Eye, Settings, Edit, Trash2, FileText } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Question {
  _id?: string;
  question: string;
  type: "multiple-choice";
  content?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  level: "beginner" | "intermediate" | "advanced";
}

interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

interface PlacementTestFormData {
  title: string;
  description: string;
  timeLimit: number;
}

export default function PlacementTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated } = useAuth();

  const placementTestId = params.id as string;
  
  const [placementTest, setPlacementTest] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PlacementTestFormData>({
    title: "",
    description: "",
    timeLimit: 60
  });

  const fetchPlacementTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Migrate questions if needed
        const migratedData = await migrateQuestionsWithLevel(result.data);
        setPlacementTest(migratedData);
        setFormData({
          title: migratedData.title,
          description: migratedData.description,
          timeLimit: migratedData.timeLimit
        });
      } else {
        setError('Тестті жүктеу кезінде қате орын алды');
      }
    } catch (error) {
      console.error("Деңгей анықтау тестін жүктеу кезінде қате:", error);
      setError('Орналастыру тестін алу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PlacementTestFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Тест атауын енгізіңіз');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setPlacementTest(result.data);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`Тест құру кезінде қате орын алды: ${error.message}`);
      }
    } catch (error) {
      console.error("Деңгей анықтау тестін жаңарту кезінде қате:", error);
      alert('Тест құру сәтсіз аяқталды');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (placementTest) {
      setFormData({
        title: placementTest.title,
        description: placementTest.description,
        timeLimit: placementTest.timeLimit
      });
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    router.push("/placement-tests");
  };

  // Function to render question content
  const renderQuestionContent = (content?: string) => {
    if (!content) return null;
    
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: "200px" }}
              />
            ),
            audio: ({ node, ...props }) => (
              <audio
                {...props}
                controls
                className="w-full max-w-md"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Migration function to add missing level fields to existing questions
  const migrateQuestionsWithLevel = async (placementTestData: PlacementTest) => {
    const needsMigration = placementTestData.questions.some(q => !q.level);
    
    if (needsMigration) {
      const migratedQuestions = placementTestData.questions.map(q => ({
        ...q,
        level: q.level || "A1" as "A1" | "A2" | "B1" | "B2"
      }));
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...placementTestData,
            questions: migratedQuestions
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          return result.data;
        }
      } catch (error) {
        console.error("Сұрақтарды көшіру кезінде қате:", error);
      }
    }
    
    return placementTestData;
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetchPlacementTest();
  }, [isAuthenticated, token, placementTestId]);

  const handleAddQuestion = () => {
    // Navigate to new question page
    router.push(`/placement-tests/${placementTestId}/questions/new`);
  };

  const handleEditQuestion = (question: Question, index: number) => {
    // Navigate to individual question page
    router.push(`/placement-tests/${placementTestId}/questions/${index}`);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !placementTest) return;

    const updatedQuestions = [...placementTest.questions];
    const questionIndex = editingQuestion._id ? parseInt(editingQuestion._id) : -1;

    if (questionIndex >= 0) {
      updatedQuestions[questionIndex] = editingQuestion;
    } else {
      updatedQuestions.push(editingQuestion);
    }

    setPlacementTest({ ...placementTest, questions: updatedQuestions });
    setEditingQuestion(null);
    setIsQuestionDialogOpen(false);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Бұл сұрақты жою керек пе?') && placementTest) {
      const updatedQuestions = placementTest.questions.filter((_, i) => i !== index);
      setPlacementTest({ ...placementTest, questions: updatedQuestions });
    }
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
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Тесттерге оралу
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Жүктелуде...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Қайта көру
                </Button>
              </div>
            </div>
          ) : placementTest ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{placementTest.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Деңгей анықтау тесті
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Деңгей анықтау тесті</Badge>
                    <Badge variant="outline">
                      {placementTest.questions?.length || 0} сұрақ
                    </Badge>
                    <Badge variant="outline">
                      {placementTest.timeLimit} минут
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Тестті өңдеу
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Болдырмау
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Сақталуда...' : 'Өзгерістерді сақтау'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Тестті өңдеу</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Атауы</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Тест атауын енгізіңіз"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Сипаттама</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Тест сипаттамасын енгізіңіз"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Уақыт шегі</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value) || 0)}
                        placeholder="Минутпен уақыт шегін енгізіңіз"
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
                          Тест сипаттамасы
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {placementTest.description ? (
                          <div className="whitespace-pre-wrap text-sm">
                            {placementTest.description}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Сипаттама жоқ
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Сұрақтар ({placementTest.questions?.length || 0})</span>
                          <Button
                            size="sm"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Сұрақ қосу
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {placementTest.questions && placementTest.questions.length > 0 ? (
                          <div className="space-y-4">
                            {placementTest.questions.map((question, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4 flex items-start justify-between"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium mb-2">
                                    {index + 1}. {question.question}
                                  </h4>
                                  
                                  {/* Question Content Preview */}
                                  {question.content && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                                      <p className="text-xs font-medium text-gray-600 mb-2">Мазмұн:</p>
                                      <div className="max-h-32 overflow-y-auto">
                                        {renderQuestionContent(question.content)}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {question.type}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {question.points} pts
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {question.level}
                                      </Badge>
                                    </div>
                                    {question.options && question.options.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-600 mb-1">Нұсқалар:</p>
                                        <div className="text-xs text-gray-500">
                                          {question.options.slice(0, 3).map((option, optIndex) => (
                                            <div key={optIndex} className="truncate">
                                              {String.fromCharCode(65 + optIndex)}. {option}
                                            </div>
                                          ))}
                                          {question.options.length > 3 && (
                                            <div className="text-gray-400">... тағы {question.options.length - 3}</div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditQuestion(question, index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteQuestion(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">
                              Әлі сұрақтар жоқ
                            </p>
                            <Button onClick={handleAddQuestion}>
                              Алғашқы сұрақты қосу
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
                        <CardTitle>Тест мәліметтері</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Тест ID
                          </Label>
                          <p className="text-sm font-mono break-all">
                            {placementTest._id}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Барлық сұрақтар
                          </Label>
                          <Badge variant="outline">
                            {placementTest.questions?.length || 0}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Уақыт шегі
                          </Label>
                          <Badge variant="outline">
                            {placementTest.timeLimit} минут
                          </Badge>
                        </div>

                        {placementTest.createdAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Құрылған
                            </Label>
                            <p className="text-sm">
                              {new Date(placementTest.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {placementTest.updatedAt && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Соңғы жаңарту
                            </Label>
                            <p className="text-sm">
                              {new Date(placementTest.updatedAt).toLocaleDateString()}
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
            <div>Тест табылмады</div>
          )}

              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion?._id ? 'Сұрақты өңдеу' : 'Жаңа сұрақ қосу'}
                    </DialogTitle>
                  </DialogHeader>
                  {editingQuestion && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="question">Сұрақ</Label>
                        <Textarea
                          id="question"
                          value={editingQuestion.question}
                          onChange={(e) =>
                            setEditingQuestion({
                              ...editingQuestion,
                              question: e.target.value,
                            })
                          }
                          placeholder="Сұрақты енгізіңіз"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Сұрақ түрі</Label>
                        <Select
                          value={editingQuestion.type}
                          onValueChange={(value: any) =>
                            setEditingQuestion({ ...editingQuestion, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Көп нұсқалы</SelectItem>
                            <SelectItem value="true-false">Дұрыс/Бұрыс</SelectItem>
                            <SelectItem value="short-answer">Қысқа жауап</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editingQuestion.type === "multiple-choice" && (
                        <div>
                          <Label>Нұсқалар</Label>
                          {editingQuestion.options?.map((option, index) => (
                            <Input
                              key={index}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(editingQuestion.options || [])];
                                newOptions[index] = e.target.value;
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOptions,
                                });
                              }}
                              placeholder={`Нұсқа ${index + 1}`}
                              className="mt-2"
                            />
                          ))}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="correctAnswer">Дұрыс жауап</Label>
                        {editingQuestion.type === "multiple-choice" ? (
                            <Select
                              value={editingQuestion.correctAnswer.toString()}
                              onValueChange={(value) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswer: parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Дұрыс нұсқаны таңдаңыз" />
                              </SelectTrigger>
                              <SelectContent>
                                {editingQuestion.options?.map((option, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    Нұсқа {index + 1}: {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="correctAnswer"
                              value={editingQuestion.correctAnswer}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswer: e.target.value,
                                })
                              }
                              placeholder="Дұрыс жауапты енгізіңіз"
                            />
                          )}
                      </div>
                      <div>
                        <Label htmlFor="explanation">Түсіндірме (міндетті емес)</Label>
                        <Textarea
                          id="explanation"
                          value={editingQuestion.explanation || ""}
                          onChange={(e) =>
                            setEditingQuestion({
                              ...editingQuestion,
                              explanation: e.target.value,
                            })
                          }
                          placeholder="Түсіндірмені енгізіңіз"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="points">Ұпай</Label>
                          <Input
                            id="points"
                            type="number"
                            value={editingQuestion.points}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                points: parseInt(e.target.value) || 1,
                              })
                            }
                            placeholder="Сұрақ үшін ұпай"
                          />
                        </div>
                        <div>
                          <Label htmlFor="level">Қиындық деңгейі</Label>
                          <Select
                            value={editingQuestion.level}
                            onValueChange={(value: any) =>
                              setEditingQuestion({ ...editingQuestion, level: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Бастапқы</SelectItem>
                              <SelectItem value="intermediate">Орташа</SelectItem>
                              <SelectItem value="advanced">Жоғары</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsQuestionDialogOpen(false)}
                        >
                          Болдырмау
                        </Button>
                        <Button onClick={handleSaveQuestion}>Сұрақты сақтау</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}