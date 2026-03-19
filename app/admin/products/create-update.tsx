"use client";

import { api } from "@/src/server/api";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Image } from "@/src/components/ui/image";
import { useState } from "react";
import { Badge } from "@/src/components/ui/badge";

const collectionSchema = z.object({
  name: z
    .string({ message: "Название обязательно" })
    .min(3, "Название должно содержать минимум 3 символа")
    .max(100, "Название не может быть длиннее 100 символов"),
  description: z
    .string()
    .max(500, "Описание не может быть длиннее 500 символов")
    .optional(),
  season: z.enum(["summer", "autumn", "spring", "winter"]).optional(),
  brandId: z.string({ message: "Бренд обязателен" }),
  designersId: z.string({ message: "Дизайнер обязателен" }),
  photoIds: z.array(z.string()).default([]),
});

type CollectionForm = z.infer<typeof collectionSchema>;

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  season?: "summer" | "autumn" | "spring" | "winter" | null;
  brandId: string;
  designersId: string;
  photoIds?: string[] | null;
  isDeleted?: boolean;
}

interface CreateUpdateCollectionProps {
  collection?: Collection;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateUpdateCollection({
  collection,
  trigger,
  onSuccess
}: CreateUpdateCollectionProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    collection?.photoIds?.filter(Boolean) || []
  );

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.brand.get();
      return response.data;
    },
  });

  const { data: designers } = useQuery({
    queryKey: ["designers"],
    queryFn: async () => {
      const response = await api.designers.get();
      return response.data;
    },
  });

  const form = useForm({
    defaultValues: {
      name: collection?.name || "",
      description: collection?.description || "",
      season: collection?.season || undefined,
      brandId: collection?.brandId || "",
      designersId: collection?.designersId || "",
      photoIds: collection?.photoIds?.filter(Boolean) || [],
    } as CollectionForm,
    onSubmit: async ({ value }) => {
      if (collection) {
        updateMutation.mutate(value);
      } else {
        createMutation.mutate(value);
      }
    },
  });

  const createMutation = useMutation({
    mutationKey: ["createCollection"],
    mutationFn: async (data: CollectionForm) => {
      const res = await api.schema.post({
        name: data.name,
        descripcion: data.description || "",
        season: data.season,
        brandId: data.brandId,
        desinersId: data.designersId,
        photoIds: data.photoIds,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Коллекция успешно создана");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      form.reset();
      setSelectedImages([]);
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при создании", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["updateCollection", collection?.id],
    mutationFn: async (data: CollectionForm) => {
      const res = await api.schema({ id: collection!.id }).put({
        name: data.name,
        descripcion: data.description || "",
        season: data.season,
        brandId: data.brandId,
        desinersId: data.designersId,
        photoIds: data.photoIds,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Коллекция обновлена");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при обновлении", {
        description: error.message,
      });
    },
  });

  const seasonMap = {
    summer: "Лето",
    autumn: "Осень",
    spring: "Весна",
    winter: "Зима",
  };

  const handleImageUpload = (imageId: string) => {
    const currentPhotos = form.getFieldValue("photoIds") || [];
    const newPhotos = [...currentPhotos, imageId];
    form.setFieldValue("photoIds", newPhotos);
    setSelectedImages(newPhotos);
  };

  const handleImageRemove = (index: number) => {
    const currentPhotos = form.getFieldValue("photoIds") || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setFieldValue("photoIds", newPhotos);
    setSelectedImages(newPhotos);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={collection ? "ghost" : "default"} size={collection ? "icon" : "default"}>
            {collection ? (
              <Pen className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Создать коллекцию
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {collection ? "Редактирование коллекции" : "Создание новой коллекции"}
          </DialogTitle>
          <DialogDescription>
            {collection
              ? "Измените информацию о коллекции ниже"
              : "Заполните форму для создания новой коллекции"
            }
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">
                  Название <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Введите название коллекции"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  className={field.state.value?.length < 3 ? "border-destructive" : ""}
                />
                {field.state.value?.length > 0 && field.state.value.length < 3 && (
                  <p className="text-sm text-destructive">
                    Минимум 3 символа
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Введите описание коллекции"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="brandId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="brand">
                    Бренд <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите бренд" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="designersId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="designer">
                    Дизайнер <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите дизайнера" />
                    </SelectTrigger>
                    <SelectContent>
                      {designers?.map((designer) => (
                        <SelectItem key={designer.id} value={designer.id}>
                          {designer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="season">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="season">Сезон</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value: any) => field.handleChange(value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сезон" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(seasonMap).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="photoIds">
            {(field) => (
              <div className="space-y-4">
                <Label>Фотографии</Label>
                
                <ImageUpload
                  onUpload={handleImageUpload}
                  disabled={isPending}
                />
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {selectedImages.map((imageId, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border group"
                      >
                        <Image
                          src={imageId}
                          alt={`Фото ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isPending}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <Badge
                            variant="secondary"
                            className="absolute bottom-1 left-1 text-[10px]"
                          >
                            Главное
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={isPending || !state.canSubmit}
                >
                  {isPending ? (
                    <>Сохранение...</>
                  ) : (
                    <>{collection ? "Сохранить изменения" : "Создать"}</>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImageUpload({
  onUpload,
  disabled
}: {
  onUpload: (id: string) => void;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: async (file: File) => {
      const res = await api.file.post({ file });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Фото загружено");
      onUpload(data);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast.error("Ошибка при загрузке", {
        description: error.message,
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("image-upload")?.click()}
        disabled={disabled || isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Загрузка..." : "Загрузить фото"}
      </Button>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      <span className="text-xs text-muted-foreground">
        PNG, JPG, WEBP до 10MB
      </span>
    </div>
  );
}