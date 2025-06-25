import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add this type for action items
export type ActionItem = {
  label: string;
  onClick: () => void;
  isDanger?: boolean;
  separator?: boolean;
  hidden?: boolean;
};

// Add this utility function to create action columns
export function createActionsColumn<T>(
  actions: (item: T) => ActionItem[]
): ColumnDef<T> {
  return {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const itemActions = actions(row.original).filter(
        (action) => !action.hidden
      );

      if (itemActions.length === 0) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {itemActions.map((action, index) => (
              <React.Fragment key={index}>
                {action.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={action.onClick}
                  className={action.isDanger ? "text-red-600" : ""}
                >
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  // Tab props
  showTabs?: boolean;
  tabs?: {
    value: string;
    label: string;
    count?: number;
    columns: ColumnDef<any>[];
    data: any[];
    createButton?: React.ReactNode;
  }[];
  defaultTab?: string;
  onTabChange?: (value: string) => void;
};

export function UniversalDataTable<T>({
  columns,
  data,
  onRowClick,
  showTabs = false,
  tabs = [],
  defaultTab,
  onTabChange,
}: DataTableProps<T>) {
  const [activeTab, setActiveTab] = React.useState(
    defaultTab || tabs[0]?.value || ""
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const renderTable = (tableColumns: ColumnDef<any>[], tableData: any[]) => {
    const table = useReactTable({
      columns: tableColumns,
      data: tableData,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  Нет результатов.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // If no tabs, render regular table
  if (!showTabs || tabs.length === 0) {
    return renderTable(columns, data);
  }

  // Render with tabs
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex gap-2">
          {tabs.find((tab) => tab.value === activeTab)?.createButton}
        </div>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {renderTable(tab.columns, tab.data)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
