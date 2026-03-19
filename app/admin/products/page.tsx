import { api } from "@/src/server/api";
import { CollectionsTable, BrandsTable, DesignersTable } from "./products-table";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default async function AdminCollections() {
  const [collections, brands, designers] = await Promise.all([
    api.schema.get(),
    api.brand.get(),
    api.designers.get(),
  ]);

  const collectionsData = collections.data ?? [];
  const brandsData = brands.data ?? [];
  const designersData = designers.data ?? [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление коллекциями</h1>
          <p className="text-muted-foreground mt-1">
            Создание, редактирование и удаление fashion коллекций
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать коллекцию
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего коллекций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collectionsData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {collectionsData.filter(c => !c.isDeleted).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Бренды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{brandsData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Дизайнеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{designersData.length}</p>
          </CardContent>
        </Card>
      </div>

      <CollectionsTable
        initialData={collectionsData}
        brands={brandsData}
        designers={designersData}
      />
    </div>
  );
}

export async function AdminBrands() {
  const brands = (await api.brand.get()).data ?? [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление брендами</h1>
          <p className="text-muted-foreground mt-1">
            Список всех брендов в системе
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать бренд
          </Link>
        </Button>
      </div>
      
      <BrandsTable initialData={brands} />
    </div>
  );
}

export async function AdminDesigners() {
  const designers = (await api.designers.get()).data ?? [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление дизайнерами</h1>
          <p className="text-muted-foreground mt-1">
            Список всех дизайнеров в системе
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/designers/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать дизайнера
          </Link>
        </Button>
      </div>
      
      <DesignersTable initialData={designers} />
    </div>
  );
}