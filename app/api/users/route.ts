// app/api/graphql/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql as graphqlExec } from "graphql";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

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
    name: String
    email: String
    role: String
  }

  type Query {
    users: [User]
  }
`);

const rootValue = {
  users: async () => await db.select().from(usersTable),
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
