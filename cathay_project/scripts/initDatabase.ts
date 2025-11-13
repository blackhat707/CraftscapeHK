import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { api } from "../convex/_generated/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or VITE_CONVEX_URL environment variable is required");
  console.error("Please set CONVEX_URL in your .env file or environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Helper function to parse CSV
function parseCSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, ""));

  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || "";
      // Remove surrounding quotes
      value = value.replace(/^"|"$/g, "");
      
      // Try to parse JSON strings (for LocalizedString objects)
      if (value.startsWith("{") && value.endsWith("}")) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      
      // Try to parse JSON arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      
      // Parse numbers
      if (header === "id" && !isNaN(Number(value))) {
        value = String(value);
      } else if (
        ["price", "quantity", "total"].includes(header) &&
        !isNaN(Number(value))
      ) {
        value = Number(value);
      } else if (header === "unread") {
        value = value === "1" || value === "true";
      } else if (header === "isFeatured") {
        value = value === "1" || value === "true" || value === "True";
      }
      
      // Handle null/empty values
      if (value === "unknown_value_please_contact_support" || value === "") {
        value = null;
      }
      
      // Convert id to string
      if (header === "id") {
        value = String(value);
      }
      
      row[header] = value;
    });
    data.push(row);
  }
  return data;
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function initializeDatabase() {
  console.log("Starting database initialization...");
  console.log(`Using Convex URL: ${CONVEX_URL}`);
  const dataDir = path.join(__dirname, "../data");
  
  if (!fs.existsSync(dataDir)) {
    console.error(`Error: Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  try {
    // Initialize Products
    console.log("Loading products...");
    const products = parseCSV(path.join(dataDir, "products.csv"));
    console.log(`Found ${products.length} products`);
    await client.mutation(api.data.initializeProducts, { products });
    console.log("✓ Products initialized");

    // Initialize Crafts
    console.log("Loading crafts...");
    const crafts = parseCSV(path.join(dataDir, "crafts.csv"));
    console.log(`Found ${crafts.length} crafts`);
    await client.mutation(api.data.initializeCrafts, { crafts });
    console.log("✓ Crafts initialized");

    // Initialize Events
    console.log("Loading events...");
    const events = parseCSV(path.join(dataDir, "events.csv"));
    console.log(`Found ${events.length} events`);
    await client.mutation(api.data.initializeEvents, { events });
    console.log("✓ Events initialized");

    // Initialize Artisans
    console.log("Loading artisans...");
    const artisans = parseCSV(path.join(dataDir, "artisans.csv"));
    console.log(`Found ${artisans.length} artisans`);
    await client.mutation(api.data.initializeArtisans, { artisans });
    console.log("✓ Artisans initialized");

    // Initialize Orders
    console.log("Loading orders...");
    const orders = parseCSV(path.join(dataDir, "orders.csv"));
    console.log(`Found ${orders.length} orders`);
    await client.mutation(api.data.initializeOrders, { orders });
    console.log("✓ Orders initialized");

    // Initialize Message Threads
    console.log("Loading message threads...");
    const messageThreads = parseCSV(path.join(dataDir, "message_threads.csv"));
    console.log(`Found ${messageThreads.length} message threads`);
    await client.mutation(api.data.initializeMessageThreads, {
      messageThreads,
    });
    console.log("✓ Message threads initialized");

    console.log("\n✅ Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initializeDatabase();

