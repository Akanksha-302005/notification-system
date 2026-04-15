import { NextResponse } from "next/server";
import { runBirthdayJob } from "@/lib/birthdayJob";

export async function GET() {
  try {
    const count = await runBirthdayJob();

    return NextResponse.json({
      message: `Processed ${count} birthdays today`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Cron failed" },
      { status: 500 }
    );
  }
}