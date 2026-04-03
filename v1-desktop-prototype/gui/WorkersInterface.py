import tkinter as tk
from tkinter import messagebox, ttk
import sqlite3
import os
from database.db_connection import connect_db

class WorkersInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Workers Management")
        self.root.geometry("600x500")

        # Ensure DB and Table exist
        self.db_path = os.path.join("database", "project_database.db")
        self.ensure_database()

        tk.Label(self.root, text="Workers Management", font=("Arial", 18)).pack(pady=10)

        # Worker Name Dropdown
        tk.Label(self.root, text="Select Worker Name:").pack()
        self.worker_name_var = tk.StringVar()
        self.worker_name_combo = ttk.Combobox(self.root, textvariable=self.worker_name_var, postcommand=self.load_worker_names)
        self.worker_name_combo.pack()

        # Worker Job Dropdown
        tk.Label(self.root, text="Select Worker Job:").pack()
        self.worker_job_var = tk.StringVar()
        self.worker_job_combo = ttk.Combobox(self.root, textvariable=self.worker_job_var, postcommand=self.load_worker_jobs)
        self.worker_job_combo.pack()

        tk.Button(self.root, text="Add Worker", command=self.add_worker).pack(pady=5)
        tk.Button(self.root, text="Update Worker", command=self.update_worker).pack(pady=5)
        tk.Button(self.root, text="Delete Worker", command=self.delete_worker).pack(pady=5)

        # Worker Table (Treeview Fix)
        self.tree = ttk.Treeview(self.root, columns=("worker_id", "worker_name", "worker_job"), show="headings")
        for col, label in zip(self.tree["columns"], ["Worker ID", "Worker Name", "Worker Job"]):
            self.tree.heading(col, text=label)
            self.tree.column(col, width=180)
        self.tree.pack(fill="both", expand=True, padx=10, pady=10)

        self.load_workers()

    def ensure_database(self):
        os.makedirs("database", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workers (
                worker_id INTEGER PRIMARY KEY AUTOINCREMENT,
                proposal_id INTEGER NOT NULL,
                worker_name TEXT NOT NULL,
                worker_job TEXT NOT NULL,
                FOREIGN KEY(proposal_id) REFERENCES approvals(proposal_id)
            )
        """)
        conn.commit()
        conn.close()

    def load_worker_names(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT worker_id, worker_name FROM workers WHERE proposal_id = ?", (self.proposal_id,))
        names = [f"{row[0]} - {row[1]}" for row in cursor.fetchall()]
        conn.close()
        self.worker_name_combo['values'] = names

    def load_worker_jobs(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT worker_job FROM workers WHERE proposal_id = ?", (self.proposal_id,))
        jobs = [row[0] for row in cursor.fetchall()]
        conn.close()
        self.worker_job_combo['values'] = jobs

    def add_worker(self):
        name = self.worker_name_var.get().strip()
        job = self.worker_job_var.get().strip()

        if not name or not job:
            messagebox.showwarning("Input Error", "Please select or enter both worker name and job.")
            return

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO workers (proposal_id, worker_name, worker_job) VALUES (?, ?, ?)
        """, (self.proposal_id, name, job))
        conn.commit()
        conn.close()

        messagebox.showinfo("Success", "Worker added successfully!")
        self.worker_name_var.set("")
        self.worker_job_var.set("")
        self.load_workers()

    def update_worker(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a worker to update.")
            return

        item = self.tree.item(selected)
        worker_id = item["values"][0]

        name = self.worker_name_var.get().strip()
        job = self.worker_job_var.get().strip()

        if not name or not job:
            messagebox.showerror("Input Error", "Both name and job must be filled.")
            return

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE workers SET worker_name = ?, worker_job = ? WHERE worker_id = ? AND proposal_id = ?
        """, (name, job, worker_id, self.proposal_id))
        conn.commit()
        conn.close()

        messagebox.showinfo("Success", "Worker updated successfully!")
        self.load_workers()

    def delete_worker(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a worker to delete.")
            return

        item = self.tree.item(selected)
        worker_id = item["values"][0]

        confirm = messagebox.askyesno("Confirm Delete", "Are you sure you want to remove this worker?")
        if not confirm:
            return

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM workers WHERE worker_id = ? AND proposal_id = ?", (worker_id, self.proposal_id))
        conn.commit()
        conn.close()

        messagebox.showinfo("Deleted", "Worker removed successfully!")
        self.load_workers()

    def load_workers(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT worker_id, worker_name, worker_job FROM workers WHERE proposal_id = ?", (self.proposal_id,))
        workers = cursor.fetchall()
        conn.close()

        self.tree.delete(*self.tree.get_children())  # ✅ Clears table before inserting
        for worker in workers:
            self.tree.insert('', 'end', values=worker)  # ✅ Inserts correct data

if __name__ == "__main__":
    root = tk.Tk()
    WorkersInterface(root, "1")
    root.mainloop()
