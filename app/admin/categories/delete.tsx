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

interface DeleteEntityProps {
  id: string;
  name?: string;
  type: "brand" | "designer";
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteEntity({ id, name, type, onSuccess, trigger }: DeleteEntityProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const getEntityConfig = () => {
    switch (type) {
      case "brand":
        return {
          name: "бренд",
          nameGenitive: "бренда",
          endpoint: api.brand,
          queryKey: "brands",
          successMessage: "Бренд успешно удален",
          errorMessage: "Ошибка при удалении бренда",
        };
      case "designer":
        return {
          name: "дизайнер",
          nameGenitive: "дизайнера",
          endpoint: api.designers,
          queryKey: "designers",
          successMessage: "Дизайнер успешно удален",
          errorMessage: "Ошибка при удалении дизайнера",
        };
    }
  };

  const config = getEntityConfig();

  const deleteMutation = useMutation({
    mutationKey: ["delete", type, id],
    mutationFn: async () => {
      const res = await config.endpoint({ id }).delete();
      
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      
      return res.data;
    },
    onSuccess: () => {
      setIsOpen(false);
      toast.success(config.successMessage, {
        description: name ? `${config.name} "${name}" помечен как удаленный` : undefined,
      });
      
      queryClient.invalidateQueries({
        queryKey: [config.queryKey]
      });
      
      queryClient.invalidateQueries({
        queryKey: ["collections"]
      });
      
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(config.errorMessage, {
        description: error.message || "Попробуйте снова",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getTitle = () => {
    if (name) {
      return `Удаление ${config.nameGenitive} "${name}"`;
    }
    return `Удаление ${config.nameGenitive}`;
  };

  const getDescription = () => {
    switch (type) {
      case "brand":
        return "Вы уверены, что хотите удалить этот бренд? Это действие нельзя отменить. Бренд будет помечен как удаленный и не будет отображаться в списках. Все коллекции, связанные с этим брендом, сохранятся, но бренд будет отображаться как 'Неизвестный бренд'.";
      case "designer":
        return "Вы уверены, что хотите удалить этого дизайнера? Это действие нельзя отменить. Дизайнер будет помечен как удаленный и не будет отображаться в списках. Все коллекции, связанные с этим дизайнером, сохранятся, но дизайнер будет отображаться как 'Неизвестный дизайнер'.";
    }
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
              {type === "brand" ? "Бренд: " : "Дизайнер: "}
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

export function DeleteBrand({
  id,
  name,
  onSuccess,
  trigger
}: {
  id: string;
  name?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  return (
    <DeleteEntity
      id={id}
      name={name}
      type="brand"
      onSuccess={onSuccess}
      trigger={trigger}
    />
  );
}

export function DeleteDesigner({
  id,
  name,
  onSuccess,
  trigger
}: {
  id: string;
  name?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  return (
    <DeleteEntity
      id={id}
      name={name}
      type="designer"
      onSuccess={onSuccess}
      trigger={trigger}
    />
  );
}

export default DeleteEntity;