"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { createLowlight } from "lowlight";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import MediaInsertDialog from "./MediaInsertDialog";
import { Node, mergeAttributes } from "@tiptap/core";

// Configure turndown for HTML to markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "*",
  codeBlockStyle: "fenced",
  fence: "```",
  emDelimiter: "*",
  strongDelimiter: "**",
});

// Add rule to handle dummy links as underline (preserve as links in markdown)
turndownService.addRule("dummyLinks", {
  filter: function (node) {
    return node.nodeName === "A" && node.getAttribute("href") === "#";
  },
  replacement: function (content, node) {
    return "[" + content + "](#)";
  },
});

// Add rule to handle audio elements
turndownService.addRule("audio", {
  filter: function (node) {
    return node.nodeName === "AUDIO";
  },
  replacement: function (content, node) {
    const audioElement = node as HTMLAudioElement;
    const src = audioElement.getAttribute("src");
    const title = audioElement.getAttribute("title") || "audio";
    return `[${title}](${src})`;
  },
});

// Add rule to handle tables as markdown
// This will convert HTML tables to markdown tables
// Handles <table>, <thead>, <tbody>, <tr>, <th>, <td>
turndownService.addRule("tables", {
  filter: function (node) {
    return node.nodeName === "TABLE";
  },
  replacement: function (content, node) {
    let markdown = "";
    const table = node as HTMLTableElement;
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return "\n";
    // Header row
    const headerCells = rows[0].querySelectorAll("th,td");
    markdown +=
      "|" +
      Array.from(headerCells)
        .map((cell) => ` ${cell.textContent?.trim() || " "} `)
        .join("|") +
      "|\n";
    // Separator
    markdown +=
      "|" +
      Array.from(headerCells)
        .map(() => "------")
        .join("|") +
      "|\n";
    // Data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td,th");
      markdown +=
        "|" +
        Array.from(cells)
          .map((cell) => ` ${cell.textContent?.trim() || " "} `)
          .join("|") +
        "|\n";
    }
    return `\n${markdown}\n`;
  },
});

// Configure marked for markdown to HTML conversion
marked.setOptions({
  breaks: true,
  gfm: true,
});

const markdownToHtml = (markdown: string): string => {
  try {
    let html = marked(markdown) as string;

    // Convert audio links to audio elements
    html = html.replace(
      /<a href="([^"]*\.(mp3|m4a|ogg|wav|aac))"[^>]*>([^<]*)<\/a>/gi,
      '<audio src="$1" controls title="$3"></audio>'
    );

    // Handle audio markdown format like [audio](url)
    html = html.replace(
      /<a href="([^"]*)"[^>]*>audio<\/a>/gi,
      '<audio src="$1" controls></audio>'
    );

    return html;
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return markdown;
  }
};

const htmlToMarkdown = (html: string): string => {
  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error("Error converting HTML to markdown:", error);
    return html;
  }
};
import { Button } from "../ui/button";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Underline as UnderlineIcon,
  Table as TableIcon,
  CheckSquare,
  Palette,
  Highlighter,
  Undo,
  Redo,
  FolderIcon,
} from "lucide-react";

interface NotionEditorProps {
  content: string; // Markdown content
  onChange: (markdown: string) => void; // Output markdown
  placeholder?: string;
  className?: string;
  onTableInsert?: () => void; // Custom table insert function
}

export interface NotionEditorHandle {
  insertMarkdownAtCursor: (markdown: string) => void;
}

const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "audio[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["audio", mergeAttributes(HTMLAttributes, { controls: true }), 0];
  },
});

const NotionEditor = forwardRef<NotionEditorHandle, NotionEditorProps>(
  (
    {
      content,
      onChange,
      placeholder = "Start typing or press '/' for commands...",
      className = "",
      onTableInsert,
    },
    ref
  ) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full h-auto rounded-lg",
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "underline text-current cursor-text",
          },
        }),
        CodeBlockLowlight.configure({
          lowlight: createLowlight(),
          HTMLAttributes: {
            class:
              "bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto",
          },
        }),
        HorizontalRule.configure({
          HTMLAttributes: {
            class: "my-4 border-gray-300",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse border border-gray-300 w-full my-4",
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: "border border-gray-300",
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class:
              "border border-gray-300 bg-gray-100 px-3 py-2 font-semibold text-left",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: "border border-gray-300 px-3 py-2",
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: "not-prose pl-2",
          },
        }),
        TaskItem.configure({
          HTMLAttributes: {
            class: "flex items-start my-1",
          },
          nested: true,
        }),
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        Audio,
      ],
      content: markdownToHtml(content), // Convert markdown to HTML for editing
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const markdown = htmlToMarkdown(html);
        onChange(markdown); // Convert HTML back to markdown
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6",
        },
      },
      immediatelyRender: false,
    });

    // Imperative handle for parent to insert markdown at cursor
    useImperativeHandle(
      ref,
      () => ({
        insertMarkdownAtCursor: (markdown: string) => {
          if (!editor) return;
          const html = markdownToHtml(markdown);
          editor.chain().focus().insertContent(html).run();
        },
      }),
      [editor]
    );

    if (!isClient || !editor) {
      return (
        <div className="min-h-[400px] border border-gray-200 rounded-lg p-4 bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      );
    }

    const addImage = () => {
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    const addUnderline = () => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      if (selectedText) {
        // If text is selected, make it a link with dummy URL to render as underline
        editor.chain().focus().setLink({ href: "#" }).run();
      } else {
        // If no text is selected, insert placeholder underlined text with dummy link
        editor
          .chain()
          .focus()
          .insertContent('<a href="#">underlined text</a>')
          .run();
      }
    };
    const insertTable = () => {
      if (onTableInsert) {
        onTableInsert(); // Use custom table insert function if provided
      } else {
        // Default table insertion
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      }
    };

    return (
      <div className={`notion-editor-wrapper ${className}`}>
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>{" "}
          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("link", { href: "#" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => {
              const isActive = editor.isActive("link", { href: "#" });
              if (isActive) {
                editor.chain().focus().unsetLink().run();
              } else {
                editor.chain().focus().setLink({ href: "#" }).run();
              }
            }}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <div className="h-6 border-l border-gray-300 mx-1" />
          {/* Headings */}
          <Button
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="h-6 border-l border-gray-300 mx-1" />
          {/* Lists */}
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("taskList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <div className="h-6 border-l border-gray-300 mx-1" />
          {/* Blocks */}{" "}
          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="h-6 border-l border-gray-300 mx-1" />
          {/* Media & Links */}{" "}
          <MediaInsertDialog
            onInsert={(markdown) => {
              // Insert at cursor using the imperative handle or editor API
              if (editor) {
                const html = markdownToHtml(markdown);
                editor.chain().focus().insertContent(html).run();
              }
            }}
          >
            <Button variant="ghost" size="sm" title="Insert Media">
              <FolderIcon className="h-4 w-4" />
              <span className="sr-only">Insert Media</span>
            </Button>
          </MediaInsertDialog>
          <Button variant="ghost" size="sm" onClick={insertTable}>
            <TableIcon className="h-4 w-4" />
          </Button>
          {/* Highlight */}{" "}
          <Button
            variant={editor.isActive("highlight") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <div className="h-6 border-l border-gray-300 mx-1" />
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <div className="min-h-[400px] border border-gray-200 rounded-b-lg">
          <EditorContent editor={editor} />
        </div>

        <style jsx global>{`
          .ProseMirror {
            outline: none;
            padding: 1.5rem;
            min-height: 400px;
          }

          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
          }

          .ProseMirror h1,
          .ProseMirror h2,
          .ProseMirror h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: bold;
          }

          .ProseMirror h1 {
            font-size: 2rem;
          }

          .ProseMirror h2 {
            font-size: 1.5rem;
          }

          .ProseMirror h3 {
            font-size: 1.25rem;
          }
          .ProseMirror ul,
          .ProseMirror ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }

          .ProseMirror ul {
            list-style-type: disc;
          }

          .ProseMirror ol {
            list-style-type: decimal;
          }

          .ProseMirror ul li,
          .ProseMirror ol li {
            display: list-item;
            margin: 0.25rem 0;
          }

          .ProseMirror ul ul {
            list-style-type: circle;
          }

          .ProseMirror ul ul ul {
            list-style-type: square;
          }

          .ProseMirror blockquote {
            border-left: 4px solid #3b82f6;
            margin: 1rem 0;
            padding-left: 1rem;
            background: #f8fafc;
            padding: 1rem;
            border-radius: 0 6px 6px 0;
            font-style: italic;
          }

          .ProseMirror pre {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }

          .ProseMirror code {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
          }

          .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }

          .ProseMirror ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
          }

          .ProseMirror ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
          }

          .ProseMirror ul[data-type="taskList"] li > div {
            flex: 1 1 auto;
          }

          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1rem 0;
          }

          .ProseMirror table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 1rem 0;
            overflow: hidden;
          }

          .ProseMirror table td,
          .ProseMirror table th {
            min-width: 1em;
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
          }

          .ProseMirror table th {
            font-weight: bold;
            text-align: left;
            background: #f1f5f9;
          }

          .ProseMirror mark {
            background: #fef08a;
            border-radius: 2px;
            padding: 0.1rem 0.2rem;
          }

          .ProseMirror audio {
            width: 100%;
            margin: 1rem 0;
            border-radius: 36px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px;
          }
        `}</style>
      </div>
    );
  }
);

export default NotionEditor;
