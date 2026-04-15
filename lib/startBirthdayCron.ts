import cron from "node-cron";
import { runBirthdayJob } from "@/lib/birthdayJob";

let isCronStarted = false;

export function startBirthdayCron() {
  if (isCronStarted) return;
  isCronStarted = true;

  cron.schedule("0 9 * * *", async () => {
    console.log("Running birthday cron at 9:00 AM...");
    try {
      await runBirthdayJob();
    } catch (error) {
      console.error("Scheduled birthday cron error:", error);
    }
  });

  console.log("Birthday cron started.");
}