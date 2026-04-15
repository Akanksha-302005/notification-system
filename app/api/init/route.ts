import { NextResponse } from "next/server";
import { startBirthdayCron } from "@/lib/startBirthdayCron";

startBirthdayCron();

export async function GET() {
  return NextResponse.json({ message: "Cron initialized" });
}