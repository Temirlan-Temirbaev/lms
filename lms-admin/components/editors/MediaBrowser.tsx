/**
 * MediaBrowser Component
 *
 * This component is designed for selecting and inserting media files into content.
 * For file management operations (delete, rename, organize), a separate dedicated
 * file management page should be created to prevent accidental deletions and provide
 * better administrative controls.
 *
 * Features:
 * - Browse and search files
 * - Upload new files
 * - Select files for insertion
 * - Grid and list view modes
 * - Responsive modal sizing
 */

import React, { useState, useEffect, Fragment } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {
  FolderOpen,
  Image,
  Music,
  File,
  Upload,
  Search,
  Grid,
  List,
  Loader2,
  Folder,
  ArrowLeft,
  Home,
  FolderPlus,
  Plus,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../auth-context";

interface MediaFile {
  name: string;
  size: number;
  lastModified: string;
  etag: string;
  url: string;
  isFolder?: boolean;
  path?: string;
}

interface FolderStructure {
  [key: string]: {
    files: MediaFile[];
    subfolders: string[];
  };
}

interface MediaBrowserProps {
  onSelect: (file: MediaFile) => void;
  onUpload?: (file: File, path?: string) => Promise<void>;
  onPathChange?: (path: string) => void;
  acceptedTypes?: string[];
  children: React.ReactNode;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({
  onSelect,
  onUpload,
  onPathChange,
  acceptedTypes = ["image/*", "audio/*"],
  children,
}) => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "images" | "audio">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // File size limit (10MB default)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/files`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const allFiles = data.data || [];
        console.log("📁 Loaded files:", allFiles.length);
        console.log(
          "🔗 Sample URLs:",
          allFiles
            .slice(0, 3)
            .map((f: MediaFile) => ({ name: f.name, url: f.url }))
        );
        // Build folder structure
        const structure: FolderStructure = {};

        allFiles.forEach((file: MediaFile) => {
          console.log("Processing file:", file.name);
          const parts = file.name.split("/");

          if (parts.length > 1) {
            // File is in a folder
            const folderPath = parts.slice(0, -1).join("/");
            const fileName = parts[parts.length - 1];

            console.log("Found folder:", folderPath, "with file:", fileName);

            if (!structure[folderPath]) {
              structure[folderPath] = { files: [], subfolders: [] };
            }

            structure[folderPath].files.push({
              ...file,
              name: fileName,
              path: file.name,
            });

            // Also ensure parent folders exist
            let currentPath = "";
            parts.slice(0, -1).forEach((part, index) => {
              const parentPath = currentPath;
              currentPath = currentPath ? `${currentPath}/${part}` : part;

              if (!structure[currentPath]) {
                structure[currentPath] = { files: [], subfolders: [] };
              }

              if (
                parentPath &&
                !structure[parentPath].subfolders.includes(part)
              ) {
                structure[parentPath].subfolders.push(part);
              }
            });
          } else {
            // File is in root
            if (!structure[""]) {
              structure[""] = { files: [], subfolders: [] };
            }

            structure[""].files.push({
              ...file,
              path: file.name,
            });
          }
        });

        // Build subfolder lists for root
        Object.keys(structure).forEach((folderPath) => {
          if (folderPath && !folderPath.includes("/")) {
            // This is a top-level folder
            if (!structure[""]) {
              structure[""] = { files: [], subfolders: [] };
            }
            if (!structure[""].subfolders.includes(folderPath)) {
              structure[""].subfolders.push(folderPath);
            }
          }
        });
        console.log("Built folder structure:", structure);
        // If no folders detected, let's check what we got
        const hasFolders = Object.keys(structure).some((key) => key !== "");
        console.log("Has folders:", hasFolders);
        console.log("Root folder contents:", structure[""]);

        // If no natural folder structure exists, create virtual folders by file type
        if (!hasFolders && structure[""] && structure[""].files.length > 0) {
          console.log(
            "No folder structure detected, creating virtual folders by file type"
          );

          // Reset structure to create virtual folders
          const virtualStructure: FolderStructure = {
            "": { files: [], subfolders: ["images", "audio", "documents"] },
            images: { files: [], subfolders: [] },
            audio: { files: [], subfolders: [] },
            documents: { files: [], subfolders: [] },
          };

          structure[""].files.forEach((file) => {
            if (file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
              virtualStructure["images"].files.push({
                ...file,
                path: `images/${file.name}`,
              });
            } else if (file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
              virtualStructure["audio"].files.push({
                ...file,
                path: `audio/${file.name}`,
              });
            } else {
              virtualStructure["documents"].files.push({
                ...file,
                path: `documents/${file.name}`,
              });
            }
          });

          console.log("Created virtual folder structure:", virtualStructure);
          setFolderStructure(virtualStructure);
        } else {
          setFolderStructure(structure);
        }
        setFiles(allFiles);
      } else {
        console.error("Failed to load files:", response.status);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload files using dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((error) => {
          if (error.code === "file-too-large") {
            return `File "${
              file.name
            }" is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
          }
          if (error.code === "file-invalid-type") {
            return `File "${
              file.name
            }" has invalid type. Accepted types: ${acceptedTypes.join(", ")}.`;
          }
          return `File "${file.name}": ${error.message}`;
        });
        return errorMessages.join(" ");
      });

      setUploadStatus(`Upload failed: ${errors.join(" ")}`);
      setTimeout(() => setUploadStatus(null), 5000);
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploading(true);
        setUploadStatus(null);
        try {
          for (const file of acceptedFiles) {
            // Double-check file size on our end too
            if (file.size > MAX_FILE_SIZE) {
              throw new Error(
                `File "${
                  file.name
                }" is too large. Maximum size is ${formatFileSize(
                  MAX_FILE_SIZE
                )}.`
              );
            }

            // Use provided onUpload function or internal upload
            if (onUpload) {
              await onUpload(file, currentPath);
            } else {
              const result = await internalUpload(file, currentPath);
              console.log("Upload result:", result);
            }
          }
          setUploadStatus(
            `Successfully uploaded ${acceptedFiles.length} file${
              acceptedFiles.length > 1 ? "s" : ""
            }`
          );
          // Reload files after upload
          loadFiles();
          // Clear success message after 3 seconds
          setTimeout(() => setUploadStatus(null), 3000);
        } catch (error) {
          console.error("Error uploading file:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setUploadStatus(`Failed to upload files: ${errorMessage}`);
          setTimeout(() => setUploadStatus(null), 5000);
        } finally {
          setUploading(false);
        }
      }
    },
  });

  // Internal upload function
  const internalUpload = async (file: File, uploadPath?: string) => {
    if (!token) throw new Error("No authentication token");

    // Remove spaces and special characters from filename
    const sanitizedFileName = file.name
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, underscores and hyphens
      .replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    console.log("Frontend upload debug:", {
      originalFileName: file.name,
      sanitizedFileName: sanitizedFileName,
      fileNameEncoded: encodeURIComponent(sanitizedFileName),
      fileNameBytes: [...new TextEncoder().encode(sanitizedFileName)],
      fileNameLength: sanitizedFileName.length,
    });

    const formData = new FormData();
    formData.append("file", file);
    // Send the sanitized filename separately
    formData.append("filename", sanitizedFileName);
    if (uploadPath) {
      formData.append("path", uploadPath);
    }

    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (
        value &&
        typeof value === "object" &&
        "name" in value &&
        "size" in value
      ) {
        // This is likely a File object
        const fileValue = value as File;
        console.log(
          `${key}: File(name="${fileValue.name}", size=${fileValue.size})`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    return await response.json();
  };

  // Create folder function
  const createFolder = async (folderName: string) => {
    if (!token) throw new Error("No authentication token");
    if (!folderName.trim()) throw new Error("Folder name cannot be empty");

    // Sanitize folder name - allow international characters, only remove dangerous file system characters
    const sanitizedName = folderName
      .trim()
      // Remove only dangerous file system characters, keep international characters
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      // Replace multiple spaces with single space, then convert spaces to hyphens
      .replace(/\s+/g, " ")
      .replace(/ /g, "-");
    if (!sanitizedName) throw new Error("Invalid folder name");

    const folderPath = currentPath
      ? `${currentPath}/${sanitizedName}`
      : sanitizedName;

    // Check if folder already exists
    if (folderStructure[folderPath]) {
      throw new Error("Folder already exists");
    }

    // For now, we'll create the folder structure locally
    // When files are uploaded to this folder, the folder will be created on the server
    const newStructure = { ...folderStructure };
    newStructure[folderPath] = { files: [], subfolders: [] };

    // Update parent folder's subfolders
    if (currentPath) {
      if (!newStructure[currentPath]) {
        newStructure[currentPath] = { files: [], subfolders: [] };
      }
      if (!newStructure[currentPath].subfolders.includes(sanitizedName)) {
        newStructure[currentPath].subfolders.push(sanitizedName);
      }
    } else {
      if (!newStructure[""]) {
        newStructure[""] = { files: [], subfolders: [] };
      }
      if (!newStructure[""].subfolders.includes(sanitizedName)) {
        newStructure[""].subfolders.push(sanitizedName);
      }
    }

    setFolderStructure(newStructure);
    return sanitizedName;
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      await createFolder(newFolderName);
      setUploadStatus(`Folder "${newFolderName}" created successfully`);
      setNewFolderName("");
      setShowCreateFolder(false);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error("Error creating folder:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUploadStatus(`Failed to create folder: ${errorMessage}`);
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setCreatingFolder(false);
    }
  };

  // Get current folder contents
  const getCurrentFolderContents = () => {
    const currentFolder = folderStructure[currentPath] || {
      files: [],
      subfolders: [],
    };
    const folderItems: MediaFile[] = [];

    console.log("Getting contents for path:", currentPath);
    console.log("Current folder:", currentFolder);
    console.log("Available folders:", Object.keys(folderStructure));

    // Add subfolders as folder items
    currentFolder.subfolders.forEach((folderName) => {
      folderItems.push({
        name: folderName,
        size: 0,
        lastModified: "",
        etag: "",
        url: "",
        isFolder: true,
        path: currentPath ? `${currentPath}/${folderName}` : folderName,
      });
    });

    // Add files
    folderItems.push(...currentFolder.files);

    console.log("Folder items:", folderItems);
    return folderItems;
  };

  // Navigation functions
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSearchTerm(""); // Clear search when navigating
    // Notify parent component about path change
    onPathChange?.(folderPath);
  };

  const navigateUp = () => {
    if (currentPath) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      setCurrentPath(parentPath);
      setSearchTerm("");
      onPathChange?.(parentPath);
    }
  };

  const navigateToRoot = () => {
    setCurrentPath("");
    setSearchTerm("");
    onPathChange?.("");
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    if (!currentPath) return [{ name: "Root", path: "" }];

    const parts = currentPath.split("/");
    const breadcrumbs = [{ name: "Root", path: "" }];

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join("/");
      breadcrumbs.push({ name: part, path });
    });

    return breadcrumbs;
  };
  // Filter files based on search term and type filter
  const filteredFiles = getCurrentFolderContents().filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;

    // Don't filter folders
    if (file.isFolder) return matchesSearch;

    const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    const isAudio = file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i);

    if (filter === "images") return matchesSearch && isImage;
    if (filter === "audio") return matchesSearch && isAudio;

    return matchesSearch;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  // Get file type icon
  const getFileIcon = (file: MediaFile) => {
    if (file.isFolder) {
      return <Folder className="h-4 w-4" />;
    }
    if (file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return <Image className="h-4 w-4" />;
    }
    if (file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      return <Music className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  }; // Load files when dialog opens
  useEffect(() => {
    if (open && token) {
      setCurrentPath(""); // Reset to root when opening
      loadFiles();
    }
  }, [open, token]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`w-[95vw] max-h-[95vh] h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${
          viewMode === "list" ? "max-w-4xl" : "max-w-7xl"
        }`}
        style={{
          maxWidth: viewMode === "list" ? "56rem" : "80rem", // 4xl = 56rem, 7xl = 80rem
        }}
      >
        {" "}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Media Browser
            <span className="text-sm font-normal text-gray-500 ml-2">
              • Select files to insert
            </span>
          </DialogTitle>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Home className="h-4 w-4" />{" "}
            {getBreadcrumbs().map((breadcrumb, index) => (
              <Fragment key={breadcrumb.path}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <button
                  onClick={() => navigateToFolder(breadcrumb.path)}
                  className={`hover:text-blue-600 ${
                    breadcrumb.path === currentPath
                      ? "font-medium text-blue-600"
                      : ""
                  }`}
                >
                  {breadcrumb.name}
                </button>
              </Fragment>
            ))}
            {currentPath && (
              <button
                onClick={navigateUp}
                className="ml-2 p-1 hover:bg-gray-100 rounded"
                title="Жоғарғы деңгейге көтерілу"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>
        <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="browse">Файлдарды шолу</TabsTrigger>
            <TabsTrigger value="upload">Жаңаларын жүктеу</TabsTrigger>
          </TabsList>
          <TabsContent
            value="browse"
            className="flex-1 flex flex-col space-y-4 min-h-0"
          >
            {/* Search and Filter Controls */}
            <div className="flex gap-4 items-center flex-shrink-0 flex-wrap">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Файлдарды іздеу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Барлығы
                </Button>
                <Button
                  variant={filter === "images" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("images")}
                >
                  Суреттер
                </Button>
                <Button
                  variant={filter === "audio" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("audio")}
                >
                  Аудио
                </Button>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateFolder(!showCreateFolder)}
                  title="Жаңа қалта жасау"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Create Folder Input */}
            {showCreateFolder && (
              <div className="flex gap-2 items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <Input
                  placeholder="Қалта атауын енгізіңіз... (орысша, қазақша, العربية, 中文, т.б. қолдау көрсетіледі)"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !creatingFolder) {
                      handleCreateFolder();
                    }
                    if (e.key === "Escape") {
                      setShowCreateFolder(false);
                      setNewFolderName("");
                    }
                  }}
                  className="flex-1"
                  disabled={creatingFolder}
                />
                <Button
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || creatingFolder}
                >
                  {creatingFolder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName("");
                  }}
                  disabled={creatingFolder}
                >
                  Отмена
                </Button>
              </div>
            )}

            {/* Files Display */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                {" "}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                    <div className="text-gray-500">Загрузка файлов...</div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
                    <div className="text-gray-500 text-lg mb-2">
                      Файлы не найдены
                    </div>
                    <div className="text-gray-400 text-sm">
                      {searchTerm
                          ? `"${searchTerm}" сәйкес келетін файлдар жоқ`
                        : "Жұмысты бастау үшін файлдарды жүктеңіз"}
                    </div>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-6">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.name}
                        className="border rounded-lg p-4 hover:shadow-lg cursor-pointer group transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          if (file.isFolder) {
                            navigateToFolder(file.path!);
                          } else {
                            onSelect(file);
                            setOpen(false);
                          }
                        }}
                      >
                        {" "}
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden shadow-inner">
                          {file.isFolder ? (
                            <div className="flex flex-col items-center gap-3">
                              <Folder className="h-16 w-16 text-blue-500" />
                              <span className="text-sm text-gray-600 font-medium">
                                Папка
                              </span>
                            </div>
                          ) : file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover rounded-lg"
                              loading="lazy"
                              onLoad={(e) => {
                                console.log(
                                  "Image loaded successfully:",
                                  file.url
                                );
                              }}
                              onError={(e) => {
                                console.error(
                                  "Failed to load image:",
                                  file.url
                                );
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                  <div class="flex flex-col items-center gap-3">
                                    <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="text-sm text-gray-500 text-center">Failed to load<br/><small class="text-xs opacity-75">${file.name}</small></span>
                                  </div>
                                `;
                                }
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="text-gray-400">
                                {getFileIcon(file)}
                              </div>
                              <span className="text-sm text-gray-500 font-medium">
                                {file.isFolder
                                  ? "FOLDER"
                                  : file.name.split(".").pop()?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div
                            className="text-sm font-medium truncate text-center"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {formatFileSize(file.size)}
                          </div>{" "}
                          <div className="text-xs text-gray-400 text-center bg-gray-50 py-1 px-2 rounded">
                            {file.isFolder
                              ? "Click to open"
                              : "Click to select"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md cursor-pointer group transition-all duration-200 hover:bg-gray-50"
                        onClick={() => {
                          if (file.isFolder) {
                            navigateToFolder(file.path!);
                          } else {
                            onSelect(file);
                            setOpen(false);
                          }
                        }}
                      >
                        {" "}
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {file.isFolder ? (
                            <Folder className="h-6 w-6 text-blue-500" />
                          ) : file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover rounded-lg"
                              loading="lazy"
                              onLoad={() =>
                                console.log("List view image loaded:", file.url)
                              }
                              onError={(e) => {
                                console.error(
                                  "List view image failed:",
                                  file.url
                                );
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex items-center justify-center h-full">
                                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              {getFileIcon(file)}
                            </div>
                          )}
                        </div>{" "}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {file.isFolder && (
                              <Folder className="inline h-4 w-4 mr-2 text-blue-500" />
                            )}
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            {file.isFolder ? (
                              <span>Folder</span>
                            ) : (
                              <>
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    file.lastModified
                                  ).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                  {file.name.split(".").pop()?.toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          {file.isFolder ? "Click to open" : "Click to select"}
                        </div>
                      </div>
                    ))}{" "}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>{" "}
          <TabsContent value="upload" className="flex-1 min-h-0">
            <div className="space-y-4">
              {/* Current upload path indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Upload location:</strong> /{currentPath || "root"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Navigate to different folders above to change upload location
                </p>
              </div>

              {uploadStatus && (
                <div
                  className={`p-3 rounded-md ${
                    uploadStatus.includes("Successfully")
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {uploadStatus}
                </div>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-400 bg-blue-50"
                    : uploading
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${uploading ? "pointer-events-none" : ""}`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <>
                    <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium mb-2">
                      Uploading files...
                    </p>
                    <p className="text-sm text-gray-500">
                      Please wait while we upload your files
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {isDragActive
                        ? "Drop files here..."
                        : "Drag & drop files here, or click to select"}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Supports: {acceptedTypes.join(", ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Files with duplicate names will be automatically renamed
                      (e.g., "image (2).jpg")
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ✓ International characters supported: русский, қазақ,
                      العربية, 中文
                    </p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaBrowser;
