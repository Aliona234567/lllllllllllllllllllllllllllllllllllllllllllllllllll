import Elysia, { t } from "elysia";
import { db } from "../db";
import { files } from "../db/schema";
import { s3 } from "../s3";
import { eq } from "drizzle-orm";

export const fileRouter = new Elysia({
    prefix: "/file"
})
.post("/", async ({ body }) => {
    const file = body.file;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";
    let id: string;

    await db.transaction(async (trx) => {
        const [createdFileData] = await trx.insert(files).values({
            fileName: file.name,
            contentType
        }).returning();
        id = createdFileData.id;
        const s3File = await s3.file(id);
        await s3File.write(buffer, {
            type: contentType
        })
    })

    return id!;
}, {
    body: t.Object({
        file: t.File()
    })
})
.get("/:id", async ({ params, set }) => {
    const fileMetaData = await db.query.files.findFirst({
        where: eq(files.id, params.id)
    })

    if (!fileMetaData) {
        set.status = 404;
        return Response.json({
            code: 404,
            message: "Файл не найден"
        })
    }

    set.headers["Content-Type"] = fileMetaData.contentType;
    const s3File = await s3.file(fileMetaData.id);
    return new Response(s3File.stream(), {
        headers: {
            "Content-Type": fileMetaData.contentType,
        }
    })
}, {
    params: t.Object({
        id: t.String()
    })
})