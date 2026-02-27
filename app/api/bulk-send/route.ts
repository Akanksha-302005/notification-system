import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      await db.query(
        "INSERT INTO contacts (name, email, mobile, birthday) VALUES (?, ?, ?, ?)",
        [row.name, row.email, row.mobile, row.birthday]
      );
    }

    return NextResponse.json({
      message: "Contacts uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Bulk upload failed" },
      { status: 500 }
    );
  }
}