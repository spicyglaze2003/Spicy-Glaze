import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const customer = (db.customers || []).find(
      (c) => String(c.id) === id || c.documentId === id
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: `Customer not found: ${id}` },
        { status: 404 }
      );
    }

    // Get orders belonging to this customer
    const orders = (db.orders || []).filter((o) => {
      const p1 = (customer.phone || "").replace(/\D/g, "");
      const p2 = (o.customerPhone || o.customer?.phone || o.shippingAddress?.phone || "").replace(/\D/g, "");
      if (p1 && p2 && p1 === p2) return true;
      if (customer.email && o.customer?.email && customer.email.toLowerCase() === o.customer.email.toLowerCase()) return true;
      return o.customerName?.toLowerCase() === customer.name.toLowerCase();
    });

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        orders,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = (db.customers || []).findIndex(
      (c) => String(c.id) === id || c.documentId === id
    );

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: `Customer not found: ${id}` },
        { status: 404 }
      );
    }

    const current = db.customers[idx];
    const updated = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      email: payload.email !== undefined ? payload.email.trim() : current.email,
      phone: payload.phone !== undefined ? payload.phone : current.phone,
      address: payload.address !== undefined ? payload.address : current.address,
      segment: payload.segment !== undefined ? payload.segment : current.segment,
      isBlocked: payload.isBlocked !== undefined ? Boolean(payload.isBlocked) : current.isBlocked,
      updatedAt: new Date().toISOString(),
    };

    db.customers[idx] = updated;
    saveDb();

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const idx = (db.customers || []).findIndex(
      (c) => String(c.id) === id || c.documentId === id
    );

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: `Customer not found: ${id}` },
        { status: 404 }
      );
    }

    const removed = db.customers.splice(idx, 1)[0];
    saveDb();

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
      data: removed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
