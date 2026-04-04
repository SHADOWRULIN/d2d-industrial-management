import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR,"project_database.db",)

SCHEMA_SQL = """
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "approvals" (
    "approval_id"   INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "status"    TEXT CHECK("status" IN ('Pending', 'Approved', 'Rejected')),
    "start_date"    TEXT,
    "end_date"  TEXT,
    "output_design_pdf_path"    TEXT,
    "output_detail_pdf_path"    TEXT,
    "workflow_status"   TEXT DEFAULT 'Design',
    PRIMARY KEY("approval_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "clients" (
    "client_id" INTEGER,
    "name"  TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company"   TEXT NOT NULL,
    "password"  TEXT,
    "profile_image" TEXT,
    PRIMARY KEY("client_id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "cost_summary" (
    "cost_id"   INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "serial_number" INTEGER NOT NULL CHECK("serial_number" > 0),
    "vendor_name"   TEXT NOT NULL,
    "vendor_phone"  TEXT NOT NULL CHECK(LENGTH("vendor_phone") BETWEEN 10 AND 15),
    "vendor_type"   TEXT NOT NULL CHECK("vendor_type" IN ('Raw Material', 'Parts/Items')),
    "total_amount"  REAL NOT NULL CHECK("total_amount" > 0),
    "paid_amount"   REAL NOT NULL CHECK("paid_amount" >= 0),
    "balance"   REAL GENERATED ALWAYS AS ("total_amount" - "paid_amount") STORED,
    "payment_date"  TEXT NOT NULL,
    PRIMARY KEY("cost_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "delivery" (
    "id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "address"   TEXT NOT NULL,
    "status"    TEXT NOT NULL CHECK("status" IN ('Pending', 'Completed')),
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "expenses" (
    "expense_id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "expense_pdf_path"  TEXT NOT NULL,
    PRIMARY KEY("expense_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "management" (
    "id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "machines"  TEXT NOT NULL,
    "work"  TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "start_date"    TEXT NOT NULL,
    "end_date"  TEXT NOT NULL,
    "status"    TEXT DEFAULT 'Pending',
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "manufacturing" (
    "id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "serial_number" TEXT NOT NULL,
    "machines"  TEXT NOT NULL,
    "work"  TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "start_date"    TEXT NOT NULL,
    "end_date"  TEXT NOT NULL,
    "status"    TEXT DEFAULT 'Pending',
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id"),
    FOREIGN KEY("worker_id") REFERENCES "workers"("id")
);

CREATE TABLE IF NOT EXISTS "packing" (
    "id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "worker_name"   TEXT NOT NULL,
    "start_date"    TEXT NOT NULL,
    "end_date"  TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "payments" (
    "payment_id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "serial_number" INTEGER NOT NULL CHECK("serial_number" > 0),
    "vendor_name"   TEXT NOT NULL,
    "vendor_phone"  TEXT NOT NULL CHECK(LENGTH("vendor_phone") BETWEEN 10 AND 15),
    "vendor_type"   TEXT NOT NULL CHECK("vendor_type" IN ('Raw Material', 'Parts/Items')),
    "amount"    REAL NOT NULL CHECK("amount" > 0),
    "status"    TEXT NOT NULL CHECK("status" IN ('Paid', 'Not Paid')),
    "payment_date"  TEXT NOT NULL,
    PRIMARY KEY("payment_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "project_files" (
    "file_id"   INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    PRIMARY KEY("file_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "proposals" (
    "proposal_id"   INTEGER,
    "client_id" INTEGER NOT NULL,
    "proposal_description"  TEXT NOT NULL,
    "services"  TEXT NOT NULL,
    "image_path"    TEXT,
    "status"    TEXT DEFAULT 'Pending' CHECK("status" IN ('Pending', 'Approved', 'Rejected')),
    "project_name"  TEXT,
    "client_image"  TEXT,
    PRIMARY KEY("proposal_id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "vendors" (
    "vendor_id" INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "vendor_type"   TEXT NOT NULL CHECK("vendor_type" IN ('Raw Material', 'Parts/Items')),
    "vendor_name"   TEXT NOT NULL,
    "vendor_phone"  TEXT NOT NULL CHECK(LENGTH("vendor_phone") BETWEEN 10 AND 15),
    "material"  TEXT NOT NULL,
    "quantity"  REAL NOT NULL CHECK("quantity" > 0),
    "price" REAL NOT NULL CHECK("price" > 0),
    "total_price"   REAL GENERATED ALWAYS AS ("quantity" * "price") STORED,
    "purchase_date" TEXT NOT NULL,
    PRIMARY KEY("vendor_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "warehouse" (
    "id"    INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "type"  TEXT NOT NULL CHECK("type" IN ('Inhouse', 'Outsource')),
    "pdf_path"  TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "warehouse_workers" (
    "worker_id" INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "worker_name"   TEXT NOT NULL,
    "worker_job"    TEXT NOT NULL,
    PRIMARY KEY("worker_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "proposals"("proposal_id")
);

CREATE TABLE IF NOT EXISTS "workers" (
    "worker_id" INTEGER,
    "proposal_id"   INTEGER NOT NULL,
    "worker_name"   TEXT NOT NULL,
    "worker_job"    TEXT NOT NULL,
    PRIMARY KEY("worker_id" AUTOINCREMENT),
    FOREIGN KEY("proposal_id") REFERENCES "approvals"("proposal_id")
);

-- Seed Initial Data
INSERT OR IGNORE INTO "clients" (client_id, name, phone, email, company, password) 
VALUES (1,'fahaz','03001111121','fahazkhan50@gmail.com','etalon','123');

COMMIT;
"""

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA_SQL)
    return conn