import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: { message: "Identifier and password are required" } },
        { status: 400 }
      );
    }

    const cleanEmail = identifier.trim().toLowerCase();
    const ADMIN_EMAIL = "spicyglaze2003@gmail.com";
    const ADMIN_PASSWORD = "Success@2026";

    // Strict authentication against admin credentials
    const isMasterAdmin =
      (cleanEmail === ADMIN_EMAIL || cleanEmail === "spicyglaze" || cleanEmail === "spicyglaze2003") &&
      password === ADMIN_PASSWORD;

    const adminUser = (db.adminUsers || []).find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.name.toLowerCase() === identifier.trim().toLowerCase()
    );

    const isValid = isMasterAdmin || (adminUser && password === ADMIN_PASSWORD);

    if (!isValid) {
      return NextResponse.json(
        { error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    if (adminUser) {
      adminUser.lastLoginAt = new Date().toISOString();
      saveDb();
    }

    const userObj = {
      id: adminUser ? adminUser.id : 1,
      username: adminUser ? adminUser.name : "spicyglaze",
      email: adminUser ? adminUser.email : ADMIN_EMAIL,
      role: adminUser ? adminUser.role : "super-admin",
      provider: "local",
      confirmed: true,
      blocked: adminUser ? !adminUser.isActive : false,
      createdAt: adminUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      jwt: `sg-admin-jwt-${userObj.id}-${Date.now()}`,
      user: userObj,
    });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
