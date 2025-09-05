"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
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
  course: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
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
}

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Көп таңдау" },
  { value: "matching", label: "Сәйкестендіру" },
    { value: "ordering", label: "Реттеу" },
  { value: "fill-in-blanks", label: "Бос орындарды толтыру" },
    { value: "input", label: "Мәтін енгізу" },
  { value: "categories", label: "Санаттар" },
];

export default function QuestionEditPage() {
  const { isAuthenticated, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;
  const questionId = params.questionId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<Test | null>(null);
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
    explanation: "Түсіндірме берілмеген", // Dummy explanation
    points: 1,
  });

  // State for managing input values
  const [newItemInput, setNewItemInput] = useState("");

  const notionEditorRef = useRef<NotionEditorHandle>(null);

  // Preview render functions adapted from TestScreen.js
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
                    Сіздің браузеріңіз аудио элементін қолдамайды.
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
            {question.type === "fill-in-blanks"
              ? question.title || "Сұрақ тақырыбын енгізіңіз"
              : question.question || "Сұрағыңызды енгізіңіз"}
          </h3>
          {question.content && renderQuestionContent(question.content)}
        </div>

        {question.type === "multiple-choice" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3">
              Дұрыс жауапты таңдаңыз:
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
                  {option || `Нұсқа ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {question.type === "matching" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-3">Элементтерді сәйкестендіріңіз:</p>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1 p-3 border rounded-lg bg-slate-50">
                  {option || `Элемент ${index + 1}`}
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex-1 p-3 border rounded-lg bg-blue-50">
                  <div className="text-slate-700">
                    {(question.correctAnswer as string[])?.[index] ||
                      "Сәйкестік орнатылмаған"}
                  </div>
                </div>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <p className="text-slate-500 italic">
                Сәйкестендіру жұптары әлі орнатылмаған.
              </p>
            )}
          </div>
        )}

        {question.type === "ordering" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3">
              Элементтерді дұрыс ретпен орналастырыңыз:
            </p>
            {question.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center p-3 border rounded-lg bg-slate-50"
              >
                <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span className="text-slate-700">
                  {option || `Элемент ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {question.type === "fill-in-blanks" && (
          <div className="space-y-3">
            {/* Show the title (main instruction) */}
            {question.title && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-base font-medium text-blue-900">
                  {question.title}
                </p>
              </div>
            )}

            <p className="text-sm text-slate-600 mb-3">Бос орындарды толтырыңыз:</p>
            <div className="p-4 border rounded-lg bg-slate-50">
              {question.question && question.question.includes("_____") ? (
                (() => {
                  const parts = question.question.split("_____");

                  // Multiple blanks - show individual inputs
                  return (
                    <div className="space-y-3">
                      <div className="text-lg leading-relaxed whitespace-pre-wrap">
                        {parts.map((part, index, array) => (
                          <span key={index}>
                            {part}
                            {index < array.length - 1 &&
                              (() => {
                                const blankId = `blank${index + 1}`;
                                const answers = question.correctAnswer;
                                let answer = "";
                                if (
                                  answers &&
                                  typeof answers === "object" &&
                                  answers[blankId]
                                ) {
                                  const blankAnswers = answers[blankId];
                                  answer = Array.isArray(blankAnswers)
                                    ? blankAnswers[0] || ""
                                    : blankAnswers || "";
                                }

                                return (
                                  <span
                                    className="inline-block mx-2 px-2 py-1 border-b-2 border-blue-300 bg-blue-50 text-center font-medium text-blue-800"
                                    style={{
                                      minWidth: "3em",
                                      width: "auto",
                                    }}
                                  >
                                    {answer || `[Blank ${index + 1}]`}
                                  </span>
                                );
                              })()}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Ескерту:</strong> Бұл сұрақта{" "}
                          {parts.length - 1} бос орын бар. Студенттер әр
                          бос орынды жеке толтырады.
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-2">
                    Әлі бос орындар анықталмаған. Сұрақта _____ пайдаланыңыз
                    blanks.
                  </p>
                  <input
                    type="text"
                    disabled
                    className="w-full max-w-md p-2 border rounded bg-white"
                    placeholder="Жауап осында көрсетіледі"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {question.type === "input" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-3">Жауабыңызды енгізіңіз:</p>
            <input
              type="text"
              disabled
              className="w-full p-3 border rounded-lg bg-slate-50"
              value={
                Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(" / ")
                  : question.correctAnswer || ""
              }
              placeholder="Жауабыңызды осында теріңіз..."
            />
          </div>
        )}

        {question.type === "categories" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-3">
              Элементтерді дұрыс санаттарға сүйреңіз:
            </p>

            {/* Available items */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Қолжетімді элементтер ({question.options?.length || 0}):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {question.options?.map((option, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-100 text-blue-800 rounded-lg text-sm border border-blue-200 min-h-[60px] flex items-center justify-center"
                  >
                    {option?.startsWith("http") ? (
                      <div className="text-center">
                        <img
                          src={option}
                          alt={`Item ${index + 1}`}
                          className="w-16 h-16 object-contain mx-auto mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <span className="text-xs">Сурет {index + 1}</span>
                      </div>
                    ) : (
                      <span className="text-center">
                        {option || `Item ${index + 1}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            {question.correctAnswer &&
              typeof question.correctAnswer === "object" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(
                    question.correctAnswer as Record<string, string[]>
                  ).map(([category, items], index) => (
                    <div
                      key={index}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-4 min-h-[120px]"
                    >
                      <div className="mb-3">
                        {category.startsWith("http") ? (
                          <div className="text-center">
                            <img
                              src={category}
                              alt="Category"
                              className="w-20 h-20 object-contain mx-auto mb-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <h4 className="text-xs text-slate-600">
                              Санат суреті
                            </h4>
                          </div>
                        ) : (
                          <h4 className="font-medium text-slate-700 text-center">
                            {category}
                          </h4>
                        )}
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          // Handle both array and object formats
                          let itemsArray: string[] = [];
                          if (Array.isArray(items)) {
                            itemsArray = items;
                          } else if (items && typeof items === "object") {
                            // Convert old format {1: "item1", 2: "item2"} to array
                            itemsArray = Object.values(items);
                          }

                          return itemsArray && itemsArray.length > 0 ? (
                            <div className="text-sm text-slate-600">
                              <p className="font-medium mb-2">
                                Күтілетін элементтер ({itemsArray.length}):
                              </p>
                              <div className="grid grid-cols-1 gap-1">
                                {itemsArray.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="p-2 bg-green-50 border border-green-200 rounded text-green-800 text-xs"
                                  >
                                    {item?.startsWith?.("http") ? (
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={item}
                                          alt="Item"
                                          className="w-6 h-6 object-contain"
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).style.display = "none";
                                          }}
                                        />
                                        <span>Сурет элементі</span>
                                      </div>
                                    ) : (
                                      item
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500 text-center">
                              Құтылған элементтер жоқ
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-500">
            Сұрақ түрі:{" "}
            {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
          </div>
          <div className="text-sm font-medium text-slate-600">
            Ұпайлар: {question.points}
          </div>
        </div>
      </div>
    );
  };

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

          // If editing existing question, populate form
          if (
            !isNewQuestion &&
            questionIndex >= 0 &&
            questionIndex < testData.data.questions.length
          ) {
            const existingQuestion = testData.data.questions[questionIndex];

            if (existingQuestion) {
              // Convert old category format to new format if needed
              if (
                existingQuestion.type === "categories" &&
                existingQuestion.correctAnswer
              ) {
                const correctAnswer = existingQuestion.correctAnswer;
                const convertedAnswer: Record<string, string[]> = {};

                Object.keys(correctAnswer).forEach((category) => {
                  const items = correctAnswer[category];
                  if (Array.isArray(items)) {
                    // Already in correct format
                    convertedAnswer[category] = items;
                  } else if (items && typeof items === "object") {
                    // Convert old format {1: "item1", 2: "item2"} to array
                    convertedAnswer[category] = Object.values(items);
                  } else {
                    convertedAnswer[category] = [];
                  }
                });

                setQuestionForm({
                  ...existingQuestion,
                  correctAnswer: convertedAnswer,
                });
              } else {
                setQuestionForm({ ...existingQuestion });
              }
            }
          }
        }
      } catch {
        setError("Тест деректерін жүктеу мүмкін болмады");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, courseId, testId, questionId, isNewQuestion]);

  const handleCancel = () => {
    if (
      !isNewQuestion &&
      test &&
      questionIndex >= 0 &&
      questionIndex < test.questions.length
    ) {
      const existingQuestion = test.questions[questionIndex];
      if (existingQuestion) {
        // Convert old category format to new format if needed
        if (
          existingQuestion.type === "categories" &&
          existingQuestion.correctAnswer
        ) {
          const correctAnswer = existingQuestion.correctAnswer;
          const convertedAnswer: Record<string, string[]> = {};

          Object.keys(correctAnswer).forEach((category) => {
            const items = correctAnswer[category];
            if (Array.isArray(items)) {
              // Already in correct format
              convertedAnswer[category] = items;
            } else if (items && typeof items === "object") {
              // Convert old format {1: "item1", 2: "item2"} to array
              convertedAnswer[category] = Object.values(items);
            } else {
              convertedAnswer[category] = [];
            }
          });

          setQuestionForm({
            ...existingQuestion,
            correctAnswer: convertedAnswer,
          });
        } else {
          setQuestionForm({ ...existingQuestion });
        }
      }
    }
    setIsEditing(false);
  };

  const handleSaveQuestion = async () => {
    if (!test) return;

    // Ensure question has a dummy explanation
    const questionToSave = {
      ...questionForm,
      explanation: "Түсіндірме берілмеген", // Always set dummy explanation
    };

    const updatedQuestions = isNewQuestion
      ? [...test.questions, questionToSave]
      : test.questions.map((q, index) =>
          index === questionIndex ? questionToSave : q
        );

    try {
      setSaving(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questions: updatedQuestions }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Navigate back to questions list
        router.push(`/courses/${courseId}/tests/${testId}/questions`);
      } else {
        alert(data.message || "Сұрақты сақтау мүмкін болмады");
      }
    } catch {
      alert("Сұрақты сақтау кезінде қате");
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    const newForm: Question = {
      ...questionForm,
      type: type as Question["type"],
      explanation: "Түсіндірме берілмеген", // Always keep dummy explanation
    };

    // Set default values based on question type
    switch (type) {
      case "multiple-choice":
        newForm.options = ["", "", "", ""];
        newForm.correctAnswer = "";
        break;
      case "matching":
        newForm.options = ["", ""];
        newForm.correctAnswer = ["", ""];
        break;
      case "ordering":
        newForm.options = ["", "", ""];
        newForm.correctAnswer = ["", "", ""];
        break;
      case "fill-in-blanks":
        newForm.options = [];
        newForm.correctAnswer = {};
        // Preserve title if it exists, otherwise set empty
        if (!newForm.title) {
          newForm.title = "";
        }
        break;
      case "input":
        newForm.options = [];
        newForm.correctAnswer = "";
        break;
      case "categories":
        newForm.options = [];
        newForm.correctAnswer = {
          "Санат 1": [],
                "Санат 2": [],
        };
        break;
    }

    setQuestionForm(newForm);
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (questionForm.type) {
      case "multiple-choice":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Көп таңдаулы сұрақ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Жаңа нұсқа енгізу */}
              <div>
                <Label className="text-base font-semibold">Нұсқаларды қосу</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Жаңа нұсқа енгізіңіз..."
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
                    Нұсқа қосу
                  </Button>
                </div>
              </div>

              {/* Configure Options */}
              <div>
                <Label className="text-base font-semibold">
                  Нұсқаларды баптау
                </Label>
                <div className="mt-3 space-y-3">
                  {questionForm.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50"
                    >
                      {/* Нұсқа енгізу */}
                      <div className="flex-1">
                        <Input
                          placeholder={`Нұсқа ${String.fromCharCode(
                            65 + index
                          )}`}
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

                      {/* Дұрыс жауапты таңдау */}
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
                          className="w-4 h-4"
                        />
                        <Label className="text-sm font-medium text-green-700">
                          Дұрыс
                        </Label>
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions =
                            questionForm.options?.filter(
                              (_, i) => i !== index
                            ) || [];
                          // Clear correct answer if removing the correct option
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
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}

                  {(!questionForm.options ||
                    questionForm.options.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">
                        Нұсқалар әлі жоқ. Бастау үшін жоғарыда нұсқаларды қосыңыз.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.options && questionForm.options.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Нұсқаулар:</strong> Студенттер осы нұсқаларды көреді
                      және дұрыс жауапты таңдауы керек. Ауыстырғыштарды пайдаланып,
                      бір нұсқаны дұрыс деп белгілегеніңізге көз жеткізіңіз.
                    </p>
                  </div>
                )}

                {/* Warning if no correct answer selected */}
                {questionForm.options &&
                  questionForm.options.length > 0 &&
                  !questionForm.correctAnswer && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Ескерту:</strong> Қай нұсқа
                        дұрыс жауап екенін таңдаңыз.
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        );

      case "matching":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Сәйкестендіру сұрағы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add/Remove Items */}
              <div>
                <Label className="text-base font-semibold">Элементтерді басқару</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Сәйкестендіру үшін жаңа элемент енгізіңіз..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        const newOptions = [
                          ...(questionForm.options || []),
                          e.currentTarget.value.trim(),
                        ];
                        const newAnswers = [
                          ...((questionForm.correctAnswer as string[]) || []),
                          "",
                        ];
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                          correctAnswer: newAnswers,
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
                        const newAnswers = [
                          ...((questionForm.correctAnswer as string[]) || []),
                          "",
                        ];
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                          correctAnswer: newAnswers,
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Элемент қосу
                  </Button>
                </div>
              </div>

              {/* Matching Pairs with Preview Style */}
              <div>
                <Label className="text-base font-semibold">
                  Сәйкестендіруді баптау
                </Label>
                <div className="mt-3 space-y-3">
                  {questionForm.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50"
                    >
                      {/* Сол жақ - Элемент */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder={`Элемент ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [
                                ...(questionForm.options || []),
                              ];
                              newOptions[index] = e.target.value;
                              setQuestionForm({
                                ...questionForm,
                                options: newOptions,
                              });
                            }}
                            className="bg-white"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions =
                                questionForm.options?.filter(
                                  (_, i) => i !== index
                                ) || [];
                              const newAnswers =
                                (
                                  questionForm.correctAnswer as string[]
                                )?.filter((_, i) => i !== index) || [];
                              setQuestionForm({
                                ...questionForm,
                                options: newOptions,
                                correctAnswer: newAnswers,
                              });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-400 text-xl font-bold">→</div>

                      {/* Оң жақ - Сәйкестік */}
                      <div className="flex-1">
                        <Input
                          placeholder={`"${
                            option || `Элемент ${index + 1}`
                          }"`}
                          value={
                            (questionForm.correctAnswer as string[])?.[index] ||
                            ""
                          }
                          onChange={(e) => {
                            const newAnswers = [
                              ...((questionForm.correctAnswer as string[]) ||
                                []),
                            ];
                            newAnswers[index] = e.target.value;
                            setQuestionForm({
                              ...questionForm,
                              correctAnswer: newAnswers,
                            });
                          }}
                          className="bg-blue-50 border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  ))}

                  {(!questionForm.options ||
                    questionForm.options.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">
                        Сәйкестендіру жұптары әлі жоқ. Бастау үшін жоғарыдан
                        элементтер қосыңыз.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.options && questionForm.options.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Нұсқаулық:</strong> Сол жақтағы әр элементтің
                      оң жағында дұрыс сәйкесі болуы керек. Студенттер осы
                      жұптарды дұрыс сәйкестендіруі қажет.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "ordering":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Реттеу сұрағы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new item input */}
              <div>
                <Label className="text-base font-semibold">Элементтерді қосу</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Реттелетін элементті енгізіңіз..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        const newItem = e.currentTarget.value.trim();
                        const newCorrectAnswer = [
                          ...((questionForm.correctAnswer as string[]) || []),
                          newItem,
                        ];
                        // Options will be a shuffled version for students
                        setQuestionForm({
                          ...questionForm,
                          options: [...newCorrectAnswer], // Copy of correct order
                          correctAnswer: newCorrectAnswer,
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
                        const newItem = input.value.trim();
                        const newCorrectAnswer = [
                          ...((questionForm.correctAnswer as string[]) || []),
                          newItem,
                        ];
                        // Options will be a shuffled version for students
                        setQuestionForm({
                          ...questionForm,
                          options: [...newCorrectAnswer], // Copy of correct order
                          correctAnswer: newCorrectAnswer,
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Элемент қосу
                  </Button>
                </div>
              </div>

              {/* Correct Order Management */}
              <div>
                <Label className="text-base font-semibold">
                  Дұрыс рет (қайта реттеу үшін сүйреңіз)
                </Label>
                <div className="mt-3 space-y-2">
                  {(questionForm.correctAnswer as string[])?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50"
                      >
                        <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newCorrectAnswer = [
                                ...((questionForm.correctAnswer as string[]) ||
                                  []),
                              ];
                              newCorrectAnswer[index] = e.target.value;
                              setQuestionForm({
                                ...questionForm,
                                options: [...newCorrectAnswer], // Keep options in sync
                                correctAnswer: newCorrectAnswer,
                              });
                            }}
                            placeholder={`Элемент ${index + 1}`}
                            className="bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => {
                              if (index > 0) {
                                const newCorrectAnswer = [
                                  ...((questionForm.correctAnswer as string[]) ||
                                    []),
                                ];
                                [
                                  newCorrectAnswer[index],
                                  newCorrectAnswer[index - 1],
                                ] = [
                                  newCorrectAnswer[index - 1],
                                  newCorrectAnswer[index],
                                ];
                                setQuestionForm({
                                  ...questionForm,
                                  options: [...newCorrectAnswer], // Keep options in sync
                                  correctAnswer: newCorrectAnswer,
                                });
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              index ===
                              ((questionForm.correctAnswer as string[])
                                ?.length || 0) -
                                1
                            }
                            onClick={() => {
                              const correctAnswerArray =
                                (questionForm.correctAnswer as string[]) || [];
                              if (index < correctAnswerArray.length - 1) {
                                const newCorrectAnswer = [
                                  ...correctAnswerArray,
                                ];
                                [
                                  newCorrectAnswer[index],
                                  newCorrectAnswer[index + 1],
                                ] = [
                                  newCorrectAnswer[index + 1],
                                  newCorrectAnswer[index],
                                ];
                                setQuestionForm({
                                  ...questionForm,
                                  options: [...newCorrectAnswer], // Keep options in sync
                                  correctAnswer: newCorrectAnswer,
                                });
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCorrectAnswer =
                              (questionForm.correctAnswer as string[])?.filter(
                                (_, i) => i !== index
                              ) || [];
                            setQuestionForm({
                              ...questionForm,
                              options: [...newCorrectAnswer], // Keep options in sync
                              correctAnswer: newCorrectAnswer,
                            });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    )
                  )}

                  {(!questionForm.correctAnswer ||
                    (questionForm.correctAnswer as string[]).length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">
                        Элементтер әлі жоқ. Бастау үшін жоғарыда элементтерді қосыңыз.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.correctAnswer &&
                  (questionForm.correctAnswer as string[]).length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Нұсқаулық:</strong> Студенттер бұл элементтерді
                        кездейсоқ ретпен көреді және оларды жоғарыда көрсетілген
                        дұрыс ретпен орналастыруы керек.
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        );

      case "fill-in-blanks":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Бос орындарды толтыру сұрағы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <div>
                <Label className="text-base font-semibold">
                  Сұрақ тақырыбы/Нұсқаулық
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Студенттерге арналған негізгі нұсқаулық (мысалы, &quot;Сөйлемдерді
                  аяқтаңыз&quot;)
                </p>
                <Input
                  placeholder="мысалы, Төмендегі сөйлемдерді толықтырыңыз"
                  value={questionForm.title || ""}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Question with Blanks */}
              <div>
                <Label className="text-base font-semibold">
                  Бос орындары бар сөйлем
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Сөйлемде бос орын жасау үшін _____ (5 астын сызу) пайдаланыңыз.
                  Әр _____ студенттер үшін енгізу өрісіне айналады.
                </p>
                <Textarea
                  placeholder="мысалы, Мен күн сайын мектепке _____ және үй тапсырмамды _____."
                  value={questionForm.question}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question: e.target.value,
                    })
                  }
                  rows={3}
                />
                {/* Show blank count */}
                {questionForm.question && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Анықталған бос орындар:</strong>{" "}
                      {(questionForm.question.match(/_____/g) || []).length}{" "}
                      бос орын
                    </p>
                  </div>
                )}
              </div>

              {/* Correct Answers */}
              <div>
                <Label className="text-base font-semibold">
                  Дұрыс жауаптар
                </Label>
                {(() => {
                  const blankCount = (
                    questionForm.question.match(/_____/g) || []
                  ).length;

                  if (blankCount === 0) {
                    return (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-gray-500">
                          Бос орындар жасау үшін жоғарыдағы сөйлемге _____ қосыңыз,
                          содан кейін мұнда жауаптарды конфигурациялаңыз.
                        </p>
                      </div>
                    );
                  }

                  // Multiple blanks - object with blank1, blank2, etc.
                  const currentAnswers =
                    typeof questionForm.correctAnswer === "object" &&
                    !Array.isArray(questionForm.correctAnswer)
                      ? questionForm.correctAnswer
                      : {};

                  return (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Әр бос орын үшін дұрыс жауаптарды орнатыңыз. Әр бос орын
                        үшін бірнеше қолайлы жауап бере аласыз.
                      </p>
                      {Array.from({ length: blankCount }, (_, index) => {
                        const blankId = `blank${index + 1}`;
                        const blankAnswers = currentAnswers[blankId] || [];

                        return (
                          <div
                            key={blankId}
                            className="p-4 border rounded-lg bg-slate-50"
                          >
                            <Label className="font-medium">
                              Бос орын {index + 1} - Дұрыс жауаптар
                            </Label>
                            <Textarea
                              placeholder="Дұрыс жауаптарды енгізіңіз (әр жолға бір жауап)&#10;мысалы:&#10;жүру&#10;бару"
                              value={
                                Array.isArray(blankAnswers)
                                  ? blankAnswers.join("\n")
                                  : ""
                              }
                              onChange={(e) => {
                                const lines = e.target.value
                                  .split("\n")
                                  .filter((line) => line.trim());
                                const newCorrectAnswer = {
                                  ...currentAnswers,
                                  [blankId]: lines,
                                };
                                setQuestionForm({
                                  ...questionForm,
                                  correctAnswer: newCorrectAnswer,
                                });
                              }}
                              rows={2}
                              className="mt-2"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Қалай жұмыс істейді:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Тақырып:</strong> Студенттерге негізгі нұсқаулық
                    ретінде көрсетіледі
                  </li>
                  <li>
                    • <strong>Сөйлем:</strong> Әр _____ енгізу өрісіне
                    айналады
                  </li>
                  <li>
                    • <strong>Жауаптар:</strong> Студенттердің жауаптары
                    сіздің дұрыс жауаптарыңызбен тексеріледі
                  </li>
                  <li>
                    • <strong>Бірнеше жауап:</strong> Сіз әр бос орын үшін
                    әртүрлі дұрыс жауаптарды қабылдай аласыз
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "input":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Мәтін енгізу</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Дұрыс жауап(тар)</Label>
                <Textarea
                  placeholder="Мүмкін дұрыс жауаптарды енгізіңіз (әр жолға біреуден)"
                  value={
                    Array.isArray(questionForm.correctAnswer)
                      ? questionForm.correctAnswer.join("\n")
                      : questionForm.correctAnswer
                  }
                  onChange={(e) => {
                    const lines = e.target.value
                      .split("\n")
                      .filter((line) => line.trim());
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: lines.length > 1 ? lines : e.target.value,
                    });
                  }}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "categories":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Санаттар</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Қолжетімді элементтер
                </Label>

                {/* Add new item input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Элемент мәтінін немесе сурет URL-ін енгізіңіз..."
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newItemInput.trim()) {
                        const newOptions = [
                          ...(questionForm.options || []),
                          newItemInput.trim(),
                        ];
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                        });
                        setNewItemInput("");
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      if (newItemInput.trim()) {
                        const newOptions = [
                          ...(questionForm.options || []),
                          newItemInput.trim(),
                        ];
                        setQuestionForm({
                          ...questionForm,
                          options: newOptions,
                        });
                        setNewItemInput("");
                      }
                    }}
                    size="sm"
                  >
                    Элемент қосу
                  </Button>
                </div>

                {/* Display current items as removable tags */}
                <div className="mt-4">
                  {questionForm.options && questionForm.options.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Ағымдағы элементтер ({questionForm.options.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {questionForm.options.map((option, index) => (
                          <div
                            key={index}
                            className="group flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                          >
                            {option.startsWith("http") ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={option}
                                  alt={`Item ${index + 1}`}
                                  className="w-12 h-12 object-contain rounded"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                                <span className="text-sm text-gray-700 max-w-[150px] truncate">
                                  Сурет {index + 1}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-700 max-w-[200px] truncate">
                                {option}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions =
                                  questionForm.options?.filter(
                                    (_, i) => i !== index
                                  ) || [];
                                // Also remove this item from all categories
                                const newCorrectAnswer = {
                                  ...(questionForm.correctAnswer as Record<
                                    string,
                                    string[]
                                  >),
                                };
                                Object.keys(newCorrectAnswer).forEach(
                                  (category) => {
                                    const items = Array.isArray(
                                      newCorrectAnswer[category]
                                    )
                                      ? newCorrectAnswer[category]
                                      : [];
                                    newCorrectAnswer[category] = items.filter(
                                      (item) => item !== option
                                    );
                                  }
                                );
                                setQuestionForm({
                                  ...questionForm,
                                  options: newOptions,
                                  correctAnswer: newCorrectAnswer,
                                });
                              }}
                              className="w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Элементті жою"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">
                        Элементтер әлі қосылмаған. Жоғарыда мәтін енгізіп Enter
                        басыңыз немесе &quot;Элемент қосу&quot; түймесін басыңыз.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Categories Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Санаттар</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCorrectAnswer = {
                        ...(questionForm.correctAnswer as Record<
                          string,
                          string[]
                        >),
                        [`Category ${
                          Object.keys(
                            (questionForm.correctAnswer as Record<
                              string,
                              string[]
                            >) || {}
                          ).length + 1
                        }`]: [],
                      };
                      setQuestionForm({
                        ...questionForm,
                        correctAnswer: newCorrectAnswer,
                      });
                    }}
                  >
                    Санат қосу
                  </Button>
                </div>

                <div className="space-y-4">
                  {Object.entries(
                    (questionForm.correctAnswer as Record<string, string[]>) ||
                      {}
                  ).map(([category, items], categoryIndex) => {
                    // Convert old format to new format if needed
                    const itemsArray = Array.isArray(items)
                      ? items
                      : items && typeof items === "object"
                      ? Object.values(items).map((item) => String(item))
                      : [];

                    return (
                      <Card key={categoryIndex} className="p-4">
                        <div className="space-y-3">
                          {/* Category Header */}
                          <div className="flex gap-2 items-start">
                            <div className="flex-1">
                              <Label className="text-sm font-medium">
                                Санат атауы/URL
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  placeholder="Санат атауы немесе сурет URL-і"
                                  value={category}
                                  onChange={(e) => {
                                    const newCorrectAnswer = {
                                      ...(questionForm.correctAnswer as Record<
                                        string,
                                        string[]
                                      >),
                                    };
                                    delete newCorrectAnswer[category];
                                    newCorrectAnswer[e.target.value] =
                                      itemsArray;
                                    setQuestionForm({
                                      ...questionForm,
                                      correctAnswer: newCorrectAnswer,
                                    });
                                  }}
                                  className="flex-1"
                                />
                                <MediaBrowser
                                  onSelect={(file) => {
                                    const newCorrectAnswer = {
                                      ...(questionForm.correctAnswer as Record<
                                        string,
                                        string[]
                                      >),
                                    };
                                    delete newCorrectAnswer[category];
                                    newCorrectAnswer[file.url] = itemsArray;
                                    setQuestionForm({
                                      ...questionForm,
                                      correctAnswer: newCorrectAnswer,
                                    });
                                  }}
                                  acceptedTypes={["image/*"]}
                                >
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                  >
                                    Суреттерді шолу
                                  </Button>
                                </MediaBrowser>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newCorrectAnswer = {
                                  ...(questionForm.correctAnswer as Record<
                                    string,
                                    string[]
                                  >),
                                };
                                delete newCorrectAnswer[category];
                                setQuestionForm({
                                  ...questionForm,
                                  correctAnswer: newCorrectAnswer,
                                });
                              }}
                              className="mt-6"
                            >
                              Санатты жою
                            </Button>
                          </div>

                          {/* Category Preview */}
                          {category && (
                            <div className="p-2 border rounded bg-gray-50">
                              {category.startsWith("http") ? (
                                <div className="text-center">
                                  <img
                                    src={category}
                                    alt="Санаттың алдын ала қарауы"
                                    className="max-w-full max-h-20 mx-auto object-contain"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Санат суреті
                                  </p>
                                </div>
                              ) : (
                                <p className="font-medium text-center">
                                  {category}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Items Assignment with Checkboxes */}
                          <div>
                            <Label className="text-sm font-medium">
                              Осы санат үшін элементтерді таңдаңыз
                            </Label>
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                              {questionForm.options?.map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${categoryIndex}-${optionIndex}`}
                                      checked={itemsArray.includes(option)}
                                      onChange={(e) => {
                                        const newCorrectAnswer = {
                                          ...(questionForm.correctAnswer as Record<
                                            string,
                                            string[]
                                          >),
                                        };

                                        if (e.target.checked) {
                                          // Add to this category and remove from others
                                          Object.keys(newCorrectAnswer).forEach(
                                            (cat) => {
                                              const catItems = Array.isArray(
                                                newCorrectAnswer[cat]
                                              )
                                                ? newCorrectAnswer[cat]
                                                : [];
                                              newCorrectAnswer[cat] =
                                                catItems.filter(
                                                  (item) => item !== option
                                                );
                                            }
                                          );
                                          newCorrectAnswer[category] = [
                                            ...itemsArray,
                                            option,
                                          ];
                                        } else {
                                          // Remove from this category
                                          newCorrectAnswer[category] =
                                            itemsArray.filter(
                                              (item) => item !== option
                                            );
                                        }

                                        setQuestionForm({
                                          ...questionForm,
                                          correctAnswer: newCorrectAnswer,
                                        });
                                      }}
                                      className="rounded"
                                    />
                                    <label
                                      htmlFor={`${categoryIndex}-${optionIndex}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      {option?.startsWith("http") ? (
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={option}
                                            alt="Item"
                                            className="w-12 h-12 object-contain"
                                            onError={(e) => {
                                              (
                                                e.target as HTMLImageElement
                                              ).style.display = "none";
                                            }}
                                          />
                                          <span className="text-sm">
                                            Image: {option.substring(0, 30)}...
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm">
                                          {option}
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                )
                              )}
                              {(!questionForm.options ||
                                questionForm.options.length === 0) && (
                                <p className="text-gray-500 text-sm">
                                  Қолжетімді элементтер жоқ. Алдымен жоғарыда элементтерді қосыңыз.
                                </p>
                              )}
                            </div>

                            {/* Show assigned items */}
                            <div className="mt-2 p-2 bg-blue-50 rounded border">
                              <p className="text-sm font-medium text-blue-900">
                                Осы санаттағы элементтер ({itemsArray.length}):
                              </p>
                              {itemsArray.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {itemsArray.map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                                    >
                                      {item?.startsWith?.("http")
                                        ? `Сурет ${idx + 1}`
                                        : item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-blue-600 mt-1">
                                  Элементтер тағайындалмаған
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {Object.keys(
                  (questionForm.correctAnswer as Record<string, string[]>) || {}
                ).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                      Санаттар әлі жасалмаған. Бастау үшін &quot;Санат қосу&quot; түймесін басыңыз.
                    </p>
                  </div>
                )}
              </div>

              {/* Categories Section */}
            </CardContent>
          </Card>
        );

      default:
        return null;
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
              onClick={() =>
                router.push(`/courses/${courseId}/tests/${testId}/questions`)
              }
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Сұрақтарға оралу
            </Button>
          </div>

          {loading ? (
            <div>Жүктелуде...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : test && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">
                    {isNewQuestion
                      ? "Жаңа сұрақ қосу"
                      : "Сұрақты өңдеу"}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Тест: {test.title} • Курс: {course.title}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {
                        QUESTION_TYPES.find(
                          (t) => t.value === questionForm.type
                        )?.label
                      }
                    </Badge>
                    <Badge variant="outline">
                      {questionForm.points} ұпай
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
                      Сұрақты өңдеу
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
                        onClick={handleSaveQuestion}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Сақталуда..." : "Сұрақты сақтау"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Сұрақты өңдеу</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Сұрақ түрі</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select
                          value={questionForm.type}
                          onValueChange={handleQuestionTypeChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    {/* Question Text */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Сұрақ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Title field for fill-in-blanks */}
                        {questionForm.type === "fill-in-blanks" && (
                          <div>
                            <Label className="text-base font-semibold">
                              Сұрақ тақырыбы/Нұсқаулық
                            </Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              Студенттерге арналған негізгі нұсқаулық (мысалы,
                              &quot;Сөйлемдерді толықтырыңыз&quot;)
                            </p>
                            <Input
                              placeholder="мысалы, Төмендегі сөйлемдерді толықтырыңыз"
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
                              ? "Бос орындары бар сөйлем"
                              : "Сұрақ мәтіні"}
                          </Label>
                          {questionForm.type === "fill-in-blanks" && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Сөйлемде бос орындар жасау үшін _____ (5 асты сызық) қолданыңыз.
                            </p>
                          )}
                          <Textarea
                            placeholder={
                              questionForm.type === "fill-in-blanks"
                                  ? "мысалы, Мен күн сайын мектепке _____."
                                  : "Сұрағыңызды енгізіңіз"
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
                          Мазмұн (Медиа қолдауымен Markdown)
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
                            placeholder="Қосымша мазмұн, суреттер, аудио және т.б. қосыңыз..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Type-specific fields */}
                    {renderQuestionTypeSpecificFields()}

                    {/* Points */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ұпайлар</CardTitle>
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
                      Алдын ала қарау
                    </TabsTrigger>
                    <TabsTrigger
                      value="edit"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Өңдеу
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    <Card>
                      <CardHeader>
                        <CardTitle>Сұрақты алдын ала қарау</CardTitle>
                      </CardHeader>
                      <CardContent>{renderQuestionPreview()}</CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="edit">
                    <div className="space-y-6">
                      {/* Сұрақ түрі */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Сұрақ түрі</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Select
                            value={questionForm.type}
                            onValueChange={handleQuestionTypeChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QUESTION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      {/* Question Text */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Сұрақ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Title field for fill-in-blanks */}
                          {questionForm.type === "fill-in-blanks" && (
                            <div>
                              <Label className="text-base font-semibold">
                                Сұрақ тақырыбы/Нұсқаулығы
                              </Label>
                              <p className="text-sm text-muted-foreground mb-2">
                                Студенттерге арналған негізгі нұсқаулық (мысалы,
                                &quot;Сөйлемдерді аяқтаңыз&quot;)
                              </p>
                              <Input
                                placeholder="мысалы, Төмендегі сөйлемдерді аяқтаңыз"
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

                          {/* Question text */}
                          <div>
                            <Label className="text-base font-semibold">
                              {questionForm.type === "fill-in-blanks"
                                ? "Бос орындары бар сөйлем"
                               : "Сұрақ мәтіні"}
                            </Label>
                            {questionForm.type === "fill-in-blanks" && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Сөйлемде бос орындар жасау үшін _____ (5 асты сызық) қолданыңыз.
                              </p>
                            )}
                            <Textarea
                              placeholder={
                                questionForm.type === "fill-in-blanks"
                                  ? "мысалы, Мен күн сайын мектепке _____."
                                  : "Сұрағыңызды енгізіңіз"
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
                          Мазмұн (Медиа қолдауымен Markdown)
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
                              placeholder="Қосымша мазмұн, суреттер, аудио және т.б. қосыңыз..."
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Type-specific fields */}
                      {renderQuestionTypeSpecificFields()}

                      {/* Points */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Ұпайлар</CardTitle>
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
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          ) : (
            <div>Тест табылмады</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
