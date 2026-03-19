import Elysia from "elysia";
import { treaty } from "@elysiajs/eden";
import { desinersRouter } from "./desiners";
import { brandRouter } from "./brand";
import { schemaRouter } from "./schema";
import { fileRouter } from "./file";
import { userRouter } from "./user";

export const app = new Elysia({
    prefix: "/api"
})
.use(brandRouter)
.use(schemaRouter)
.use(desinersRouter)
.use(fileRouter)
.use(userRouter)

export const api = treaty(app).api
export type App = typeof app