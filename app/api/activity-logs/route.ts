import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [],
    meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
  });
}
