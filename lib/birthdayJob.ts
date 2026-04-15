import { db } from "@/lib/db";
import twilio from "twilio";

export async function runBirthdayJob() {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const currentYear = today.getFullYear();

    const [rows]: any = await db.query(
      `SELECT * FROM contacts
       WHERE MONTH(birthday) = ?
       AND DAY(birthday) = ?
       AND (last_birthday_sent_year IS NULL OR last_birthday_sent_year <> ?)`,
      [month, day, currentYear]
    );

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    for (const person of rows) {
      const message =
        person.custom_birthday_message ||
        `🎉 Happy Birthday ${person.name}! Wishing you a fantastic year ahead!`;

      // WhatsApp send
      if (
        person.whatsapp_enabled !== "no" &&
        (person.preferred_channel === "whatsapp" ||
          person.preferred_channel === "both" ||
          !person.preferred_channel)
      ) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:+91${person.mobile}`,
        });

        await db.query(
          `INSERT INTO email_logs (user_id, email, type, channel, status, sent_at, message)
           VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
          [1, person.email, "birthday", "whatsapp", "sent", message]
        );
      }

      // mark as sent for this year
      await db.query(
        `UPDATE contacts
         SET last_birthday_sent_year = ?
         WHERE id = ?`,
        [currentYear, person.id]
      );
    }

    console.log(`Birthday job completed. Processed ${rows.length} users.`);
    return rows.length;
  } catch (error) {
    console.error("Birthday job failed:", error);
    throw error;
  }
}