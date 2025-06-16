import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt, generateKey } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    await db.insert(usersTable).values({
      name,
      email,
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Failed to insert user", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { encryptedID, name, email } = body;
    const key = await generateKey();
    const decryptedID = await decrypt(encryptedID, key);

    await db
      .update(usersTable)
      .set({ name: name, email: email })
      .where(eq(usersTable.id, Number(decryptedID)));

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Failed to insert user", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { encryptedID } = body;
    const key = await generateKey();
    const decryptedID = await decrypt(encryptedID, key);

    await db.delete(usersTable).where(eq(usersTable.id, Number(decryptedID)));

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Failed to insert user", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
