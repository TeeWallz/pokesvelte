import { createAppUser, createToken } from "$lib/auth";
import { JWT_TOKEN_COOKIE_NAME } from "$lib/constant";
import { getEnhancedPrisma } from "$lib/prisma";
import { SpaceUserRole } from "@prisma/client";
import { fail, redirect, type Actions, error } from "@sveltejs/kit";
import {
    isPrismaClientKnownRequestError,
    withPassword,
} from "@zenstackhq/runtime";
import { nanoid } from "nanoid";
import bcrypt, { compare } from "bcryptjs";

// export const actions = {
//     default: async ({ request, cookies, locals, fetch }) => {
//         const data = await request.formData();

//         const email = data.get("email");
//         const password = data.get("password");

//         if (!email || !password) {
//             throw fail(400, "Email and password are required" as any);
//         }

//         //  post payload to /api/models/user/create
//         const res = await fetch("/api/model/user/create", {
//             method: "POST",
//             body: JSON.stringify({ data: { email, password } }),
//         });
//         const error = await res.json();
//         // const json = JSON.parse(text);
//         //  if the response is not 200, return the error
//         if (!res.ok) {
//             throw error(500, {
//                 message: { error },
//             });
//         }

//         //  get the user from the response
//         const user = await res.json();

//         createAppUser(locals.db, user);

//         throw redirect(303, `/auth/signin`);
//     },
// } satisfies Actions;
