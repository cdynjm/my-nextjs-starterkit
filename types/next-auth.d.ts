// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: number;
      created_at: string;
      iv: string;
    } & DefaultSession["user"];
    token: string;
  }

  interface User extends DefaultUser {
    role: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: number;
    accessToken: string;
  }
}
