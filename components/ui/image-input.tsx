"use client";

import { api } from "@/src/server/api";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Image } from "./image";
import { Button } from "./button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ImageInputProps {
  onSaved: (id: string) => void;
  onRemove?: () => void;
  value?: string | null;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  showPreview?: boolean;
  disabled?: boolean;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

export function ImageInput({
  onSaved,
  onRemove,
  value,
  className,
  aspectRatio = "square",
  showPreview = true,
  disabled = false,
}: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: async (file: File) => {
      const res = await api.file.post({ file });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onError: (error: Error) => {
      toast.error("Ошибка при загрузке", {
        description: error.message || "Не удалось загрузить изображение",
      });
      setPreview(value ?? null);
    },
    onSuccess: (id) => {
      toast.success("Изображение загружено");
      onSaved(id);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Ошибка", {
        description: "Пожалуйста, выберите изображение",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ошибка", {
        description: "Размер файла не должен превышать 10MB",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    uploadMutation.mutate(file, {
      onSettled: () => {
        URL.revokeObjectURL(objectUrl);
      },
    });
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        const event = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  const isLoading = uploadMutation.isPending;

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
      />

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all overflow-hidden",
          aspectRatioClasses[aspectRatio],
          isDragging && "border-primary bg-primary/5",
          !preview && !isLoading && "hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          preview ? "border-transparent" : "border-border"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isLoading && !preview && fileInputRef.current?.click()}
      >
        {preview && showPreview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled || isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={disabled || isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Загрузка...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            {isLoading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Нажмите для загрузки</p>
                <p className="text-xs text-muted-foreground mt-1">
                  или перетащите файл сюда
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, WEBP до 10MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {preview && !showPreview && (
        <div className="mt-2 text-sm text-muted-foreground">
          Изображение загружено (ID: {preview.slice(0, 8)}...)
        </div>
      )}
    </div>
  );
}

export function SingleImageInput(props: ImageInputProps) {
  return <ImageInput {...props} showPreview={true} />;
}

export function MultipleImageInput({
  onSaved,
  onRemove,
  values = [],
  maxImages = 5,
}: {
  onSaved: (id: string) => void;
  onRemove?: (id: string) => void;
  values?: string[];
  maxImages?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {values.map((id, index) => (
          <div key={id} className="relative group">
            <Image
              src={id}
              alt={`Image ${index + 1}`}
              className="aspect-square rounded-lg object-cover"
            />
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        
        {values.length < maxImages && (
          <ImageInput
            onSaved={onSaved}
            className="aspect-square"
            showPreview={false}
          />
        )}
      </div>
      
      {values.length >= maxImages && (
        <p className="text-sm text-muted-foreground">
          Достигнут лимит ({maxImages} изображений)
        </p>
      )}
    </div>
  );
}