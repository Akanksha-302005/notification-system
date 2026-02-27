import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, mobile, birthday } = await req.json();

    if (!name || !email || !mobile || !birthday) {
      return NextResponse.json({
        message: "All fields are required ❌",
      });
    }

    await db.query(
      "INSERT INTO users (name, email, mobile, birthday) VALUES (?, ?, ?, ?)",
      [name, email, mobile, birthday]
    );

    return NextResponse.json({
      message: "User added successfully ✅",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Error adding user ❌",
    });
  }
}