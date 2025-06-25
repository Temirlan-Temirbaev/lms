import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Link, Image, Loader2, FolderOpen } from "lucide-react";
import { MediaBrowser } from "./MediaBrowser";

interface ImageInsertDialogProps {
  onInsert: (markdown: string) => void;
  children: React.ReactNode;
}

export const ImageInsertDialog: React.FC<ImageInsertDialogProps> = ({
  onInsert,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const uploadToMinIO = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
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

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to MinIO:", error);
      throw error;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploading(true);
        setUploadError("");

        try {
          const url = await uploadToMinIO(file);
          setImageUrl(url);
          setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        } catch (error) {
          setUploadError(
            error instanceof Error ? error.message : "Upload failed"
          );
        } finally {
          setUploading(false);
        }
      }
    },
  });

  const handleMediaSelect = (file: any) => {
    setImageUrl(file.url);
    setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleUploadFromBrowser = async (file: File) => {
    try {
      const url = await uploadToMinIO(file);
      setImageUrl(url);
      setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handleInsert = () => {
    if (!imageUrl) return;

    const alt = altText || "Image";
    const markdown = `![${alt}](${imageUrl})`;
    onInsert(markdown);

    // Reset form
    setImageUrl("");
    setAltText("");
    setUploadError("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setImageUrl("");
      setAltText("");
      setUploadError("");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Files</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <MediaBrowser
              onSelect={handleMediaSelect}
              onUpload={handleUploadFromBrowser}
              acceptedTypes={["image/*"]}
            >
              <Button variant="outline" className="w-full">
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse Media Library
              </Button>
            </MediaBrowser>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">
                {isDragActive
                  ? "Drop the image here..."
                  : "Drag & drop an image here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading to MinIO...
              </div>
            )}

            {uploadError && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {uploadError}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text (optional)</Label>
            <Input
              id="altText"
              placeholder="Description of the image"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={uploading}
            />
          </div>

          {imageUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded p-2">
                <img
                  src={imageUrl}
                  alt={altText || "Preview"}
                  className="max-w-full h-auto max-h-32 object-contain mx-auto"
                  onError={() => {
                    setImageUrl("");
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleInsert} disabled={!imageUrl || uploading}>
              {uploading ? "Загрузка..." : "Вставить изображение"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertDialog;
