import { NextResponse } from "next/server";
import Twilio from "twilio";
import { db } from "@/lib/db";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    // 📱 Send WhatsApp
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
    });

    // 💾 Store in DB
    await db.query(
      `INSERT INTO email_logs (user_id, email, type, message, status, channel)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1,
        phone,
        "birthday",
        message,
        "sent",
        "whatsapp",
      ]
    );

    return NextResponse.json({
      message: "WhatsApp sent successfully 📱",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error sending WhatsApp" },
      { status: 500 }
    );
  }
}