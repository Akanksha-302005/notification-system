import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "notification_system",
  port: 3307   // important because XAMPP shows 3307
});