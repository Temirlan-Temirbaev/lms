"use client";
import { useRouter } from "next/navigation";

import { Badge } from "../ui/badge";
import { Edit, FileText, Settings, Trash2 } from "lucide-react";
import {
  UniversalDataTable,
  createActionsColumn,
} from "../universal-data-table";
import { ColumnDef } from "@tanstack/react-table";

interface PlacementTest {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface PlacementTestsTableProps {
  placementTests: PlacementTest[];
  onDeletePlacementTest: (testId: string) => void;
  variant?: "simple" | "detailed";
}

export function PlacementTestsTable({
  placementTests,
  onDeletePlacementTest,
  variant = "detailed",
}: PlacementTestsTableProps) {
  const router = useRouter();


  const handleEditPlacementTest = (test: PlacementTest) => {
    router.push(`/placement-tests/${test._id}`);
  };
  
  const handleRowClick = (test: PlacementTest) => {
    console.log("Row clicked for placement test:", test._id, test.title);
    router.push(`/placement-tests/${test._id}`);
  };

  const baseColumns: ColumnDef<PlacementTest>[] = [
    {
      accessorKey: "title",
      header: "Тақырып",
      cell: ({ row }) => (
        <div className="font-medium">{String(row.getValue("title"))}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Сипаттама",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {String(row.getValue("description")) || "Сипаттама жоқ"}
        </div>
      ),
    },
    {
      accessorKey: "questions",
      header: "Сұрақтар",
      cell: ({ getValue }) => (
        <Badge variant="outline">{(getValue() as any[])?.length || 0}</Badge>
      ),
    },
  ];

  const detailedColumns: ColumnDef<PlacementTest>[] = [
    ...baseColumns,
    {
      accessorKey: "timeLimit",
      header: "Уақыт шегі",
      cell: ({ getValue }) => `${Number(getValue()) || 0} минут`,
    },
    {
      accessorKey: "createdAt",
      header: "Жасалған",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? new Date(date).toLocaleDateString() : "Қолжетімді емес";
      },
    },
  ];

  const actionsColumn = createActionsColumn<PlacementTest>((test) => [
    {
      label: "Көру/Өңдеу",
      onClick: () => handleEditPlacementTest(test),
      icon: <Edit className="h-4 w-4" />,
    },
    ...(variant === "detailed"
      ? [
          {
            label: "Баптаулар",
            onClick: () => router.push(`/placement-tests/${test._id}`),
            icon: <Settings className="h-4 w-4" />,
          },
        ]
      : []),
  ]);

  const columns =
    variant === "detailed"
      ? [...detailedColumns, actionsColumn]
      : [...baseColumns, actionsColumn];

  return (
    <UniversalDataTable
      columns={columns}
      data={placementTests}
      onRowClick={handleRowClick}
    />
  );
}