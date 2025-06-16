import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql as graphqlExec } from "graphql";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { gql } from "graphql-request";
import { decrypt, generateKey } from "@/lib/crypto";
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
    created_at: String
    updated_at: String
  }

  type Query {
    _empty: String
    }

  #mutations
  type Mutation {
    updateProfile(
      encrypted_id: String
      name: String
      email: String
      password: String
    ): User
  }
`);

const rootValue = {
  updateProfile: async ({
    encrypted_id,
    name,
    email,
    password,
  }: {
    encrypted_id: string;
    name?: string;
    email?: string;
    password?: string;
  }) => {
    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);

    const updateData: Partial<{
      name: string;
      email: string;
      password: string;
    }> = {};
    
     updateData.name = name;
     updateData.email = email;

    if (password !== undefined && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, Number(decryptedID)));
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
