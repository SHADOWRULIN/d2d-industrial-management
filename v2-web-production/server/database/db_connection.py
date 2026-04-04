import sqlite3
import os

# --- PATH LOGIC ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "project_database.db")

# The Full V2 Schema 
SCHEMA_V2_SQL = """
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "approvals" (
	"approval_id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL UNIQUE,
	"status"	TEXT DEFAULT 'Pending',
	"workflow_status"	TEXT DEFAULT 'Design',
	"start_date"	TEXT,
	"end_date"	TEXT,
	"output_design_pdf_path"	TEXT,
	"output_detail_pdf_path"	TEXT,
	PRIMARY KEY("approval_id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "clients" (
	"client_id"	INTEGER,
	"name"	TEXT NOT NULL,
	"phone"	TEXT,
	"email"	TEXT UNIQUE,
	"company"	TEXT,
	"password"	TEXT,
	"profile_image"	TEXT,
	PRIMARY KEY("client_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "directors" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "feedback" (
	"feedback_id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"client_rating"	INTEGER,
	"comments"	TEXT,
	"timestamp"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("feedback_id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "logistics" (
	"id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL UNIQUE,
	"stage"	TEXT DEFAULT 'Pending',
	"packer_id"	INTEGER,
	"packing_date"	TEXT,
	"address"	TEXT,
	"tracking_id"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("packer_id") REFERENCES "workers"("worker_id") ON DELETE SET NULL,
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "machine_logs" (
	"log_id"	INTEGER,
	"worker_id"	INTEGER,
	"worker_name"	TEXT,
	"proposal_id"	INTEGER,
	"project_name"	TEXT,
	"machine_name"	TEXT,
	"hours_used"	REAL DEFAULT 0,
	"log_date"	TEXT,
	"work_description"	TEXT,
	"status"	TEXT DEFAULT 'Completed',
	"start_timestamp"	DATETIME,
	PRIMARY KEY("log_id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE,
	FOREIGN KEY("worker_id") REFERENCES "workers"("worker_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "machines" (
	"machine_id"	INTEGER,
	"machine_name"	TEXT NOT NULL UNIQUE,
	"status"	TEXT DEFAULT 'Active',
	PRIMARY KEY("machine_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "management" (
	"id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"machines"	TEXT,
	"work"	TEXT,
	"worker_id"	INTEGER,
	"start_date"	TEXT,
	"end_date"	TEXT,
	"status"	TEXT DEFAULT 'Pending',
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE,
	FOREIGN KEY("worker_id") REFERENCES "workers"("worker_id") ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS "payments" (
	"payment_id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"serial_number"	INTEGER,
	"vendor_name"	TEXT,
	"vendor_phone"	TEXT,
	"vendor_type"	TEXT,
	"amount"	REAL,
	"status"	TEXT,
	"payment_date"	TEXT,
	PRIMARY KEY("payment_id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "proposals" (
	"proposal_id"	INTEGER,
	"client_id"	INTEGER NOT NULL,
	"project_name"	TEXT NOT NULL,
	"proposal_description"	TEXT,
	"services"	TEXT,
	"image_path"	TEXT,
	"client_image"	TEXT,
	"status"	TEXT DEFAULT 'Pending',
	"rejection_reason"	TEXT,
	PRIMARY KEY("proposal_id" AUTOINCREMENT),
	FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "vendors" (
	"vendor_id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"vendor_type"	TEXT,
	"vendor_name"	TEXT,
	"vendor_phone"	TEXT,
	"material"	TEXT,
	"quantity"	REAL,
	"price"	REAL,
	"purchase_date"	TEXT,
	PRIMARY KEY("vendor_id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "warehouse" (
	"id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"type"	TEXT,
	"pdf_path"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "workers" (
	"worker_id"	INTEGER,
	"username"	TEXT UNIQUE,
	"password"	TEXT DEFAULT '123',
	"worker_name"	TEXT NOT NULL,
	"worker_job"	TEXT NOT NULL,
	PRIMARY KEY("worker_id" AUTOINCREMENT)
);

-- Seed Initial Data for Demonstration
INSERT OR IGNORE INTO "directors" VALUES (1,'admin','123');
INSERT OR IGNORE INTO "workers" VALUES (1,'ali','123','Ali','Tech');
INSERT OR IGNORE INTO "machines" VALUES (1,'Drill Press','Active');
INSERT OR IGNORE INTO "machines" VALUES (2,'3D Printers','Active');
INSERT OR IGNORE INTO "machines" VALUES (3,'Lathe','Active');
INSERT OR IGNORE INTO "machines" VALUES (4,'CNC Machine','Active');
INSERT OR IGNORE INTO "machines" VALUES (5,'Cutter','Active');
INSERT OR IGNORE INTO "machines" VALUES (6,'Embroidery Machine','Active');

COMMIT;
"""

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA_V2_SQL)
    return conn