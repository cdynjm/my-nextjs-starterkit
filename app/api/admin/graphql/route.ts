import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql as graphqlExec } from "graphql";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { encrypt, generateKey } from "@/lib/crypto";

function setCorsHeaders(res: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_BASE_URL as string;

  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  setCorsHeaders(res);
  return res;
}

const schema = buildSchema(`
  type User {
    id: Int
    encrypted_id: String
    name: String
    email: String
    role: Int
  }

  type Query {
    users: [User]
    admins: [User]
  }
`);

const rootValue = {

  users: async () => {
    const key = await generateKey();
    const users = await db.select().from(usersTable);

    return Promise.all(
      users.map(async (user) => {
        const encryptedId = await encrypt(user.id.toString(), key);
        return { ...user, encrypted_id: encryptedId };
      })
    );
  },

  admins: async () => {
    const key = await generateKey();
    const users = await db.select().from(usersTable).where(eq(usersTable.role, 1));

    return Promise.all(
      users.map(async (user) => {
        const encryptedId = await encrypt(user.id.toString(), key);
        return { ...user, encrypted_id: encryptedId };
      })
    );
  },

};

export async function POST(req: NextRequest) {
  const { query, variables } = await req.json();

  const result = await graphqlExec({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
  });

  const res = NextResponse.json(result);
  setCorsHeaders(res);
  return res;
}
