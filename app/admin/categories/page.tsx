import { api } from "@/src/server/api";
import { BrandsTable, DesignersTable } from "./categories-table";
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

export default async function AdminBrandsPage() {
  const brandsResponse = await api.brand.get();
  const brands = brandsResponse.data ?? [];

  const collectionsResponse = await api.schema.get();
  const collections = collectionsResponse.data ?? [];

  const brandStats = brands.map(brand => ({
    ...brand,
    collectionsCount: collections.filter(c => c.brandId === brand.id).length,
    activeCollectionsCount: collections.filter(c => c.brandId === brand.id && !c.isDeleted).length,
  }));

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление брендами</h1>
          <p className="text-muted-foreground mt-1">
            Создание, редактирование и удаление брендов
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать бренд
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего брендов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{brands.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные бренды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {brands.filter(b => !b.isDeleted).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего коллекций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Среднее кол-во коллекций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {brands.length > 0
                ? (collections.length / brands.length).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      <BrandsTable
        initialData={brandStats}
        collectionsCount={collections.length}
      />
    </div>
  );
}

export async function AdminDesignersPage() {
  const designersResponse = await api.designers.get();
  const designers = designersResponse.data ?? [];

  const collectionsResponse = await api.schema.get();
  const collections = collectionsResponse.data ?? [];

  const designerStats = designers.map(designer => ({
    ...designer,
    collectionsCount: collections.filter(c => c.designersId === designer.id).length,
    activeCollectionsCount: collections.filter(c => c.designersId === designer.id && !c.isDeleted).length,
  }));

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление дизайнерами</h1>
          <p className="text-muted-foreground mt-1">
            Создание, редактирование и удаление дизайнеров
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/designers/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать дизайнера
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего дизайнеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{designers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные дизайнеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {designers.filter(d => !d.isDeleted).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего коллекций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Среднее кол-во коллекций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {designers.length > 0
                ? (collections.length / designers.length).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      <DesignersTable
        initialData={designerStats}
        collectionsCount={collections.length}
      />
    </div>
  );
}

export async function AdminDashboard() {
  const [brands, designers, collections] = await Promise.all([
    api.brand.get(),
    api.designers.get(),
    api.schema.get(),
  ]);

  const brandsData = brands.data ?? [];
  const designersData = designers.data ?? [];
  const collectionsData = collections.data ?? [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/brands" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Бренды</CardTitle>
              <CardDescription>Управление брендами</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{brandsData.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Активных: {brandsData.filter(b => !b.isDeleted).length}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/designers" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Дизайнеры</CardTitle>
              <CardDescription>Управление дизайнерами</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{designersData.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Активных: {designersData.filter(d => !d.isDeleted).length}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/collections" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Коллекции</CardTitle>
              <CardDescription>Управление коллекциями</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{collectionsData.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Активных: {collectionsData.filter(c => !c.isDeleted).length}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Часто используемые операции</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/admin/collections/new">
              <Plus className="h-4 w-4 mr-2" />
              Новая коллекция
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/brands/new">
              <Plus className="h-4 w-4 mr-2" />
              Новый бренд
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/designers/new">
              <Plus className="h-4 w-4 mr-2" />
              Новый дизайнер
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}