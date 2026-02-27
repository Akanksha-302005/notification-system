import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1");

    return NextResponse.json({
      message: "Database Connected Successfully ✅",
      rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Database Connection Failed ❌",
    });
  }
}