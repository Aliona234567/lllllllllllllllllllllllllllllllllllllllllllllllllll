import * as pg from "drizzle-orm/pg-core";
import { schema } from "./schema";
import { relations } from "drizzle-orm";

export const brand = pg.pgTable("brand", {
    id: pg.varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    isDeleted: pg.boolean("is_deleted").default(false),
    createdAt: pg.timestamp("created_at").defaultNow(),
    name: pg.varchar("name", { length: 255 }).notNull(),
    photoId: pg.varchar("photoId", { length: 255 }),
});

export const brandRelations = relations(brand, ({ many }) => ({
    brand: many(schema)
}));