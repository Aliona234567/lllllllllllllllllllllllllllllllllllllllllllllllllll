import * as pg from "drizzle-orm/pg-core";
import { schema } from "./schema";
import { relations } from "drizzle-orm";

export const desiners = pg.pgTable("desiners", {
    id: pg.varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    isDeleted: pg.boolean("is_deleted").default(false),
    createdAt: pg.timestamp("created_at").defaultNow(),
    name: pg.varchar("name", { length: 255 }).notNull(),
    photoIds: pg.varchar("photoIds", { length: 255 }).array(),
    descripcion: pg.text("descripcion"),
});

export const desinersRelations = relations(desiners, ({ many }) => ({
    desiners: many(schema)
}));