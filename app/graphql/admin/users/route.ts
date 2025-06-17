import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql as graphqlExec } from "graphql";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { gql } from "graphql-request";
import { encrypt, decrypt, generateKey } from "@/lib/crypto";
import bcrypt from "bcrypt";

const schema = buildSchema(gql`
  #types
  type User {
    id: Int
    encrypted_id: String
    name: String
    email: String
    password: String
    role: Int
    photo: String
    created_at: String
    updated_at: String
  }

  #queries
  type Query {
    getUsers: [User]
  }

  #mutations
  type Mutation {
    createUser(name: String, email: String, password: String, photo: String): User
    updateUser(encrypted_id: String, name: String, email: String): User
    deleteUser(encrypted_id: String): User
  }
`);

const rootValue = {
  getUsers: async () => {
    const key = await generateKey();
    const users = await db.select().from(usersTable);

    return Promise.all(
      users.map(async (user) => {
        const encryptedId = await encrypt(user.id.toString(), key);
        return { ...user, encrypted_id: encryptedId };
      })
    );
  },

  createUser: async ({
    name,
    email,
    password,
    photo
  }: {
    name: string;
    email: string;
    password: string;
    photo: string;
  }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .insert(usersTable)
      .values({ name, email, password: hashedPassword, photo, role: 1 });
  },

  updateUser: async ({
    encrypted_id,
    name,
    email,
  }: {
    encrypted_id: string;
    name?: string;
    email?: string;
  }) => {
    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);

    await db
      .update(usersTable)
      .set({ name, email })
      .where(eq(usersTable.id, Number(decryptedID)));
  },

  deleteUser: async ({ encrypted_id }: { encrypted_id: string }) => {
    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);

    await db.delete(usersTable).where(eq(usersTable.id, Number(decryptedID)));
    return true;
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

function setCorsHeaders(res: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_BASE_URL as string;

  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  setCorsHeaders(res);
  return res;
}
