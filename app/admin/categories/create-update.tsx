"use client";

import { api } from "@/src/server/api";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pen, Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
import { Label } from "@/src/components/ui/label";
import { Image } from "@/src/components/ui/image";

const brandSchema = z.object({
  name: z
    .string({ message: "Название обязательно" })
    .min(2, "Название должно содержать минимум 2 символа")
    .max(100, "Название не может быть длиннее 100 символов"),
  photoId: z.string().nullable().optional(),
});

const designerSchema = z.object({
  name: z
    .string({ message: "Имя обязательно" })
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(100, "Имя не может быть длиннее 100 символов"),
  description: z
    .string()
    .max(500, "Описание не может быть длиннее 500 символов")
    .optional()
    .nullable(),
  photoIds: z.array(z.string()).default([]),
});

type BrandForm = z.infer<typeof brandSchema>;
type DesignerForm = z.infer<typeof designerSchema>;

interface Brand {
  id: string;
  name: string;
  photoId?: string | null;
  isDeleted?: boolean;
}

interface Designer {
  id: string;
  name: string;
  description?: string | null;
  photoIds?: string[] | null;
  isDeleted?: boolean;
}

export function CreateUpdateBrand({
  brand,
  onSuccess
}: {
  brand?: Brand;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    brand?.photoId || null
  );

  const form = useForm({
    defaultValues: {
      name: brand?.name || "",
      photoId: brand?.photoId || null,
    } as BrandForm,
    onSubmit: async ({ value }) => {
      if (brand) {
        updateMutation.mutate(value);
      } else {
        createMutation.mutate(value);
      }
    },
    validators: {
      onSubmit: brandSchema,
    },
  });

  const createMutation = useMutation({
    mutationKey: ["createBrand"],
    mutationFn: async (data: BrandForm) => {
      const res = await api.brand.post({
        name: data.name,
        photoId: data.photoId,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Бренд успешно создан");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      form.reset();
      setSelectedImage(null);
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при создании", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["updateBrand", brand?.id],
    mutationFn: async (data: BrandForm) => {
      const res = await api.brand({ id: brand!.id }).put({
        name: data.name,
        photoId: data.photoId,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Бренд обновлен");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при обновлении", {
        description: error.message,
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {brand ? (
          <Button variant="ghost" size="icon">
            <Pen className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать бренд
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {brand ? "Редактирование бренда" : "Создание нового бренда"}
          </DialogTitle>
          <DialogDescription>
            {brand
              ? "Измените информацию о бренде ниже"
              : "Заполните форму для создания нового бренда"
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
                  Название бренда <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Введите название бренда"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  className={field.state.value?.length < 2 ? "border-destructive" : ""}
                />
                {field.state.value?.length > 0 && field.state.value.length < 2 && (
                  <p className="text-sm text-destructive">
                    Минимум 2 символа
                  </p>
                )}
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.at(0)?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="photoId">
            {(field) => (
              <div className="space-y-2">
                <Label>Логотип бренда</Label>
                <ImageUpload
                  value={field.state.value}
                  onUpload={(id) => {
                    field.handleChange(id);
                    setSelectedImage(id);
                  }}
                  onRemove={() => {
                    field.handleChange(null);
                    setSelectedImage(null);
                  }}
                  disabled={isPending}
                />
                {selectedImage && (
                  <div className="relative w-20 h-20 mt-2 rounded-lg overflow-hidden border">
                    <Image
                      src={selectedImage}
                      alt="Логотип бренда"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
                    <>{brand ? "Сохранить изменения" : "Создать бренд"}</>
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

export function CreateUpdateDesigner({
  designer,
  onSuccess
}: {
  designer?: Designer;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    designer?.photoIds?.filter(Boolean) || []
  );

  const form = useForm({
    defaultValues: {
      name: designer?.name || "",
      description: designer?.description || "",
      photoIds: designer?.photoIds?.filter(Boolean) || [],
    } as DesignerForm,
    onSubmit: async ({ value }) => {
      if (designer) {
        updateMutation.mutate(value);
      } else {
        createMutation.mutate(value);
      }
    },
    validators: {
      onSubmit: designerSchema,
    },
  });

  const createMutation = useMutation({
    mutationKey: ["createDesigner"],
    mutationFn: async (data: DesignerForm) => {
      const res = await api.designers.post({
        name: data.name,
        descripcion: data.description || "",
        photoIds: data.photoIds,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Дизайнер успешно создан");
      queryClient.invalidateQueries({ queryKey: ["designers"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      form.reset();
      setSelectedImages([]);
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при создании", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["updateDesigner", designer?.id],
    mutationFn: async (data: DesignerForm) => {
      const res = await api.designers({ id: designer!.id }).put({
        name: data.name,
        descripcion: data.description || "",
        photoIds: data.photoIds,
      });
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Дизайнер обновлен");
      queryClient.invalidateQueries({ queryKey: ["designers"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Ошибка при обновлении", {
        description: error.message,
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {designer ? (
          <Button variant="ghost" size="icon">
            <Pen className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать дизайнера
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {designer ? "Редактирование дизайнера" : "Создание нового дизайнера"}
          </DialogTitle>
          <DialogDescription>
            {designer
              ? "Измените информацию о дизайнере ниже"
              : "Заполните форму для создания нового дизайнера"
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
                  Имя дизайнера <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Введите имя дизайнера"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  className={field.state.value?.length < 2 ? "border-destructive" : ""}
                />
                {field.state.value?.length > 0 && field.state.value.length < 2 && (
                  <p className="text-sm text-destructive">
                    Минимум 2 символа
                  </p>
                )}
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.at(0)?.message}
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
                  placeholder="Введите описание дизайнера"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="photoIds">
            {(field) => (
              <div className="space-y-2">
                <Label>Фотографии дизайнера</Label>
                <ImageUpload
                  onUpload={handleImageUpload}
                  disabled={isPending}
                  multiple
                />
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
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
              onClick={() => setIsOpen(false)}
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
                    <>{designer ? "Сохранить изменения" : "Создать дизайнера"}</>
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
  value,
  onUpload,
  onRemove,
  disabled,
  multiple = false
}: {
  value?: string | null;
  onUpload: (id: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  multiple?: boolean;
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
      {value && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
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