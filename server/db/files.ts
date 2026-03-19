import * as pg from "drizzle-orm/pg-core";

export const files = pg.pgTable("files", {
    id: pg.varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    fileName: pg.varchar("file_name", { length: 255 }).notNull(),
    contentType: pg.varchar("content_type", { length: 255 }).notNull(),
    createdAt: pg.timestamp("created_at").defaultNow(),
});