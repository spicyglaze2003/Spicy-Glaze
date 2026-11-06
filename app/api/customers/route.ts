import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Customer, CustomerSegment } from "@/lib/admin-types";

// Sync customers from orders so CRM always has full real customer data
function syncCustomersFromOrders() {
  if (!Array.isArray(db.customers)) {
    db.customers = [];
  }

  const orders = db.orders || [];

  for (const ord of orders) {
    const custPhone = ord.customerPhone || ord.customer?.phone || ord.shippingAddress?.phone || "";
    const custName = ord.customerName || ord.customer?.name || ord.shippingAddress?.name || "Customer";
    const custEmail = ord.customer?.email || (custPhone ? `${custPhone}@spicyglaze.in` : "customer@spicyglaze.in");
    const orderTotal = Number(ord.totalAmount || ord.total || 0);

    // Find existing customer by phone or email or name
    let existing = db.customers.find((c) => {
      if (custPhone && c.phone && c.phone.replace(/\D/g, "") === custPhone.replace(/\D/g, "")) {
        return true;
      }
      if (custEmail && c.email && c.email.toLowerCase() === custEmail.toLowerCase()) {
        return true;
      }
      return c.name.toLowerCase() === custName.toLowerCase();
    });

    if (!existing) {
      existing = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        documentId: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: custName,
        email: custEmail,
        phone: custPhone || null,
        address: ord.shippingAddress || (ord.customerAddress ? {
          name: custName,
          phone: custPhone,
          line1: ord.customerAddress,
          city: "Erode",
          state: "Tamil Nadu",
          pincode: "638001",
          country: "India",
        } : null),
        totalOrders: 1,
        totalSpent: orderTotal,
        lastOrderAt: ord.createdAt,
        segment: orderTotal >= 5000 ? "vip" : "new",
        isBlocked: false,
        createdAt: ord.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.customers.push(existing);
    }
  }
}

export async function GET(request: Request) {
  syncCustomersFromOrders();

  const { searchParams } = new URL(request.url);
  const search = (
    searchParams.get("search") ||
    searchParams.get("filters[$or][0][name][$containsi]") ||
    ""
  ).toLowerCase();
  const segment = (searchParams.get("segment") || "").toLowerCase();

  // Recalculate customer metrics based on current orders
  const orders = db.orders || [];
  for (const cust of db.customers) {
    const custOrders = orders.filter((o) => {
      const p1 = (cust.phone || "").replace(/\D/g, "");
      const p2 = (o.customerPhone || o.customer?.phone || o.shippingAddress?.phone || "").replace(/\D/g, "");
      if (p1 && p2 && p1 === p2) return true;
      if (cust.email && o.customer?.email && cust.email.toLowerCase() === o.customer.email.toLowerCase()) return true;
      return o.customerName?.toLowerCase() === cust.name.toLowerCase();
    });

    if (custOrders.length > 0) {
      cust.totalOrders = custOrders.length;
      cust.totalSpent = custOrders.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);
      const sorted = [...custOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      cust.lastOrderAt = sorted[0].createdAt;
      cust.segment = cust.totalSpent >= 5000 ? "vip" : cust.totalOrders > 1 ? "repeat" : "new";
    }
  }

  let list = [...db.customers];

  if (search) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.phone && c.phone.includes(search))
    );
  }

  if (segment && segment !== "all") {
    list = list.filter((c) => c.segment === segment);
  }

  return NextResponse.json({
    success: true,
    data: list,
    meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: list.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    if (!payload.name || !payload.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 }
      );
    }

    const email = payload.email?.trim() || `${payload.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@spicyglaze.in`;
    const phone = payload.phone?.trim() || null;

    const newCustomer: Customer = {
      id: Date.now(),
      documentId: `cust-${Date.now()}`,
      name: payload.name.trim(),
      email,
      phone,
      address: payload.address || {
        name: payload.name.trim(),
        phone: phone || "",
        line1: payload.addressLine || "",
        city: payload.city || "Erode",
        state: payload.state || "Tamil Nadu",
        pincode: payload.pincode || "638001",
        country: "India",
      },
      totalOrders: 0,
      totalSpent: 0,
      lastOrderAt: null,
      segment: (payload.segment as CustomerSegment) || "new",
      isBlocked: Boolean(payload.isBlocked),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.customers)) {
      db.customers = [];
    }
    db.customers.unshift(newCustomer);
    saveDb();

    return NextResponse.json(
      { success: true, message: "Customer created successfully", data: newCustomer },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
