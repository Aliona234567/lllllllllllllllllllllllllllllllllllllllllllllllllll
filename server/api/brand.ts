import Elysia from "elysia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { brand } from "../db/brand";

export const brandRouter = new Elysia({
    prefix: "/brand"
})
.get("/", async () => {
    return await db.query.brand.findMany({
        where: eq(brand.isDeleted, false)
    })
})
.get("/:id", async ({ params }) => {
    return await db.query.brand.findFirst({
        where: eq(brand.id, params.id)
    })
})
.post("/", async ({ body }) => {
    return await db.insert(brand).values({
        name: body.name,
        photoId: body.photoId,
    }).returning()
}, {
    body: z.object({
        name: z.string(),
        photoId: z.string().nullable().optional(),
    })
})
.put("/:id", async ({ params, body}) => {
    await db.update(brand).set({
        name: body.name,
        photoId: body.photoId,
    })
    .where(eq(brand.id, params.id))
}, {
    body: z.object({
        name: z.string(),
        photoId: z.string().nullable().optional(),
    })
})
.delete("/:id", async ({ params }) => {
    await db.update(brand).set({
        isDeleted: true
    })
    .where(eq(brand.id, params.id))
})