"use client";

import { api } from "@/src/server/api";
import { DataTable } from "@/src/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CreateUpdateCollection } from "./create-update"; // Исправлено
import { DeleteCollection } from "./delete";
import { Badge } from "@/src/components/ui/badge";
import { Image } from "@/src/components/ui/image";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/src/components/ui/button";
import { Pen } from "lucide-react";
import { CreateUpdateBrand } from "./create-update"; // Исправлено
import { CreateUpdateDesigner } from "./create-update"; // Исправлено


interface Collection {
  id: string;
  name: string;
  descripcion?: string | null;
  season?: "summer" | "autumn" | "spring" | "winter" | null;
  photoIds?: string[] | null;
  brandId: string;
  designersId: string;
  isDeleted?: boolean;
  createdAt?: string | null;
}

interface Brand {
  id: string;
  name: string;
  isDeleted?: boolean;
  createdAt?: string;
}

interface Designer {
  id: string;
  name: string;
  isDeleted?: boolean;
  createdAt?: string;
}

interface CollectionsTableProps {
  initialData: Collection[];
  brands: Brand[];
  designers: Designer[];
}

const seasonMap = {
  summer: { label: "Лето", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  autumn: { label: "Осень", color: "bg-orange-100 text-orange-800 border-orange-200" },
  spring: { label: "Весна", color: "bg-green-100 text-green-800 border-green-200" },
  winter: { label: "Зима", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

export function CollectionsTable({ initialData, brands, designers }: CollectionsTableProps) {
  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await api.schema.get();
      return response.data;
    },
    initialData,
  });

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || "Неизвестный бренд";
  };

  const getDesignerName = (designerId: string) => {
    const designer = designers.find(d => d.id === designerId);
    return designer?.name || "Неизвестный дизайнер";
  };

  const columns: ColumnDef<Collection>[] = [
    {
      id: "image",
      header: "Фото",
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
          {row.original.photoIds?.[0] ? (
            <Image
              src={row.original.photoIds[0]}
              alt={row.original.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
              Нет фото
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      id: "brand",
      header: "Бренд",
      cell: ({ row }) => getBrandName(row.original.brandId),
    },
    {
      id: "designer",
      header: "Дизайнер",
      cell: ({ row }) => getDesignerName(row.original.designersId),
    },
    {
      accessorKey: "season",
      header: "Сезон",
      cell: ({ row }) => {
        const season = row.original.season;
        if (!season) return "---";
        
        const seasonInfo = seasonMap[season as keyof typeof seasonMap];
        return (
          <Badge variant="outline" className={seasonInfo?.color}>
            {seasonInfo?.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "descripcion",
      header: "Описание",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-muted-foreground">
          {row.original.descripcion || "---"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "---";
        
        try {
          return format(new Date(date), "dd MMM yyyy", { locale: ru });
        } catch {
          return "---";
        }
      },
    },
    {
      id: "status",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
          {row.original.isDeleted ? "Удалена" : "Активна"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">
          <CreateUpdateCollection />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <CreateUpdateCollection
            collection={row.original}
            trigger={
              <Button variant="ghost" size="icon">
                <Pen className="h-4 w-4" />
              </Button>
            }
          />
          <DeleteCollection
            id={row.original.id}
            name={row.original.name}
            type="collection"
          />
        </div>
      ),
    },
  ];

  const activeCollections = collections?.filter(c => !c.isDeleted) ?? [];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={activeCollections}
        onRowClick={(row) => {
          // Опционально: переход на страницу коллекции
          // router.push(`/admin/collections/${row.id}`);
        }}
      />
      
      {collections && collections.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Показано {activeCollections.length} из {collections.length} коллекций
          {collections.length - activeCollections.length > 0 && (
            <span className="text-destructive ml-1">
              ({collections.length - activeCollections.length} удалено)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BrandsTable({ initialData }: { initialData: Brand[] }) {
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.brand.get();
      return response.data;
    },
    initialData,
  });

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: "Название бренда",
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "---";
        try {
          return format(new Date(date), "dd MMM yyyy", { locale: ru });
        } catch {
          return "---";
        }
      },
    },
    {
      id: "status",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
          {row.original.isDeleted ? "Удален" : "Активен"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">
          <CreateUpdateBrand />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <CreateUpdateBrand
            brand={row.original}
            trigger={
              <Button variant="ghost" size="icon">
                <Pen className="h-4 w-4" />
              </Button>
            }
          />
          <DeleteCollection
            id={row.original.id}
            name={row.original.name}
            type="brand"
          />
        </div>
      ),
    },
  ];

  const activeBrands = brands?.filter(b => !b.isDeleted) ?? [];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={activeBrands} />
      {brands && brands.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Показано {activeBrands.length} из {brands.length} брендов
        </div>
      )}
    </div>
  );
}

export function DesignersTable({ initialData }: { initialData: Designer[] }) {
  const { data: designers } = useQuery({
    queryKey: ["designers"],
    queryFn: async () => {
      const response = await api.designers.get();
      return response.data;
    },
    initialData,
  });

  const columns: ColumnDef<Designer>[] = [
    {
      accessorKey: "name",
      header: "Имя дизайнера",
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "---";
        try {
          return format(new Date(date), "dd MMM yyyy", { locale: ru });
        } catch {
          return "---";
        }
      },
    },
    {
      id: "status",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
          {row.original.isDeleted ? "Удален" : "Активен"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">
          <CreateUpdateDesigner />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <CreateUpdateDesigner
            designer={row.original}
            trigger={
              <Button variant="ghost" size="icon">
                <Pen className="h-4 w-4" />
              </Button>
            }
          />
          <DeleteCollection
            id={row.original.id}
            name={row.original.name}
            type="designer"
          />
        </div>
      ),
    },
  ];

  const activeDesigners = designers?.filter(d => !d.isDeleted) ?? [];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={activeDesigners} />
      {designers && designers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Показано {activeDesigners.length} из {designers.length} дизайнеров
        </div>
      )}
    </div>
  );
}