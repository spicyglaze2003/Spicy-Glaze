import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = (db.adminUsers || []).find(
    (u) => String(u.id) === id || u.documentId === id
  );

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = (db.adminUsers || []).findIndex(
      (u) => String(u.id) === id || u.documentId === id
    );

    if (idx === -1) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    db.adminUsers[idx] = {
      ...db.adminUsers[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: db.adminUsers[idx],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const initialLen = (db.adminUsers || []).length;

    db.adminUsers = (db.adminUsers || []).filter(
      (u) => String(u.id) !== id && u.documentId !== id
    );

    if (db.adminUsers.length === initialLen) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    saveDb();

    return NextResponse.json({
      success: true,
      message: "Admin user removed successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}

