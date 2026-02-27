setInterval(async () => {
  await fetch("http://localhost:3000/api/birthday-cron");
}, 24 * 60 * 60 * 1000); // 24 hours