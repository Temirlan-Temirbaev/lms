"use client";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Edit, Trash2, Users } from "lucide-react";
import {
  UniversalDataTable,
  createActionsColumn,
} from "../universal-data-table";
import { ColumnDef } from "@tanstack/react-table";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  progress: {
    currentLevel: string;
    availableLevels: string[];
    completedLessons: string[];
    completedTests: any[];
    placementTestTaken: boolean;
  };
  telephone?: string;
  gender?: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  variant?: "simple" | "detailed";
}

export function UsersTable({
  users,
  onDeleteUser,
  variant = "detailed",
}: UsersTableProps) {
  const router = useRouter();

  const handleEditUser = (user: User) => {
    router.push(`/users/${user._id}`);
  };

  const baseColumns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:text-blue-600 font-medium"
          onClick={() => router.push(`/users/${row.original._id}`)}
        >
          {String(row.getValue("name"))}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="text-gray-600">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => {
        const role = String(getValue());
        return (
          <Badge variant={role === "admin" ? "destructive" : "secondary"}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "progress.currentLevel",
      header: "Level",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.progress?.currentLevel || "A1"}
        </Badge>
      ),
    },
  ];

  const detailedColumns: ColumnDef<User>[] = [
    ...baseColumns,
    {
      accessorKey: "progress.placementTestTaken",
      header: "Placement Test",
      cell: ({ row }) =>
        row.original.progress?.placementTestTaken ? (
          <Badge variant="default">Taken</Badge>
        ) : (
          <Badge variant="secondary">Not Taken</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Создан",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },
  ];

  const actionsColumn = createActionsColumn<User>((user) => [
    {
      label: "Просмотр/Редактирование",
      onClick: () => handleEditUser(user),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Удалить",
      onClick: () => onDeleteUser(user._id),
      isDanger: true,
      separator: true,
      icon: <Trash2 className="h-4 w-4" />,
    },
  ]);

  const columns =
    variant === "detailed"
      ? [...detailedColumns, actionsColumn]
      : [...baseColumns, actionsColumn];

  return <UniversalDataTable columns={columns} data={users} />;
}
