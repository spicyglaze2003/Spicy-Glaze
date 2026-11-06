import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { AdminUser, AdminRole } from "@/lib/admin-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let list = db.adminUsers || [];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  }

  return NextResponse.json({
    success: true,
    data: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const role: AdminRole = payload.role || "manager";

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(db.adminUsers)) {
      db.adminUsers = [];
    }

    const exists = db.adminUsers.some((u) => u.email.toLowerCase() === email);
    if (exists) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const newUser: AdminUser = {
      id: Date.now(),
      documentId: `usr-${Date.now()}`,
      name,
      email,
      role,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.adminUsers.push(newUser);
    saveDb();

    return NextResponse.json(
      { success: true, message: "Admin user created successfully", data: newUser },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create user" },
      { status: 400 }
    );
  }
}

