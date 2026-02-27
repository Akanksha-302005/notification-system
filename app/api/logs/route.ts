import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {

    // 📜 Logs
    const [logs]: any = await db.query(
      "SELECT * FROM email_logs ORDER BY sent_at DESC"
    );

    // 👥 Total Users
    const [users]: any = await db.query(
      "SELECT COUNT(*) as total FROM users"
    );

    // 📧 Total Notifications
    const [total]: any = await db.query(
      "SELECT COUNT(*) as total FROM email_logs"
    );

    // 📅 Today Notifications
    const [today]: any = await db.query(
      "SELECT COUNT(*) as total FROM email_logs WHERE DATE(sent_at)=CURDATE()"
    );

    // 📧 Email Count
    const [emailCount]: any = await db.query(
      "SELECT COUNT(*) as total FROM email_logs WHERE channel='email'"
    );

    // 📱 WhatsApp Count
    const [whatsappCount]: any = await db.query(
      "SELECT COUNT(*) as total FROM email_logs WHERE channel='whatsapp'"
    );

    // 📊 Daily Stats
    const [dailyStats]: any = await db.query(`
      SELECT DATE(sent_at) as date, COUNT(*) as count
      FROM email_logs
      GROUP BY DATE(sent_at)
      ORDER BY DATE(sent_at)
    `);

    return NextResponse.json({
      logs,
      stats: {
        totalUsers: users[0].total,
        totalEmails: total[0].total,
        todayEmails: today[0].total,
        emailCount: emailCount[0].total,
        whatsappCount: whatsappCount[0].total,
      },
      dailyStats,
    });

  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json(
      { message: "Error fetching logs" },
      { status: 500 }
    );
  }
}