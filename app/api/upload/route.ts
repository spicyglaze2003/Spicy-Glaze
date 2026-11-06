import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    const uploaded = files.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
      width: 800,
      height: 800,
      formats: {},
    }));

    return NextResponse.json(uploaded, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
