import * as pg from "drizzle-orm/pg-core";
import { brand } from "./brand";
import { zadie } from "./zadie";
import { desiners } from "./desiners";
import { relations } from "drizzle-orm";

export * from "./brand";
export * from "./zadie";
export * from "./desiners";
export * from "./roles";
export * from "./files";

export const seasonEnum = pg.pgEnum("season", ["summer", "autumn", "spring", "winter"]);

export const schema = pg.pgTable("schema", {
    id: pg.varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    isDeleted: pg.boolean("is_deleted").default(false),
    createdAt: pg.timestamp("created_at").defaultNow(),
    name: pg.varchar("name", { length: 255 }).notNull(),
    photoIds: pg.varchar("photoIds", { length: 255 }).array(),
    season: seasonEnum("season"),
    descripcion: pg.text("descripcion"),
    brandId: pg.varchar("brand", { length: 255 }).notNull().references(() => brand.id),
    zadieId: pg.varchar("zadie", { length: 255 }).notNull().references(() => zadie.id),
    desinersId: pg.varchar("desiners", { length: 255 }).notNull().references(() => desiners.id),
});

export const schemaRelations = relations(schema, ({ one }) => ({
    brand: one(brand, {
        fields: [schema.brandId],
        references: [brand.id]
    }),
    zadie: one(zadie, {
        fields: [schema.zadieId],
        references: [zadie.id]
    }),
    desiners: one(desiners, {
        fields: [schema.desinersId],
        references: [desiners.id]
    })
}));