"use client";

import { api } from "@/src/server/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

interface DeleteCollectionProps {
  id: string;
  name?: string;
  type?: "collection" | "brand" | "designer";
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteCollection({
  id,
  name,
  type = "collection",
  onSuccess,
  trigger
}: DeleteCollectionProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const getEntityNames = () => {
    switch (type) {
      case "brand":
        return {
          singular: "бренд",
          singular_acc: "бренд",
          plural: "бренды",
          queryKey: "brands",
          endpoint: api.brand
        };
      case "designer":
        return {
          singular: "дизайнера",
          singular_acc: "дизайнера",
          plural: "дизайнеры",
          queryKey: "designers",
          endpoint: api.designers
        };
      default:
        return {
          singular: "коллекцию",
          singular_acc: "коллекция",
          plural: "коллекции",
          queryKey: "collections",
          endpoint: api.schema
        };
    }
  };

  const entity = getEntityNames();

  const deleteMutation = useMutation({
    mutationKey: ["delete", type, id],
    mutationFn: async () => {
      const res = await entity.endpoint({ id }).delete();
      
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      
      return res.data;
    },
    onSuccess: () => {
      setIsOpen(false);
      toast.success(
        type === "collection" ? "Коллекция удалена" :
        type === "brand" ? "Бренд удален" :
        "Дизайнер удален"
      );
      
      queryClient.invalidateQueries({
        queryKey: [entity.queryKey]
      });
      
      if (type === "brand" || type === "designer") {
        queryClient.invalidateQueries({
          queryKey: ["collections"]
        });
      }
      
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Ошибка при удалении ${entity.singular}`, {
        description: error.message || "Попробуйте снова",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getTitle = () => {
    switch (type) {
      case "brand":
        return `Удаление бренда${name ? `: ${name}` : ''}`;
      case "designer":
        return `Удаление дизайнера${name ? `: ${name}` : ''}`;
      default:
        return `Удаление коллекции${name ? `: ${name}` : ''}`;
    }
  };

  const getDescription = () => {
    const messages = {
      collection: "Вы уверены, что хотите удалить эту коллекцию? Это действие нельзя отменить. Коллекция будет помечена как удаленная и не будет отображаться в списках.",
      brand: "Вы уверены, что хотите удалить этот бренд? Это действие нельзя отменить. Бренд будет помечен как удаленный, но все связанные с ним коллекции сохранятся.",
      designer: "Вы уверены, что хотите удалить этого дизайнера? Это действие нельзя отменить. Дизайнер будет помечен как удаленный, но все связанные с ним коллекции сохранятся."
    };
    return messages[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {name && (
          <div className="bg-muted/50 p-3 rounded-md border">
            <p className="text-sm font-medium">Вы собираетесь удалить:</p>
            <p className="text-sm text-muted-foreground mt-1">
              {type === "brand" && "Бренд: "}
              {type === "designer" && "Дизайнер: "}
              {type === "collection" && "Коллекция: "}
              <span className="font-semibold text-foreground">{name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ID: {id}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
            >
              Отмена
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>Удаление...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteBrand({ id, name, onSuccess }: { id: string; name?: string; onSuccess?: () => void }) {
  return (
    <DeleteCollection
      id={id}
      name={name}
      type="brand"
      onSuccess={onSuccess}
    />
  );
}

export function DeleteDesigner({ id, name, onSuccess }: { id: string; name?: string; onSuccess?: () => void }) {
  return (
    <DeleteCollection
      id={id}
      name={name}
      type="designer"
      onSuccess={onSuccess}
    />
  );
}