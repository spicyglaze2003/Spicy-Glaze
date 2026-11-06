import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { ContactSubmission } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("filters[status][$eq]");

  let list = [...db.contactMessages];

  if (status) {
    list = list.filter((m) => m.status === status);
  }

  return NextResponse.json({
    data: list,
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: list.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newMsg: ContactSubmission = {
      id: Date.now(),
      documentId: `msg-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      subject: payload.subject || "Store Inquiry",
      message: payload.message,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.contactMessages.unshift(newMsg);
    saveDb();

    return NextResponse.json({ data: newMsg }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
