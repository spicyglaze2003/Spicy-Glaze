import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = db.contactMessages.findIndex((m) => String(m.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: { message: "Message not found" } }, { status: 404 });
    }

    db.contactMessages[idx] = {
      ...db.contactMessages[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.contactMessages[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
