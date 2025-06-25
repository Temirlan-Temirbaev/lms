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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Image as ImageIcon, Music, FolderOpen } from "lucide-react";
import { MediaBrowser } from "./MediaBrowser";

interface MediaInsertDialogProps {
  onInsert: (markdown: string) => void;
  children: React.ReactNode;
}

type MediaType = "image" | "audio";

const ACCEPTED_IMAGE = ["image/*"];
const ACCEPTED_AUDIO = ["audio/*"];

export const MediaInsertDialog: React.FC<MediaInsertDialogProps> = ({
  onInsert,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("image");

  // Image
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  // Audio
  const [audioUrl, setAudioUrl] = useState("");
  const [audioCaption, setAudioCaption] = useState("");

  // Media browser select
  const handleMediaSelect = (file: any) => {
    if (mediaType === "image") {
      setImageUrl(file.url);
      setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    } else if (mediaType === "audio") {
      setAudioUrl(file.url);
      setAudioCaption(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  // Insert handler
  const handleInsert = () => {
    let markdown = "";
    if (mediaType === "image" && imageUrl) {
      markdown = `![${altText || "Image"}](${imageUrl})`;
    } else if (mediaType === "audio" && audioUrl) {
      markdown = `[${audioCaption || "audio"}](${audioUrl})`;
    }
    if (markdown) {
      onInsert(markdown);
      setImageUrl("");
      setAltText("");
      setAudioUrl("");
      setAudioCaption("");
      setOpen(false);
    }
  };

  // Reset on close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setImageUrl("");
      setAltText("");
      setAudioUrl("");
      setAudioCaption("");
      setMediaType("image"); // Reset to default
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Media</DialogTitle>
        </DialogHeader>
        <Tabs
          value={mediaType}
          onValueChange={(v) => setMediaType(v as MediaType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-1" />
              Image
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Music className="h-4 w-4 mr-1" />
              Audio
            </TabsTrigger>
          </TabsList>

          {/* IMAGE TAB */}
          <TabsContent value="image" className="space-y-4">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse Files</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
              <TabsContent value="browse" className="space-y-4">
                <MediaBrowser
                  onSelect={handleMediaSelect}
                  acceptedTypes={
                    mediaType === "image" ? ACCEPTED_IMAGE : ACCEPTED_AUDIO
                  }
                >
                  <Button variant="outline" className="w-full">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {mediaType === "image"
                      ? "Browse Media Library"
                      : "Browse Audio Library"}
                  </Button>
                </MediaBrowser>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </TabsContent>
            </Tabs>
            <Label htmlFor="altText">Alt Text (optional)</Label>
            <Input
              id="altText"
              placeholder="Description of the image"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
            {imageUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded p-2">
                  <img
                    src={imageUrl}
                    alt={altText || "Preview"}
                    className="max-w-full h-auto max-h-32 object-contain mx-auto"
                    onError={() => setImageUrl("")}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* AUDIO TAB */}
          <TabsContent value="audio" className="space-y-4">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse Files</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
              <TabsContent value="browse" className="space-y-4">
                <MediaBrowser
                  onSelect={handleMediaSelect}
                  acceptedTypes={ACCEPTED_AUDIO}
                >
                  <Button variant="outline" className="w-full">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse Audio Library
                  </Button>
                </MediaBrowser>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <Label htmlFor="audioUrl">Audio URL</Label>
                <Input
                  id="audioUrl"
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
              </TabsContent>
            </Tabs>
            <Label htmlFor="audioCaption">Caption (optional)</Label>
            <Input
              id="audioCaption"
              placeholder="Description of the audio"
              value={audioCaption}
              onChange={(e) => setAudioCaption(e.target.value)}
            />
            {audioUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded p-4">
                  <div className="flex items-center gap-3">
                    <Music className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {audioCaption || "Audio file"}
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
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={mediaType === "image" ? !imageUrl : !audioUrl}
          >
            Insert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaInsertDialog;
