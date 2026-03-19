import Elysia from "elysia";
import { z } from "zod";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/roles";
import bcrypt from "bcryptjs";

export const userRouter = new Elysia({
    prefix: "/user",
})
.post("/signup", async ({ body, set }) => {
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, body.email)
    });

    if (existingUser) {
        set.status = 400;
        return Response.json({
            code: 400,
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    await db.insert(users).values({
        hashedPassword: hashedPassword,
        email: body.email,
        role: body.email === process.env.MAIN_ADMIN_EMAIL ? "ADMIN" : "USER"
    });
}, {
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
});