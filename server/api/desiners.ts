import Elysia from "elysia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { desiners } from "../db/desiners";

export const desinersRouter = new Elysia({
    prefix: "/desiners"
})
.get("/", async () => {
    return await db.query.desiners.findMany({
        where: eq(desiners.isDeleted, false)
    })
})
.get("/:id", async ({ params }) => {
    return await db.query.desiners.findFirst({
        where: eq(desiners.id, params.id)
    })
})
.post("/", async ({ body }) => {
    return await db.insert(desiners).values({
        name: body.name,
        descripcion: body.descripcion,
        photoIds: body.photoIds,
    }).returning()
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
        photoIds: z.array(z.string()).default([]),
    })
})
.put("/:id", async ({ params, body}) => {
    await db.update(desiners).set({
        name: body.name,
        descripcion: body.descripcion,
        photoIds: body.photoIds,
    })
    .where(eq(desiners.id, params.id))
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
        photoIds: z.array(z.string()).default([]),
    })
})
.delete("/:id", async ({ params }) => {
    await db.update(desiners).set({
        isDeleted: true
    })
    .where(eq(desiners.id, params.id))
})