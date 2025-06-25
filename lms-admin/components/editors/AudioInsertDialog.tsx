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
import { Upload, Link, Music, Loader2, FolderOpen } from "lucide-react";
import { MediaBrowser } from "./MediaBrowser";

interface AudioInsertDialogProps {
  onInsert: (markdown: string) => void;
  children: React.ReactNode;
}

export const AudioInsertDialog: React.FC<AudioInsertDialogProps> = ({
  onInsert,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [caption, setCaption] = useState("");
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
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploading(true);
        setUploadError("");

        try {
          const url = await uploadToMinIO(file);
          setAudioUrl(url);
          setCaption(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
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
    setAudioUrl(file.url);
    setCaption(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleUploadFromBrowser = async (file: File) => {
    try {
      const url = await uploadToMinIO(file);
      setAudioUrl(url);
      setCaption(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleInsert = () => {
    if (!audioUrl) return;

    // Create HTML audio element for markdown
    const audioHtml = `
<div class="audio-player">
  ${caption && `<p class="audio-caption">${caption}</p>`}
  <audio controls>
    <source src="${audioUrl}" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>
</div>
`;

    onInsert(audioHtml);

    // Reset form
    setAudioUrl("");
    setCaption("");
    setUploadError("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setAudioUrl("");
      setCaption("");
      setUploadError("");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Audio</DialogTitle>
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
              acceptedTypes={["audio/*"]}
            >
              <Button variant="outline" className="w-full">
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse Audio Library
              </Button>
            </MediaBrowser>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input
                id="audioUrl"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
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
              <Music className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">
                {isDragActive
                  ? "Drop the audio file here..."
                  : "Drag & drop an audio file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">MP3, WAV, OGG up to 10MB</p>
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
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              placeholder="Description of the audio"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={uploading}
            />
          </div>

          {audioUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded p-4">
                <div className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {caption || "Audio file"}
                    </p>
                    <audio controls className="w-full mt-2">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
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
            <Button onClick={handleInsert} disabled={!audioUrl || uploading}>
              {uploading ? "Uploading..." : "Insert Audio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioInsertDialog;
