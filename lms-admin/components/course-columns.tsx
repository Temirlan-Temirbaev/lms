import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type Course = {
  _id: string;
  title: string;
  level: string;
  description: string;
};

export const courseColumns: ColumnDef<Course>[] = [
  { accessorKey: "title", header: "Атауы" },
  { accessorKey: "level", header: "Деңгей" },
  { accessorKey: "description", header: "Сипаттама" },
  {
    id: "actions",
    header: "Әрекеттер",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => alert("Өңдеу " + row.original._id)}>Өңдеу</Button>
        <Button size="sm" variant="destructive" onClick={() => alert("Жою " + row.original._id)}>Жою</Button>
      </div>
    ),
  },
];