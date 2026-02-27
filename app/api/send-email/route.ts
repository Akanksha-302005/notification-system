import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type, customMessage, name } = body;

    // 🎂 Templates
    const templates: any = {
      birthday: (name: string) => `
        <h2>🎉 Happy Birthday ${name}!</h2>
        <p>Wishing you a year filled with success, happiness and good health.</p>
      `,
    };

    // 📨 Final message
    const finalMessage =
      customMessage && customMessage.trim() !== ""
        ? customMessage
        : templates[type]?.(name || "User");

    // TODO: Add nodemailer logic here if needed

    // 💾 Store in DB with channel
    await db.query(
      `INSERT INTO email_logs 
       (user_id, email, type, message, status, channel, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        1,
        email,
        type,
        finalMessage,
        "sent",
        "email", // ✅ channel column
      ]
    );

    return NextResponse.json({
      message: "Email sent successfully 📧",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}