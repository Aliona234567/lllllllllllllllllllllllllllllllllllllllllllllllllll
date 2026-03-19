import Elysia from "elysia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { zadie } from "../db/zadie";
import { z } from "zod";

export const zadieRouter = new Elysia({
    prefix: "/zadie"
})
.get("/", async () => {
    return await db.query.zadie.findMany({
        where: eq(zadie.isDeleted, false)
    });
})
.get("/:id", async ({ params }) => {
    return await db.query.zadie.findFirst({
        where: eq(zadie.id, params.id)
    });
})
.post("/", async ({ body }) => {
    return await db.insert(zadie).values({
        name: body.name,
        descripcion: body.descripcion,
    }).returning();
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
    })
})
.put("/:id", async ({ params, body }) => {
    await db.update(zadie).set({
        name: body.name,
        descripcion: body.descripcion,
    })
    .where(eq(zadie.id, params.id));
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
    })
})
.delete("/:id", async ({ params }) => {
    await db.update(zadie).set({
        isDeleted: true
    })
    .where(eq(zadie.id, params.id));
});