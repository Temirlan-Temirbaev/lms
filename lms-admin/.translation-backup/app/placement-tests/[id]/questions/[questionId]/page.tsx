"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { NotionEditorHandle } from "@/components/editors/NotionEditor";
import { MediaBrowser } from "@/components/editors/MediaBrowser";

// Dynamically import NotionEditor to avoid SSR issues
const NotionEditor = dynamic(
  () => import("@/components/editors/NotionEditor").then((mod) => mod.default),
  { ssr: false }
);

interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  passingScore: number;
}

interface Question {
  _id?: string;
  type:
    | "multiple-choice"
    | "matching"
    | "ordering"
    | "fill-in-blanks"
    | "input"
    | "categories";
  question: string;
  title?: string; // Used for fill-in-blanks questions
  content?: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  points: number;
  level: string;
}

// QUESTION_TYPES will be defined inside the component to use t()

// LEVEL_OPTIONS will be defined inside the component to use t()

export default function PlacementTestQuestionEditPage() {
  const { isAuthenticated, token } = useAuth();
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const placementTestId = params.id as string;
  const questionId = params.questionId as string;

  const QUESTION_TYPES = [
    { value: "multiple-choice", label: t('questions.types.multipleChoice') },
    { value: "matching", label: t('questions.types.matching') },
    { value: "ordering", label: t('questions.types.ordering') },
    { value: "fill-in-blanks", label: t('questions.types.fillInBlanks') },
    { value: "input", label: t('questions.types.textInput') },
    { value: "categories", label: t('questions.types.categories') },
  ];

  const LEVEL_OPTIONS = [
    { value: "A1", label: t('questions.levels.beginner') },
    { value: "A2", label: t('questions.levels.elementary') },
    { value: "B1", label: t('questions.levels.intermediate') },
    { value: "B2", label: t('questions.levels.upperIntermediate') },
    { value: "C1", label: t('questions.levels.advanced') },
    { value: "C2", label: t('questions.levels.proficient') }
  ];

  const [placementTest, setPlacementTest] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isNewQuestion = questionId === "new";
  const questionIndex = isNewQuestion ? -1 : parseInt(questionId);
  const [isEditing, setIsEditing] = useState(isNewQuestion);
  const [questionForm, setQuestionForm] = useState<Question>({
    type: "multiple-choice",
    question: "",
    content: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "Объяснение не предоставлено",
    points: 1,
    level: "A1",
  });

  // State for managing input values
  const [newItemInput, setNewItemInput] = useState("");

  const notionEditorRef = useRef<NotionEditorHandle>(null);

  // Fetch placement test data
  useEffect(() => {
    const fetchPlacementTest = async () => {
      if (!isAuthenticated || !token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          // Handle different API response structures
          const placementTestData = data.data || data;
          // Ensure questions is always an array
          const questionsArray = Array.isArray(placementTestData.questions) ? placementTestData.questions : [];
          const testWithQuestions = { ...placementTestData, questions: questionsArray };
          
          setPlacementTest(testWithQuestions);
          
          // If editing existing question, populate form
          if (!isNewQuestion && questionsArray.length > 0 && questionsArray[questionIndex]) {
            const existingQuestion = questionsArray[questionIndex];
            setQuestionForm({ 
              ...existingQuestion,
              level: existingQuestion.level || "A1" // Ensure level is set
            });
          }
        } else {
          setError(data.message || "Failed to fetch placement test");
        }
      } catch {
        setError("Error fetching placement test");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementTest();
  }, [isAuthenticated, token, placementTestId, questionIndex, isNewQuestion]);

  // Preview render function
  const renderQuestionContent = (content: string) => {
    if (!content) return null;
    return (
      <div className="mt-4 mb-4 p-4 border rounded-lg bg-slate-50">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="rounded-lg my-4 max-w-full max-h-64 object-contain mx-auto"
              />
            ),
            a: ({ href, children }) => {
              const isAudio = /\.(mp3|m4a|ogg|wav|aac)$/i.test(href || "");
              if (isAudio) {
                return (
                  <audio controls style={{ width: "100%" }}>
                    <source src={href} />
                    Your browser does not support the audio element.
                  </audio>
                );
              }
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const renderQuestionPreview = () => {
    const question = questionForm;

    return (
      <div className="space-y-4 p-6 border rounded-lg bg-white">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {question.question || "Введите ваш вопрос"}
          </h3>
          {question.content && renderQuestionContent(question.content)}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600 mb-3">
            {t('placementTests.selectCorrectAnswer')}
          </p>
          {question.options?.map((option, index) => (
            <div
              key={index}
              className="flex items-center p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <input
                type="radio"
                disabled
                checked={question.correctAnswer === option}
                className="mr-3"
              />
              <span className="text-slate-700">
                {option || `${t('placementTests.option')} ${index + 1}`}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Баллы:</strong> {question.points}
          </p>
        </div>
      </div>
    );
  };

  const handleSaveQuestion = async () => {
    if (!placementTest) return;

    const questionToSave = {
      ...questionForm,
      explanation: questionForm.explanation || "Объяснение не предоставлено",
    };

    try {
      setSaving(true);
      
      if (isNewQuestion) {
        // Add new question
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(questionToSave),
          }
        );

        const data = await res.json();
        if (res.ok) {
          router.push(`/placement-tests/${placementTestId}/questions`);
        } else {
          alert(data.message || "Failed to add question");
        }
      } else {
        // Update existing question
        const questionToUpdate = placementTest.questions[questionIndex];
        if (!questionToUpdate?._id) {
          alert("Question ID not found");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/placement-tests/${placementTestId}/questions/${questionToUpdate._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(questionToSave),
          }
        );

        const data = await res.json();
        if (res.ok) {
          router.push(`/placement-tests/${placementTestId}/questions`);
        } else {
          alert(data.message || "Failed to update question");
        }
      }
    } catch {
      alert("Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    // For placement tests, only allow multiple-choice
    if (type !== "multiple-choice") {
      return;
    }

    setQuestionForm({
      ...questionForm,
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (questionForm.type) {
      case "multiple-choice":
        return renderMultipleChoiceFields();
      case "matching":
        return renderMatchingFields();
      case "ordering":
        return renderOrderingFields();
      case "fill-in-blanks":
        return renderFillInBlanksFields();
      case "input":
        return renderInputFields();
      case "categories":
        return renderCategoriesFields();
      default:
        return null;
    }
  };

  const renderMatchingFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Настройка сопоставления</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Левая колонка</Label>
            {questionForm.options?.slice(0, Math.ceil((questionForm.options?.length || 0) / 2)).map((option, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(questionForm.options || [])];
                    newOptions[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  placeholder={`Элемент ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div>
            <Label>Правая колонка</Label>
            {questionForm.options?.slice(Math.ceil((questionForm.options?.length || 0) / 2)).map((option, index) => {
              const actualIndex = index + Math.ceil((questionForm.options?.length || 0) / 2);
              return (
                <div key={actualIndex} className="flex gap-2 mt-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(questionForm.options || [])];
                      newOptions[actualIndex] = e.target.value;
                      setQuestionForm({ ...questionForm, options: newOptions });
                    }}
                    placeholder={`Соответствие ${index + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const newOptions = [...(questionForm.options || []), "", ""];
            setQuestionForm({ ...questionForm, options: newOptions });
          }}
        >
          {t('questions.addPair')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderOrderingFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('questions.orderingSetup')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionForm.options?.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...(questionForm.options || [])];
                newOptions[index] = e.target.value;
                setQuestionForm({ ...questionForm, options: newOptions });
              }}
              placeholder={`${t('questions.item')} ${index + 1} (${t('questions.inCorrectOrder')})`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = questionForm.options?.filter((_, i) => i !== index) || [];
                setQuestionForm({ ...questionForm, options: newOptions });
              }}
            >
              {t('common.delete')}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const newOptions = [...(questionForm.options || []), ""];
            setQuestionForm({ ...questionForm, options: newOptions });
          }}
        >
          {t('questions.addItem')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderFillInBlanksFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('questions.correctAnswersForBlanks')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('questions.fillInBlanksInstructions')}
        </p>
        {(questionForm.correctAnswer as string[])?.map((answer, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={answer}
              onChange={(e) => {
                const newAnswers = [...(questionForm.correctAnswer as string[])];
                newAnswers[index] = e.target.value;
                setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
              }}
              placeholder={`${t('questions.answerForBlank')} ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newAnswers = (questionForm.correctAnswer as string[]).filter((_, i) => i !== index);
                setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
              }}
            >
              Удалить
            </Button>
          </div>
        )) || []}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const newAnswers = [...(questionForm.correctAnswer as string[] || []), ""];
            setQuestionForm({ ...questionForm, correctAnswer: newAnswers });
          }}
        >
          {t('questions.addAnswer')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderInputFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Правильный ответ</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          value={questionForm.correctAnswer as string}
          onChange={(e) =>
            setQuestionForm({ ...questionForm, correctAnswer: e.target.value })
          }
          placeholder="Введите правильный ответ"
        />
      </CardContent>
    </Card>
  );

  const renderCategoriesFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Настройка категорий</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Создайте категории и элементы, которые нужно распределить по категориям.
        </p>
        <div className="space-y-4">
          <div>
            <Label>Категории</Label>
            {questionForm.options?.map((category, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={category}
                  onChange={(e) => {
                    const newOptions = [...(questionForm.options || [])];
                    newOptions[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  placeholder={`Категория ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = questionForm.options?.filter((_, i) => i !== index) || [];
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                >
                  Удалить
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => {
                const newOptions = [...(questionForm.options || []), ""];
                setQuestionForm({ ...questionForm, options: newOptions });
              }}
            >
              Добавить категорию
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMultipleChoiceFields = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Вопрос с множественным выбором</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new option input */}
          <div>
            <Label className="text-base font-semibold">{t('questions.addOptions')}</Label>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder={t('questions.enterNewOption')}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    const newOptions = [
                      ...(questionForm.options || []),
                      e.currentTarget.value.trim(),
                    ];
                    setQuestionForm({
                      ...questionForm,
                      options: newOptions,
                    });
                    e.currentTarget.value = "";
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={(e) => {
                  const input =
                    e.currentTarget.parentElement?.querySelector(
                      "input"
                    ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    const newOptions = [
                      ...(questionForm.options || []),
                      input.value.trim(),
                    ];
                    setQuestionForm({
                      ...questionForm,
                      options: newOptions,
                    });
                    input.value = "";
                  }
                }}
              >
                {t('questions.addOption')}
              </Button>
            </div>
          </div>

          {/* Configure Options */}
          <div>
            <Label className="text-base font-semibold">
              {t('questions.configureOptions')}
            </Label>
            <div className="mt-3 space-y-3">
              {questionForm.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50"
                >
                  {/* Option Input */}
                  <div className="flex-1">
                    <Input
                      placeholder={t('questions.optionLabel', { letter: String.fromCharCode(65 + index) })}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [
                          ...(questionForm.options || []),
                        ];
                        newOptions[index] = e.target.value;
                        // Update correct answer if this was the selected option
                        const newCorrectAnswer =
                          questionForm.correctAnswer === option
                            ? e.target.value
                            : questionForm.correctAnswer;
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                          correctAnswer: newCorrectAnswer,
                        });
                      }}
                      className="bg-white"
                    />
                  </div>

                  {/* Correct Answer Selection */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === option}
                      onChange={() =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: option,
                        })
                      }
                      className="text-green-600"
                    />
                    <span className="text-sm text-slate-600">{t('questions.correct')}</span>
                  </div>

                  {/* Remove Option */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newOptions = questionForm.options?.filter(
                        (_, i) => i !== index
                      );
                      // Clear correct answer if removing the selected option
                      const newCorrectAnswer =
                        questionForm.correctAnswer === option
                          ? ""
                          : questionForm.correctAnswer;
                      setQuestionForm({
                        ...questionForm,
                        options: newOptions,
                        correctAnswer: newCorrectAnswer,
                      });
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => router.push("/placement-tests")}
                className="mt-4"
              >
                {t('placementTests.backToTests')}
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`/placement-tests/${placementTestId}/questions`)
                }
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('questions.backToQuestions')}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {isNewQuestion ? t('questions.newQuestion') : t('questions.editQuestion')}
                </h1>
                <p className="text-muted-foreground">
                  {placementTest?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveQuestion}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? t('common.saving') : t('common.save')}</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          {placementTest ? (
            <Tabs defaultValue="edit" className="space-y-4">
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  {t('common.edit')}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('common.preview')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                {renderQuestionPreview()}
              </TabsContent>

              <TabsContent value="edit" className="space-y-4">
                <div className="grid gap-6">
                  {/* Question Type and Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Тип вопроса</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Тип вопроса</Label>
                          <Select
                            value={questionForm.type}
                            onValueChange={handleQuestionTypeChange}
                            disabled
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">
                                Множественный выбор
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Тесты размещения поддерживают только вопросы с множественным выбором
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Text */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Текст вопроса</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {questionForm.type === "fill-in-blanks" && (
                        <div>
                          <Label className="text-base font-semibold">
                            Заголовок (инструкция)
                          </Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Основная инструкция для задания
                          </p>
                          <Input
                            placeholder="например, Завершите предложения ниже"
                            value={questionForm.title || ""}
                            onChange={(e) =>
                              setQuestionForm({
                                ...questionForm,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-base font-semibold">
                          {questionForm.type === "fill-in-blanks"
                            ? "Предложение с пропусками"
                            : "Текст вопроса"}
                        </Label>
                        {questionForm.type === "fill-in-blanks" && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Используйте _____ (5 подчеркиваний) для создания
                            пропусков в вашем предложении.
                          </p>
                        )}
                        <Textarea
                          placeholder={
                            questionForm.type === "fill-in-blanks"
                              ? "например, Я _____ в школу каждый день."
                              : "Введите ваш вопрос"
                          }
                          value={questionForm.question}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              question: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Editor */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Содержание (Markdown с поддержкой медиа)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-hidden">
                        <NotionEditor
                          ref={notionEditorRef}
                          content={questionForm.content || ""}
                          onChange={(markdown) =>
                            setQuestionForm({
                              ...questionForm,
                              content: markdown,
                            })
                          }
                          placeholder="Добавьте дополнительное содержание, изображения, аудио и т.д..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Type-specific fields */}
                  {renderQuestionTypeSpecificFields()}

                  {/* Points and Explanation */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Баллы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          type="number"
                          min="1"
                          value={questionForm.points}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              points: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Объяснение</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Объяснение правильного ответа"
                          value={questionForm.explanation}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              explanation: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
               </TabsContent>
             </Tabs>
           ) : (
             <div className="text-center py-8">
               <p>Загрузка...</p>
             </div>
           )}
         </div>
       </SidebarInset>
     </SidebarProvider>
   );
 }