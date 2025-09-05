"use client";
import { useRouter } from "next/navigation";
// import { useI18n } from "@/components/i18n-provider";
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
  // const { t } = useI18n();

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
      header: t('placementTests.title'),
      cell: ({ row }) => (
        <div className="font-medium">{String(row.getValue("title"))}</div>
      ),
    },
    {
      accessorKey: "description",
      header: t('placementTests.description'),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {String(row.getValue("description")) || t('placementTests.noDescription')}
        </div>
      ),
    },
    {
      accessorKey: "questions",
      header: t('questions.questions'),
      cell: ({ getValue }) => (
        <Badge variant="outline">{(getValue() as any[])?.length || 0}</Badge>
      ),
    },
  ];

  const detailedColumns: ColumnDef<PlacementTest>[] = [
    ...baseColumns,
    {
      accessorKey: "timeLimit",
      header: t('placementTests.timeLimit'),
      cell: ({ getValue }) => `${Number(getValue()) || 0} ${t('placementTests.minutes')}`,
    },
    {
      accessorKey: "createdAt",
      header: t('placementTests.created'),
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? new Date(date).toLocaleDateString() : t('common.notAvailable');
      },
    },
  ];

  const actionsColumn = createActionsColumn<PlacementTest>((test) => [
    {
      label: t('placementTests.viewEdit'),
      onClick: () => handleEditPlacementTest(test),
      icon: <Edit className="h-4 w-4" />,
    },
    ...(variant === "detailed"
      ? [
          {
            label: t('common.settings'),
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