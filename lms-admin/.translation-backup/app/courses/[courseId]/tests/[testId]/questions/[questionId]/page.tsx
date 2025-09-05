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
  { value: "multiple-choice", label: "Множественный выбор" },
  { value: "matching", label: "Сопоставление" },
  { value: "ordering", label: "Упорядочивание" },
  { value: "fill-in-blanks", label: "Заполнение пропусков" },
  { value: "input", label: "Текстовый ввод" },
  { value: "categories", label: "Категории" },
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
    explanation: "Объяснение не предоставлено", // Dummy explanation
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
            {question.type === "fill-in-blanks"
              ? question.title || "Введите заголовок вопроса"
              : question.question || "Введите ваш вопрос"}
          </h3>
          {question.content && renderQuestionContent(question.content)}
        </div>

        {question.type === "multiple-choice" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3">
              Выберите правильный ответ:
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
                  {option || `Вариант ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {question.type === "matching" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-3">Сопоставьте элементы:</p>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1 p-3 border rounded-lg bg-slate-50">
                  {option || `Элемент ${index + 1}`}
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex-1 p-3 border rounded-lg bg-blue-50">
                  <div className="text-slate-700">
                    {(question.correctAnswer as string[])?.[index] ||
                      "Соответствие не установлено"}
                  </div>
                </div>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <p className="text-slate-500 italic">
                Пары для сопоставления еще не настроены.
              </p>
            )}
          </div>
        )}

        {question.type === "ordering" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3">
              Расположите элементы в правильном порядке:
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

            <p className="text-sm text-slate-600 mb-3">Заполните пропуски:</p>
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
                          <strong>Note:</strong> This question has{" "}
                          {parts.length - 1} blanks. Students will fill each
                          blank separately.
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-2">
                    No blanks defined yet. Use _____ in your question to create
                    blanks.
                  </p>
                  <input
                    type="text"
                    disabled
                    className="w-full max-w-md p-2 border rounded bg-white"
                    placeholder="Answer will appear here"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {question.type === "input" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-3">Enter your answer:</p>
            <input
              type="text"
              disabled
              className="w-full p-3 border rounded-lg bg-slate-50"
              value={
                Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(" / ")
                  : question.correctAnswer || ""
              }
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {question.type === "categories" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-3">
              Drag items to the correct categories:
            </p>

            {/* Available items */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Available Items ({question.options?.length || 0}):
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
                        <span className="text-xs">Image {index + 1}</span>
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
                              Категория изображения
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
                                Expected items ({itemsArray.length}):
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
                                        <span>Image Item</span>
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
                              No items assigned
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
            Тип вопроса:{" "}
            {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
          </div>
          <div className="text-sm font-medium text-slate-600">
            Баллы: {question.points}
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
        setError("Failed to fetch test data");
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
      explanation: "Объяснение не предоставлено", // Always set dummy explanation
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
        alert(data.message || "Failed to save question");
      }
    } catch {
      alert("Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    const newForm: Question = {
      ...questionForm,
      type: type as Question["type"],
      explanation: "Объяснение не предоставлено", // Always keep dummy explanation
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
          "Category 1": [],
          "Category 2": [],
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
              <CardTitle>Вопрос с множественным выбором</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new option input */}
              <div>
                <Label className="text-base font-semibold">Add Options</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Enter new option..."
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
                    Add Option
                  </Button>
                </div>
              </div>

              {/* Configure Options */}
              <div>
                <Label className="text-base font-semibold">
                  Configure Options
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
                          placeholder={`Option ${String.fromCharCode(
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

                      {/* Выбор правильного ответа */}
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
                          Correct
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
                        No options yet. Add options above to get started.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.options && questionForm.options.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Инструкции:</strong> Студенты увидят эти варианты
                      и должны выбрать правильный ответ. Убедитесь, что отметили
                      один вариант как правильный, используя переключатели.
                    </p>
                  </div>
                )}

                {/* Warning if no correct answer selected */}
                {questionForm.options &&
                  questionForm.options.length > 0 &&
                  !questionForm.correctAnswer && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> Please select which option is
                        правильный ответ.
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
              <CardTitle>Вопрос на сопоставление</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add/Remove Items */}
              <div>
                <Label className="text-base font-semibold">Manage Items</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Enter new item to match..."
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
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Matching Pairs with Preview Style */}
              <div>
                <Label className="text-base font-semibold">
                  Configure Matches
                </Label>
                <div className="mt-3 space-y-3">
                  {questionForm.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50"
                    >
                      {/* Left side - Item */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder={`Item ${index + 1}`}
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

                      {/* Right side - Match */}
                      <div className="flex-1">
                        <Input
                          placeholder={`Correct match for "${
                            option || `Item ${index + 1}`
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
                        Пар для сопоставления пока нет. Добавьте элементы выше,
                        чтобы начать.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.options && questionForm.options.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Instructions:</strong> Each item on the left
                      should have its correct match on the right. Students will
                      need to match these pairs correctly.
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
              <CardTitle>Ordering Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new item input */}
              <div>
                <Label className="text-base font-semibold">Add Items</Label>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Enter item to be ordered..."
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
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Correct Order Management */}
              <div>
                <Label className="text-base font-semibold">
                  Correct Order (drag to reorder)
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
                            placeholder={`Item ${index + 1}`}
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
                        No items yet. Add items above to get started.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {questionForm.correctAnswer &&
                  (questionForm.correctAnswer as string[]).length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong> Students will see these
                        items in random order and need to arrange them in the
                        correct sequence shown above.
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
              <CardTitle>Fill in Blanks Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <div>
                <Label className="text-base font-semibold">
                  Question Title/Instruction
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Основная инструкция для студентов (например, &quot;Завершите
                  предложения&quot;)
                </p>
                <Input
                  placeholder="e.g., Complete the sentences below"
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
                  Sentence with Blanks
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Use _____ (5 underscores) to create blanks in your sentence.
                  Each _____ will become an input field for students.
                </p>
                <Textarea
                  placeholder="e.g., I _____ to school every day and _____ my homework."
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
                      <strong>Blanks detected:</strong>{" "}
                      {(questionForm.question.match(/_____/g) || []).length}{" "}
                      blank(s)
                    </p>
                  </div>
                )}
              </div>

              {/* Correct Answers */}
              <div>
                <Label className="text-base font-semibold">
                  Правильные ответы
                </Label>
                {(() => {
                  const blankCount = (
                    questionForm.question.match(/_____/g) || []
                  ).length;

                  if (blankCount === 0) {
                    return (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-gray-500">
                          Add _____ to your sentence above to create blanks,
                          then configure answers here.
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
                        Настройте правильные ответы для каждого пропуска. Вы
                        можете предоставить несколько приемлемых ответов для
                        каждого пропуска.
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
                              Пропуск {index + 1} - Правильные ответы
                            </Label>
                            <Textarea
                              placeholder="Введите правильные ответы (по одному на строку)&#10;например:&#10;идти&#10;ходить"
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
                  How it works:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Title:</strong> Shows as the main instruction to
                    students
                  </li>
                  <li>
                    • <strong>Sentence:</strong> Each _____ becomes an input
                    field
                  </li>
                  <li>
                    • <strong>Ответы:</strong> Ответы студентов проверяются
                    против ваших правильных ответов
                  </li>
                  <li>
                    • <strong>Несколько ответов:</strong> Вы можете принимать
                    разные правильные ответы для каждого пропуска
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
              <CardTitle>Text Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Правильный(е) ответ(ы)</Label>
                <Textarea
                  placeholder="Введите возможные правильные ответы (по одному на строку)"
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
              <CardTitle>Категории</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Available Items
                </Label>

                {/* Add new item input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Enter item text or image URL..."
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
                    Добавить элемент
                  </Button>
                </div>

                {/* Display current items as removable tags */}
                <div className="mt-4">
                  {questionForm.options && questionForm.options.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Текущие элементы ({questionForm.options.length}):
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
                                  Изображение {index + 1}
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
                              title="Удалить элемент"
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
                        Элементы еще не добавлены. Введите текст выше и нажмите
                        Enter или нажмите &quot;Добавить элемент&quot;.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Categories Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Категории</Label>
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
                    Добавить категорию
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
                                Название категории/URL
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  placeholder="Название категории или URL изображения"
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
                                    Обзор изображений
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
                              Удалить категорию
                            </Button>
                          </div>

                          {/* Category Preview */}
                          {category && (
                            <div className="p-2 border rounded bg-gray-50">
                              {category.startsWith("http") ? (
                                <div className="text-center">
                                  <img
                                    src={category}
                                    alt="Предварительный просмотр категории"
                                    className="max-w-full max-h-20 mx-auto object-contain"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Категория изображения
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
                              Выберите элементы для этой категории
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
                                  No items available. Add items above first.
                                </p>
                              )}
                            </div>

                            {/* Show assigned items */}
                            <div className="mt-2 p-2 bg-blue-50 rounded border">
                              <p className="text-sm font-medium text-blue-900">
                                Элементы в этой категории ({itemsArray.length}):
                              </p>
                              {itemsArray.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {itemsArray.map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                                    >
                                      {item?.startsWith?.("http")
                                        ? `Изображение ${idx + 1}`
                                        : item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-blue-600 mt-1">
                                  Элементы не назначены
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
                      Категории еще не созданы. Нажмите &quot;Добавить
                      категорию&quot;, чтобы начать.
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
              Назад к вопросам
            </Button>
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : test && course ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">
                    {isNewQuestion
                      ? "Создать новый вопрос"
                      : "Редактировать вопрос"}
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
                      {questionForm.points} баллов
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
                      Редактировать вопрос
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
                        onClick={handleSaveQuestion}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Сохранение..." : "Сохранить вопрос"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Редактировать вопрос</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Тип вопроса</CardTitle>
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
                        <CardTitle>Вопрос</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Title field for fill-in-blanks */}
                        {questionForm.type === "fill-in-blanks" && (
                          <div>
                            <Label className="text-base font-semibold">
                              Заголовок/Инструкция вопроса
                            </Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              Основная инструкция для студентов (например,
                              &quot;Завершите предложения&quot;)
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

                    {/* Points */}
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
                      value="edit"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Редактировать
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    <Card>
                      <CardHeader>
                        <CardTitle>Предварительный просмотр вопроса</CardTitle>
                      </CardHeader>
                      <CardContent>{renderQuestionPreview()}</CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="edit">
                    <div className="space-y-6">
                      {/* Тип вопроса */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Тип вопроса</CardTitle>
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
                          <CardTitle>Вопрос</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Title field for fill-in-blanks */}
                          {questionForm.type === "fill-in-blanks" && (
                            <div>
                              <Label className="text-base font-semibold">
                                Заголовок/Инструкция вопроса
                              </Label>
                              <p className="text-sm text-muted-foreground mb-2">
                                Основная инструкция для студентов (например,
                                &quot;Завершите предложения&quot;)
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

                          {/* Question text */}
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

                      {/* Points */}
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
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          ) : (
            <div>Тест не найден</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
