import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Minus } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface TableBuilderDialogProps {
  onInsert: (markdown: string) => void;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TableBuilderDialog: React.FC<TableBuilderDialogProps> = ({
  onInsert,
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headers, setHeaders] = useState<string[]>([
    "Header 1",
    "Header 2",
    "Header 3",
  ]);
  const [tableData, setTableData] = useState<string[][]>([
    ["Cell 1", "Cell 2", "Cell 3"],
    ["Cell 4", "Cell 5", "Cell 6"],
  ]);

  const adjustRows = (newRows: number) => {
    if (newRows < 2) return;

    setRows(newRows);
    const dataRows = newRows - 1; // Subtract 1 for header row

    if (dataRows > tableData.length) {
      // Add rows
      const newData = [...tableData];
      for (let i = tableData.length; i < dataRows; i++) {
        newData.push(Array(cols).fill(""));
      }
      setTableData(newData);
    } else if (dataRows < tableData.length) {
      // Remove rows
      setTableData(tableData.slice(0, dataRows));
    }
  };

  const adjustCols = (newCols: number) => {
    if (newCols < 1) return;

    setCols(newCols);

    // Adjust headers
    if (newCols > headers.length) {
      const newHeaders = [...headers];
      for (let i = headers.length; i < newCols; i++) {
        newHeaders.push(`Header ${i + 1}`);
      }
      setHeaders(newHeaders);
    } else {
      setHeaders(headers.slice(0, newCols));
    }

    // Adjust data rows
    const newData = tableData.map((row) => {
      if (newCols > row.length) {
        const newRow = [...row];
        for (let i = row.length; i < newCols; i++) {
          newRow.push("");
        }
        return newRow;
      } else {
        return row.slice(0, newCols);
      }
    });
    setTableData(newData);
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };
  const generateMarkdown = () => {
    let markdown = "\n";

    // Header row
    markdown += "|" + headers.map((h) => ` ${h} `).join("|") + "|\n";

    // Separator row
    markdown += "|" + headers.map(() => "------").join("|") + "|\n";

    // Data rows
    tableData.forEach((row) => {
      markdown += "|" + row.map((cell) => ` ${cell} `).join("|") + "|\n";
    });

    markdown += "\n";
    return markdown;
  };
  const handleInsert = () => {
    const markdown = generateMarkdown();
    onInsert(markdown);
    setIsOpen(false);
  };

  const loadTemplate = (template: "comparison" | "vocabulary" | "grammar") => {
    switch (template) {
      case "comparison":
        setHeaders(["Feature", "Option A", "Option B"]);
        setTableData([
          ["Price", "$10", "$20"],
          ["Quality", "Good", "Better"],
          ["Support", "Email", "Phone + Email"],
        ]);
        setCols(3);
        setRows(4);
        break;
      case "vocabulary":
        setHeaders(["Қазақша", "Русский", "English"]);
        setTableData([
          ["сәлем", "привет", "hello"],
          ["рахмет", "спасибо", "thank you"],
          ["кешіріңіз", "извините", "excuse me"],
        ]);
        setCols(3);
        setRows(4);
        break;
      case "grammar":
        setHeaders(["Дыбыс түрі", "Қазақша", "Мысал"]);
        setTableData([
          ["Жуан дауысты", "а, о, ұ, ы", "бала, қол"],
          ["Жіңішке дауысты", "ә, е, і, ө, ү", "бәле, көл"],
        ]);
        setCols(3);
        setRows(3);
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Table Builder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Size Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Rows:</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustRows(rows - 1)}
                disabled={rows <= 2}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{rows}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustRows(rows + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Label>Cols:</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCols(cols - 1)}
                disabled={cols <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{cols}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCols(cols + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Templates */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("comparison")}
            >
              📊 Comparison
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("vocabulary")}
            >
              📚 Vocabulary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("grammar")}
            >
              📝 Grammar
            </Button>
          </div>

          {/* Table Editor */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="p-2 border-r last:border-r-0">
                      <Input
                        value={header}
                        onChange={(e) => updateHeader(index, e.target.value)}
                        className="text-center font-semibold"
                        placeholder={`Header ${index + 1}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t">
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="p-2 border-r last:border-r-0"
                      >
                        <Input
                          value={cell}
                          onChange={(e) =>
                            updateCell(rowIndex, colIndex, e.target.value)
                          }
                          placeholder={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsert}>Insert Table</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableBuilderDialog;
