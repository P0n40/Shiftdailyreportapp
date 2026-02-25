import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a2a12986/health", (c) => {
  return c.json({ status: "ok" });
});

// ==========================
// REPORT ROUTES
// ==========================

// Get all reports
app.get("/make-server-a2a12986/reports", async (c) => {
  try {
    // Get all reports
    const reports = await kv.getByPrefix("report:");
    
    // Sort by date (newest first)
    const sortedReports = reports
      .filter(r => r.id) // Only reports with IDs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ reports: sortedReports });
  } catch (error) {
    console.log(`Error fetching reports: ${error}`);
    return c.json({ error: "Failed to fetch reports" }, 500);
  }
});

// Get single report
app.get("/make-server-a2a12986/reports/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report:${id}`);

    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }

    return c.json({ report });
  } catch (error) {
    console.log(`Error fetching report: ${error}`);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

// Create report
app.post("/make-server-a2a12986/reports", async (c) => {
  try {
    const reportData = await c.req.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const report = {
      id,
      ...reportData,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`report:${id}`, report);

    return c.json({ success: true, report });
  } catch (error) {
    console.log(`Error creating report: ${error}`);
    return c.json({ error: "Failed to create report" }, 500);
  }
});

// Update report
app.put("/make-server-a2a12986/reports/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const existingReport = await kv.get(`report:${id}`);

    if (!existingReport) {
      return c.json({ error: "Report not found" }, 404);
    }

    const updates = await c.req.json();
    const report = {
      ...existingReport,
      ...updates,
      id, // Keep original ID
      createdAt: existingReport.createdAt, // Keep original creation time
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`report:${id}`, report);

    return c.json({ success: true, report });
  } catch (error) {
    console.log(`Error updating report: ${error}`);
    return c.json({ error: "Failed to update report" }, 500);
  }
});

// Delete report
app.delete("/make-server-a2a12986/reports/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`report:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting report: ${error}`);
    return c.json({ error: "Failed to delete report" }, 500);
  }
});

Deno.serve(app.fetch);