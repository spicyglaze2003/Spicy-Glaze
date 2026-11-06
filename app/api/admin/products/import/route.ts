import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db, saveDb } from "@/lib/store-data";
import type { Product } from "@/lib/types";

interface ImportError {
  row: number;
  field: string;
  value?: string | number;
  message: string;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let rawRows: any[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            message: "No Excel file uploaded",
            error: { code: "NO_FILE", details: [] },
          },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return NextResponse.json(
          {
            success: false,
            message: "Excel sheet is empty",
            error: { code: "EMPTY_SHEET", details: [] },
          },
          { status: 400 }
        );
      }

      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    } else {
      const body = await request.json();
      rawRows = Array.isArray(body.products)
        ? body.products
        : Array.isArray(body)
        ? body
        : [];
    }

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No rows found in the uploaded file",
          error: { code: "NO_ROWS", details: [] },
        },
        { status: 400 }
      );
    }

    const errors: ImportError[] = [];
    const validProductsToSave: Product[] = [];
    const seenNamesInBatch = new Set<string>();

    rawRows.forEach((row: any, idx: number) => {
      const rowNum = idx + 2; // Row 1 is header

      // Normalize field names (support "Product Name", "productName", "name", etc.)
      const name = (
        row["Product Name"] ||
        row["productName"] ||
        row["Name"] ||
        row["name"] ||
        ""
      ).toString().trim();

      const categoryName = (
        row["Category"] ||
        row["category"] ||
        ""
      ).toString().trim();

      const description = (
        row["Description"] ||
        row["description"] ||
        ""
      ).toString().trim();

      const rawPrice = row["Price"] ?? row["price"];
      const rawMrp = row["MRP"] ?? row["mrp"];
      const rawStock = row["Stock"] ?? row["stock"];
      const image = (
        row["Image"] ||
        row["Image URL"] ||
        row["image"] ||
        row["imageUrl"] ||
        ""
      ).toString().trim();

      // Validations
      if (!name) {
        errors.push({
          row: rowNum,
          field: "Product Name",
          value: name,
          message: "Product name is required",
        });
        return;
      }

      if (!categoryName) {
        errors.push({
          row: rowNum,
          field: "Category",
          value: categoryName,
          message: "Category is required",
        });
        return;
      }

      const price = Number(rawPrice);
      if (isNaN(price) || price <= 0) {
        errors.push({
          row: rowNum,
          field: "Price",
          value: rawPrice,
          message: "Price must be greater than 0",
        });
        return;
      }

      const mrp = rawMrp !== "" && rawMrp !== undefined ? Number(rawMrp) : price;
      if (isNaN(mrp) || mrp <= 0) {
        errors.push({
          row: rowNum,
          field: "MRP",
          value: rawMrp,
          message: "MRP must be greater than 0",
        });
        return;
      }

      const stock =
        rawStock !== "" && rawStock !== undefined
          ? parseInt(String(rawStock), 10)
          : 50;

      if (isNaN(stock) || stock < 0) {
        errors.push({
          row: rowNum,
          field: "Stock",
          value: rawStock,
          message: "Stock must be a non-negative integer",
        });
        return;
      }

      // Check duplicates in batch
      const lowerName = name.toLowerCase();
      if (seenNamesInBatch.has(lowerName)) {
        errors.push({
          row: rowNum,
          field: "Product Name",
          value: name,
          message: `Duplicate product in file: "${name}"`,
        });
        return;
      }
      seenNamesInBatch.add(lowerName);

      // Check duplicate in database
      const existingInDb = db.products.find(
        (p) => p.name.toLowerCase() === lowerName
      );
      if (existingInDb) {
        errors.push({
          row: rowNum,
          field: "Product Name",
          value: name,
          message: `Product already exists in database: "${name}"`,
        });
        return;
      }

      // Find or create category
      let category = db.categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (!category) {
        category = {
          id: Date.now() + idx,
          documentId: `cat-${Date.now() + idx}`,
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          rank: db.categories.length + 1,
          description: null,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        };
        db.categories.push(category);
      }

      const currentCount = db.products.length + validProductsToSave.length + 1;
      const productId = `PROD${String(currentCount).padStart(3, "0")}`;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `prod-${Date.now() + idx}`;

      const newProduct: Product = {
        id: Date.now() + idx + 1,
        documentId: `prod-${Date.now() + idx + 1}`,
        productId,
        productName: name,
        name,
        slug,
        shortDescription: description || null,
        description: description || null,
        category,
        subcategory: undefined,
        price,
        mrp,
        stock,
        image: image || null,
        imageUrl: image || null,
        isFeatured: false,
        isActive: true,
        availability: stock > 0 ? "in-stock" : "out-of-season",
        rank: currentCount,
        thumbnail: image
          ? {
              id: Date.now() + idx + 10,
              name,
              url: image,
              formats: {},
              alternativeText: name,
              caption: null,
              width: 400,
              height: 400,
              hash: "",
              ext: ".jpg",
              mime: "image/jpeg",
              size: 50,
              previewUrl: null,
              provider: "local",
              provider_metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : null,
        images: [],
        seoTitle: name,
        seoDescription: description || null,
        seoKeywords: `${name}, ${categoryName}`,
        variants: [
          {
            id: Date.now() + idx + 100,
            documentId: `var-${Date.now() + idx + 100}`,
            name: "Standard Pack",
            sku: `${productId}-STD`,
            price,
            mrp,
            stock,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      };

      validProductsToSave.push(newProduct);
    });

    if (validProductsToSave.length > 0) {
      db.products.unshift(...validProductsToSave);
      saveDb();
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. ${validProductsToSave.length} product(s) imported, ${errors.length} failed.`,
      data: {
        totalRows: rawRows.length,
        imported: validProductsToSave.length,
        failed: errors.length,
        errors,
      },
    });
  } catch (err: any) {
    console.error("Excel import error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to parse and import Excel file",
        error: { code: "IMPORT_EXCEPTION", details: [err.message] },
      },
      { status: 500 }
    );
  }
}
