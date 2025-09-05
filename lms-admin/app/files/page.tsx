"use client";
import { useEffect, useState, Fragment } from "react";
import { useAuth } from "../../components/auth-context";
import { Button } from "../../components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Search,
  File,
  Image,
  Music,
  Loader2,
  Grid,
  List,
  FolderOpen,
  Folder,
  ArrowLeft,
  Home,
  FolderPlus,
  Plus,
  Download,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

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

export default function FilesPage() {
  const { isAuthenticated, token } = useAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "images" | "audio">("all");

  // Folder system states
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // File info dialog states
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [fileInfoOpen, setFileInfoOpen] = useState(false);

  // File size limit (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    setError("");
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

        // Build folder structure
        const structure: FolderStructure = {};

        allFiles.forEach((file: MediaFile) => {
          const parts = file.name.split("/");

          if (parts.length > 1) {
            // File is in a folder
            const folderPath = parts.slice(0, -1).join("/");
            const fileName = parts[parts.length - 1];

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
            parts.slice(0, -1).forEach((part) => {
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

        setFolderStructure(structure);
        setFiles(allFiles);
      } else {
        setError("Файлдарды жүктеу мүмкін болмады");
      }
    } catch (error) {
      console.error("Файлдарды жүктеу қатесі:", error);
      setError("Файлдарды жүктеу кезінде қате");
    } finally {
      setLoading(false);
    }
  };

  // Upload files using dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
      "audio/*": [],
    },
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((error) => {
          if (error.code === "file-too-large") {
            return `Файл "${
              file.name
            }" тым үлкен. Максималды өлшем ${formatFileSize(
              MAX_FILE_SIZE
            )}.`;
          }
          if (error.code === "file-invalid-type") {
            return `Файл "${file.name}" рұқсат етілмеген түрде. Тек суреттер мен аудио файлдарға рұқсат етіледі.`;
          }
          return `Файл "${file.name}": ${error.message}`;
        });
        return errorMessages.join(" ");
      });

      setUploadStatus(`Жүктеу сәтсіз аяқталды: ${errors.join(" ")}`);
      setTimeout(() => setUploadStatus(null), 5000);
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploading(true);
        setUploadStatus(null);
        try {
          let successCount = 0;
          for (const file of acceptedFiles) {
            await uploadFile(file, currentPath);
            successCount++;
          }
          setUploadStatus(
            `${successCount} файл сәтті жүктелді`
          );
          loadFiles(); // Reload files after upload
          setTimeout(() => setUploadStatus(null), 3000);
        } catch (error) {
          console.error("Файлды жүктеп салу қатесі:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Белгісіз қате";
          setUploadStatus(`Файлдарды жүктеу мүмкін болмады: ${errorMessage}`);
          setTimeout(() => setUploadStatus(null), 5000);
        } finally {
          setUploading(false);
        }
      }
    },
  });

  const uploadFile = async (file: File, uploadPath?: string) => {
    if (!token) throw new Error("Аутентификация токені жоқ");

    const sanitizedFileName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", sanitizedFileName);
    if (uploadPath) {
      formData.append("path", uploadPath);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Жүктеу сәтсіз аяқталды: ${response.status}`);
    }

    return await response.json();
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`"${filename}" файлын жоюға сенімдісіз бе?`)) return;

    setDeleting((prev) => new Set(prev).add(filename));
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/admin/upload/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.name !== filename));
        loadFiles(); // Reload to update folder structure
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Файлды жою сәтсіз аяқталды: ${errorData.message || "Белгісіз қате"}`);
      }
    } catch (error) {
      console.error("Файлды жою қатесі:", error);
      alert("Файлды жою кезінде қате");
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
    }
  };

  // Create folder function
  const createFolder = async (folderName: string) => {
    if (!token) throw new Error("Аутентификация токені жоқ");
    if (!folderName.trim()) throw new Error("Папка атауы бос болмауы керек");

    const sanitizedName = folderName
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .replace(/\s+/g, " ")
      .replace(/ /g, "-");
    if (!sanitizedName) throw new Error("Жарамсыз папка атауы");

    const folderPath = currentPath
      ? `${currentPath}/${sanitizedName}`
      : sanitizedName;

    // Check if folder already exists
    if (folderStructure[folderPath]) {
      throw new Error("Папка әлдеқашан бар");
    }

    // Create the folder structure locally
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
      setUploadStatus(`"${newFolderName}" папкасы сәтті құрылды`);
      setNewFolderName("");
      setShowCreateFolder(false);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error("Папка жасау қатесі:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Белгісіз қате";
      setUploadStatus(`Папканы құру сәтсіз аяқталды: ${errorMessage}`);
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

    return folderItems;
  };

  // Navigation functions
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSearchTerm(""); // Clear search when navigating
  };

  const navigateUp = () => {
    if (currentPath) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      setCurrentPath(parentPath);
      setSearchTerm("");
    }
  };

  const navigateToRoot = () => {
    setCurrentPath("");
    setSearchTerm("");
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    if (!currentPath) return [{ name: "Түбір", path: "" }];

    const parts = currentPath.split("/");
    const breadcrumbs = [{ name: "Түбір", path: "" }];

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join("/");
      breadcrumbs.push({ name: part, path });
    });

    return breadcrumbs;
  };

  const handleFileClick = (file: MediaFile) => {
    if (file.isFolder) {
      navigateToFolder(file.path!);
    } else {
      setSelectedFile(file);
      setFileInfoOpen(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

  useEffect(() => {
    if (isAuthenticated && token) {
      loadFiles();
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Файлдарды басқару</h1>
              <p className="text-gray-600 mt-1">
                Медиа файлдарды жүктеп, басқарыңыз
              </p>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Home className="h-4 w-4" />
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
            </div>
          </div>

          <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="browse">Файлдарды қарау</TabsTrigger>
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
                    title="Жаңа папка жасау"
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
                    placeholder="Папка атауын енгізіңіз..."
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
                    Болдырмау
                  </Button>
                </div>
              )}

              {/* Files Display */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                      <div className="text-gray-500">Файлдар жүктелуде...</div>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
                      <div className="text-gray-500 text-lg mb-2">
                        Файлдар табылмады
                      </div>
                      <div className="text-gray-400 text-sm">
                        {searchTerm
                          ? `"${searchTerm}" сәйкес файлдар жоқ`
                          : "Жұмысты бастау үшін файлдарды жүктеңіз"}
                      </div>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-6">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.name}
                          className="border rounded-lg p-4 hover:shadow-lg group transition-all duration-200 relative cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          {/* Delete button - only for files, not folders */}
                          {!file.isFolder && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.path || file.name);
                              }}
                              disabled={deleting.has(file.path || file.name)}
                            >
                              {deleting.has(file.path || file.name) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden shadow-inner">
                            {file.isFolder ? (
                              <div className="flex flex-col items-center gap-3">
                                <Folder className="h-16 w-16 text-blue-500" />
                                <span className="text-sm text-gray-600 font-medium">
                                  Қалта
                                </span>
                              </div>
                            ) : file.name.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i
                              ) ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                    <div class="flex flex-col items-center gap-3">
                                      <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                      <span class="text-sm text-gray-500 text-center">Жүктеу мүмкін болмады</span>
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
                                  {file.name.split(".").pop()?.toUpperCase()}
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
                            {!file.isFolder && (
                              <>
                                <div className="text-xs text-gray-500 text-center">
                                  {formatFileSize(file.size)}
                                </div>
                                <div className="text-xs text-gray-400 text-center">
                                  {new Date(
                                    file.lastModified
                                  ).toLocaleDateString()}
                                </div>
                              </>
                            )}
                            <div className="text-xs text-gray-400 text-center bg-gray-50 py-1 px-2 rounded">
                              {file.isFolder
                                ? "Ашу үшін басыңыз"
                  : "Ақпарат үшін басыңыз"}
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
                          className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md group transition-all duration-200 cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {file.isFolder ? (
                              <Folder className="h-6 w-6 text-blue-500" />
                            ) : file.name.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i
                              ) ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                                onError={(e) => {
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
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {file.isFolder && (
                                <Folder className="inline h-4 w-4 mr-2 text-blue-500" />
                              )}
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              {file.isFolder ? (
                                <span>Қалта</span>
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

                          {!file.isFolder && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.path || file.name);
                              }}
                              disabled={deleting.has(file.path || file.name)}
                            >
                              {deleting.has(file.path || file.name) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            {file.isFolder
                              ? "Ашу үшін басыңыз"
                    : "Ақпарат үшін басыңыз"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 min-h-0">
              <div className="space-y-4">
                {/* Current upload path indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Жүктеу орны:</strong> /{currentPath || "түбір"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Перейдите в разные папки выше, чтобы изменить место загрузки
                  </p>
                </div>

                {uploadStatus && (
                  <div
                    className={`p-3 rounded-md ${
                      uploadStatus.includes("Сәтті")
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
                        Файлдар жүктелуде...
                      </p>
                      <p className="text-sm text-gray-500">
                        Файлдарыңызды жүктеп жатқанда күте тұрыңыз
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {isDragActive
                          ? "Файлдарды осында сүйреңіз..."
                  : "Файлдарды осында сүйреңіз немесе таңдау үшін басыңыз"}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Қолдау көрсетіледі: Суреттер мен аудио файлдар
                      </p>
                      <p className="text-xs text-gray-400">
                        Файлдың максималды өлшемі:{" "}
                        {formatFileSize(MAX_FILE_SIZE)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Бірдей атаулы файлдар автоматты түрде
                        қайта аталады
                      </p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* File Info Dialog */}
          <Dialog open={fileInfoOpen} onOpenChange={setFileInfoOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedFile && getFileIcon(selectedFile)}
                  Файл туралы ақпарат
                </DialogTitle>
              </DialogHeader>

              {selectedFile && (
                <div className="space-y-6">
                  {/* File Preview */}
                  <div className="flex justify-center">
                    {selectedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={selectedFile.url}
                        alt={selectedFile.name}
                        className="max-w-full max-h-64 object-contain rounded-lg border"
                      />
                    ) : selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i) ? (
                      <audio
                        src={selectedFile.url}
                        controls
                        className="w-full max-w-md"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(selectedFile)}
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Атауы
                        </label>
                        <p
                          className="text-sm font-mono bg-gray-50 p-2 rounded truncate"
                          title={selectedFile.name}
                        >
                          {selectedFile.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Өлшемі
                        </label>
                        <p className="text-sm flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Изменен
                        </label>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedFile.lastModified).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Түрі
                        </label>
                        <p className="text-sm">
                          {selectedFile.name.match(
                            /\.(jpg|jpeg|png|gif|webp|svg)$/i
                          )
                            ? "Сурет"
                            : selectedFile.name.match(
                                /\.(mp3|wav|ogg|m4a|aac)$/i
                              )
                            ? "Аудио"
                            : "Файл"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => window.open(selectedFile.url, "_blank")}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Қарау
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = selectedFile.url;
                        link.download = selectedFile.name;
                        link.click();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Жүктеп алу
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setFileInfoOpen(false);
                        handleDeleteFile(
                          selectedFile.path || selectedFile.name
                        );
                      }}
                      className="flex items-center gap-2"
                      disabled={deleting.has(
                        selectedFile.path || selectedFile.name
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      Жою
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
