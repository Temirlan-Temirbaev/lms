"use client";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Edit, FileText, Settings, Trash2 } from "lucide-react";
import {
  UniversalDataTable,
  createActionsColumn,
} from "../universal-data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Test {
  _id: string;
  title: string;
  description: string;
  order: number;
  course: string | { _id: string; title: string; level: string };
  questions: any[];
  passingScore: number;
  timeLimit: number;
  isFinal: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TestsTableProps {
  tests: Test[];
  courseId: string;
  onDeleteTest: (testId: string) => void;
  variant?: "simple" | "detailed";
}

export function TestsTable({
  tests,
  courseId,
  onDeleteTest,
  variant = "detailed",
}: TestsTableProps) {
  const router = useRouter();

  const handleEditTest = (test: Test) => {
    router.push(`/courses/${courseId}/tests/${test._id}`);
  };
  const handleRowClick = (test: Test) => {
    console.log("Row clicked for test:", test._id, test.title);
    router.push(`/courses/${courseId}/tests/${test._id}`);
  };

  const baseColumns: ColumnDef<Test>[] = [
    {
      accessorKey: "order",
      header: "Порядок",
      cell: ({ row }) => (
        <Badge variant="secondary">{String(row.getValue("order"))}</Badge>
      ),
    },
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="font-medium">{String(row.getValue("title"))}</div>
      ),
    },
    {
      accessorKey: "questions",
      header: "Вопросы",
      cell: ({ getValue }) => (
        <Badge variant="outline">{(getValue() as any[])?.length || 0}</Badge>
      ),
    },
  ];

  const detailedColumns: ColumnDef<Test>[] = [
    ...baseColumns,
    {
      accessorKey: "passingScore",
      header: "Проходной %",
      cell: ({ getValue }) => `${Number(getValue()) || 0}%`,
    },
    {
      accessorKey: "timeLimit",
      header: "Ограничение времени",
      cell: ({ getValue }) => `${Number(getValue()) || 0} мин`,
    },
    {
      accessorKey: "isFinal",
      header: "Тип",
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge variant="destructive">Финальный</Badge>
        ) : (
          <Badge variant="secondary">Обычный</Badge>
        ),
    },
  ];

  const actionsColumn = createActionsColumn<Test>((test) => [
    {
      label: "Просмотр/Редактирование",
      onClick: () => handleEditTest(test),
      icon: <Edit className="h-4 w-4" />,
    },
    ...(variant === "detailed"
      ? [
          {
            label: "Настройки",
            onClick: () =>
              router.push(`/courses/${courseId}/tests/${test._id}`),
            icon: <Settings className="h-4 w-4" />,
          },
        ]
      : []),
    {
      label: "Удалить",
      onClick: () => onDeleteTest(test._id),
      isDanger: true,
      separator: true,
      icon: <Trash2 className="h-4 w-4" />,
    },
  ]);

  const columns =
    variant === "detailed"
      ? [...detailedColumns, actionsColumn]
      : [...baseColumns, actionsColumn];

  return (
    <UniversalDataTable
      columns={columns}
      data={tests}
      onRowClick={handleRowClick}
    />
  );
}
