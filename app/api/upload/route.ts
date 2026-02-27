
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded ❌" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, { raw: false });

    for (const row of data as any[]) {
      const { name, email, mobile, birthday } = row;

      await db.query(
  "INSERT INTO users (name, email, mobile, birthday) VALUES (?, ?, ?, ?)",
  [
    String(row.name),
    String(row.email),
    String(row.mobile),
    String(row.birthday)
  ]
);
    }

    return NextResponse.json({
      message: "Excel data uploaded successfully ✅",
    });
  } catch (error: any) {
  console.error("REAL ERROR:", error);
  return NextResponse.json({
    message: "Error uploading Excel ❌",
    error: error?.message || String(error),
  });
}
  }
