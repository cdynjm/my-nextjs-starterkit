import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  await db.insert(usersTable).values({
    name: name,
    email: email,
    password: hashedPassword,
    role: 1
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const users = await db.select().from(usersTable);
  return NextResponse.json({ success: true, users });
}
