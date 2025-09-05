import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type Course = {
  _id: string;
  title: string;
  level: string;
  description: string;
};

export const courseColumns: ColumnDef<Course>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "level", header: "Level" },
  { accessorKey: "description", header: "Description" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => alert("Edit " + row.original._id)}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={() => alert("Delete " + row.original._id)}>Delete</Button>
      </div>
    ),
  },
];