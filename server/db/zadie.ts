import * as pg from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { schema } from "./schema";

export const zadie = pg.pgTable("zadie", {
    id: pg.varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    isDeleted: pg.boolean("is_deleted").default(false),
    createdAt: pg.timestamp("created_at").defaultNow(),
    name: pg.varchar("name", { length: 255 }).notNull(),
    descripcion: pg.text("descripcion"),
});

export const zadieRelations = relations(zadie, ({ many }) => ({
    zadie: many(schema)
}));