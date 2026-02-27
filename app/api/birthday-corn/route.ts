import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import twilio from "twilio";

export async function GET() {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const [rows]: any = await db.query(
      `SELECT * FROM contacts 
       WHERE MONTH(birthday) = ? 
       AND DAY(birthday) = ?`,
      [month, day]
    );

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    for (const person of rows) {
      const message = `🎉 Happy Birthday ${person.name}! Wishing you a fantastic year ahead!`;

      // Send Email (if you already configured nodemailer)
      // await sendEmailFunction(...)

      // Send WhatsApp
      await client.messages.create({
        body: message,
        from: "whatsapp:+14155238886",
        to: `whatsapp:+91${person.mobile}`,
      });

      // Store log
      await db.query(
        "INSERT INTO email_logs (user_id, email, type, channel, status, sent_at, message) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
        [1, person.email, "birthday", "whatsapp", "sent", message]
      );
    }

    return NextResponse.json({
      message: `Processed ${rows.length} birthdays today`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cron failed" }, { status: 500 });
  }
}