import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function GET() {
  return NextResponse.json({
    data: db.siteSetting,
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    db.siteSetting = {
      ...db.siteSetting,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.siteSetting });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
