import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import clientPromise from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(await clientPromise.then((c) => c.db())),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      plainPassword: {
        type: "string",
        required: false,
        input: false,
        // Never expose through the session or user API. It is only read
        // server-side by admin actions to support "view saved password".
        returned: false,
      },
      blocked: {
        type: "boolean",
        required: false,
        input: false,
        returned: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ],
  plugins: [
    admin({
      defaultRole: "user",
    }),
    nextCookies(),
  ],
});
