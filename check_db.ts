import mysql from "mysql2/promise";
import "dotenv/config";

const url = process.env.DATABASE_URL!;

try {
  console.log(`Attempting to connect to: ${url.replace(/:([^:@]+)@/, ":****@")}`);
  const connection = await mysql.createConnection(url);
  console.log("--- DATABASE CONNECTION SUCCESS ---");
  
  const [tables] = await connection.query("SHOW TABLES;");
  console.log("Tables found:", JSON.stringify(tables));
  
  const [users] = await (connection.query("SELECT * FROM users;")).catch(() => [[]]);
  console.log("Users found:", JSON.stringify(users));
  
  const [sessions] = await (connection.query("SELECT * FROM sessions;")).catch(() => [[]]);
  console.log("Sessions found:", JSON.stringify(sessions));
  
  await connection.end();
} catch (error: any) {
  console.error("--- DATABASE CONNECTION FAILED ---");
  console.error(error.message);
}
process.exit(0);
