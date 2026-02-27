import "@/lib/cron";
import Providers from "./providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notification System",
  description: "Email Notification Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}