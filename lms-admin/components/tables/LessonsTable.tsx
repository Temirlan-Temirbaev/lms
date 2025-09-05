"use client";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import {
  UniversalDataTable,
  createActionsColumn,
} from "../universal-data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  courseId?: string;
  course?: string | { _id: string; title: string; level: string };
}

interface LessonsTableProps {
  lessons: Lesson[];
  courseId: string;
  onDeleteLesson: (lessonId: string) => void;
  variant?: "simple" | "detailed";
}

export function LessonsTable({
  lessons,
  courseId,
  onDeleteLesson,
  variant = "simple",
}: LessonsTableProps) {
  const router = useRouter();

  const handleEditLesson = (lesson: Lesson) => {
    router.push(`/courses/${courseId}/lessons/${lesson._id}`);
  };

  const columns: ColumnDef<Lesson>[] = [
    {
      accessorKey: "order",
      header: "Реті",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() =>
            router.push(`/courses/${courseId}/lessons/${row.original._id}`)
          }
        >
          {String(row.getValue("order"))}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: "Атауы",
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:text-blue-600 font-medium"
          onClick={() =>
            router.push(`/courses/${courseId}/lessons/${row.original._id}`)
          }
        >
          {String(row.getValue("title"))}
        </div>
      ),
    },
    createActionsColumn<Lesson>((lesson) => [
      {
        label: "Қарау/Өңдеу",
        onClick: () => handleEditLesson(lesson),
        icon: <Edit className="h-4 w-4" />,
      },
      {
        label: "Жою",
        onClick: () => onDeleteLesson(lesson._id),
        isDanger: true,
        separator: true,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ]),
  ];

  return <UniversalDataTable columns={columns} data={lessons} />;
}
