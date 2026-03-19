import Elysia from "elysia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { schema } from "../db/schema";
import { z } from "zod";

export const schemaRouter = new Elysia({
    prefix: "/schema"
})
.get("/", async () => {
    return await db.query.schema.findMany({
        where: eq(schema.isDeleted, false),
        with: {
            brand: true,
            desiners: true,
            zadie: true,
        }
    });
})
.get("/:id", async ({ params }) => {
    return await db.query.schema.findFirst({
        where: eq(schema.id, params.id),
        with: {
            brand: true,
            desiners: true,
            zadie: true,
        }
    });
})
.post("/", async ({ body }) => {
    return await db.insert(schema).values({
        name: body.name,
        descripcion: body.descripcion,
        photoIds: body.photoIds,
        season: body.season,
        brandId: body.brandId,
        desinersId: body.designersId,
        zadieId: body.zadieId,
    }).returning();
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
        photoIds: z.array(z.string()).optional(),
        season: z.enum(["summer", "autumn", "spring", "winter"]).optional(),
        brandId: z.string(),
        designersId: z.string(),
        zadieId: z.string(),
    })
})
.put("/:id", async ({ params, body }) => {
    await db.update(schema).set({
        name: body.name,
        descripcion: body.descripcion,
        photoIds: body.photoIds,
        season: body.season,
        brandId: body.brandId,
        desinersId: body.designersId,
        zadieId: body.zadieId,
    })
    .where(eq(schema.id, params.id));
}, {
    body: z.object({
        name: z.string(),
        descripcion: z.string().optional(),
        photoIds: z.array(z.string()).optional(),
        season: z.enum(["summer", "autumn", "spring", "winter"]).optional(),
        brandId: z.string(),
        designersId: z.string(),
        zadieId: z.string(),
    })
})
.delete("/:id", async ({ params }) => {
    await db.update(schema).set({
        isDeleted: true
    })
    .where(eq(schema.id, params.id));
});