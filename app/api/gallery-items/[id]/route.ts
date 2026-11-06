import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  db.gallery = db.gallery.filter((g) => String(g.id) !== id);
  saveDb();
  return NextResponse.json({ data: { message: "Gallery item deleted" } });
}
