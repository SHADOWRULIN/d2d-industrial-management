import tkinter as tk
from tkinter import messagebox, ttk
from tkcalendar import DateEntry
import sqlite3
from database.db_connection import connect_db

class ManagementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Management System")
        self.root.geometry("800x650")

        tk.Label(self.root, text="Management System", font=("Arial", 18)).pack(pady=10)

        # Machine Dropdown
        tk.Label(self.root, text="Select Machine:").pack()
        self.machine_var = tk.StringVar()
        machine_list = ["Drill Press", "Embroidery Machine", "3D Printers", "Bartacking Machine", "Manufacturing Machinery"]
        self.machine_combo = ttk.Combobox(self.root, textvariable=self.machine_var, values=machine_list, state="readonly")
        self.machine_combo.pack()

        # Work Type
        tk.Label(self.root, text="Work Type:").pack()
        self.work_entry = tk.Entry(self.root)
        self.work_entry.pack()

        # Worker Dropdown
        tk.Label(self.root, text="Select Worker:").pack()
        self.worker_var = tk.StringVar()
        self.worker_combo = ttk.Combobox(self.root, textvariable=self.worker_var, postcommand=self.load_worker_names)
        self.worker_combo.pack()

        # Dates
        tk.Label(self.root, text="Start Date:").pack()
        self.start_date_entry = DateEntry(self.root)
        self.start_date_entry.pack()

        tk.Label(self.root, text="End Date:").pack()
        self.end_date_entry = DateEntry(self.root)
        self.end_date_entry.pack()

        # Status Dropdown
        tk.Label(self.root, text="Status:").pack()
        self.status_var = tk.StringVar()
        status_options = ["Pending", "In Progress", "Completed"]
        self.status_combo = ttk.Combobox(self.root, textvariable=self.status_var, values=status_options, state="readonly")
        self.status_combo.pack()

        # Buttons
        tk.Button(self.root, text="Save Task", command=self.save_management_data).pack(pady=5)
        tk.Button(self.root, text="Update Selected", command=self.update_selected).pack(pady=5)
        tk.Button(self.root, text="Delete Selected", command=self.delete_selected).pack(pady=5)

        # Treeview Table
        self.tree = ttk.Treeview(self.root, columns=("ID", "Machine", "Work", "Worker", "Start", "End", "Status"), show="headings")
        for col, label in zip(self.tree["columns"], ["ID", "Machine", "Work Type", "Worker", "Start Date", "End Date", "Status"]):
            self.tree.heading(col, text=label)
            self.tree.column(col, width=120)
        self.tree.column("ID", width=50)
        self.tree.pack(fill="both", expand=True, pady=10)

        self.setup_database()
        self.load_saved_entries()

    def setup_database(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS management (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proposal_id INTEGER NOT NULL,
                machines TEXT NOT NULL,
                work TEXT NOT NULL,
                worker_id INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY(proposal_id) REFERENCES approvals(proposal_id),
                FOREIGN KEY(worker_id) REFERENCES workers(id)
            )
        """)
        conn.commit()
        conn.close()

    def load_worker_names(self):
        conn = connect_db()
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT DISTINCT worker_id, worker_name FROM workers")
            worker_list = [f"{row[0]} - {row[1]}" for row in cursor.fetchall()]  # ✅ Correct worker_name reference
            self.worker_combo['values'] = worker_list
        except sqlite3.Error as e:
            self.worker_combo['values'] = []
            messagebox.showwarning("Warning", f"Could not load workers:\n{e}")
        finally:
            conn.close()


    def save_management_data(self):
        machine = self.machine_var.get()
        work = self.work_entry.get()
        worker_id = self.worker_var.get().split(" - ")[0]
        start_date = self.start_date_entry.get_date()
        end_date = self.end_date_entry.get_date()
        status = self.status_var.get()

        if not all([machine, work, worker_id, status]):
            messagebox.showerror("Missing Info", "Please fill all fields before saving.")
            return

        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO management (proposal_id, machines, work, worker_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (self.proposal_id, machine, work, worker_id, start_date, end_date, status))
        conn.commit()
        conn.close()

        messagebox.showinfo("Success", "Task saved.")
        self.load_saved_entries()
    
    def delete_selected(self):
        selected_item = self.tree.selection()
        
        if not selected_item:
            messagebox.showwarning("Selection Error", "Please select a task from the list to delete.")
            return

        # Grab the ID from the first column of the selected row
        record_id = self.tree.item(selected_item)['values'][0]

        # Ask for confirmation
        confirm = messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this task?")
        if confirm:
            conn = connect_db()
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM management WHERE id = ?", (record_id,))
                conn.commit()
                messagebox.showinfo("Success", "Task deleted successfully.")
            except sqlite3.Error as e:
                messagebox.showerror("Database Error", f"An error occurred: {e}")
            finally:
                conn.close()

            # Refresh the table
            self.load_saved_entries()

    def update_selected(self):
        selected_item = self.tree.selection()
        
        if not selected_item:
            messagebox.showwarning("Selection Error", "Please select a task from the list to update.")
            return

        # Grab the ID of the selected row
        record_id = self.tree.item(selected_item)['values'][0]

        # Get the new data from the form fields
        machine = self.machine_var.get()
        work = self.work_entry.get()
        worker_id_string = self.worker_var.get()
        start_date = self.start_date_entry.get_date()
        end_date = self.end_date_entry.get_date()
        status = self.status_var.get()

        if not all([machine, work, worker_id_string, status]):
            messagebox.showerror("Missing Info", "Please ensure all fields are filled out before updating.")
            return

        # Extract just the ID from the worker string (e.g., "1 - John" -> "1")
        worker_id = worker_id_string.split(" - ")[0]

        conn = connect_db()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                UPDATE management 
                SET machines = ?, work = ?, worker_id = ?, start_date = ?, end_date = ?, status = ?
                WHERE id = ?
            """, (machine, work, worker_id, start_date, end_date, status, record_id))
            conn.commit()
            messagebox.showinfo("Success", "Task updated successfully.")
        except sqlite3.Error as e:
            messagebox.showerror("Database Error", f"An error occurred: {e}")
        finally:
            conn.close()

        # Refresh the table
        self.load_saved_entries()

    def load_saved_entries(self):
        # 1. Clear any existing rows in the Treeview
        self.tree.delete(*self.tree.get_children())
        
        # 2. Connect to the database
        conn = connect_db()
        cursor = conn.cursor()
        
        try:
            # 3. Fetch data for this specific proposal
            # Using a LEFT JOIN to get the worker's name instead of just showing their ID
            cursor.execute("""
                SELECT m.id, m.machines, m.work, w.worker_name, m.start_date, m.end_date, m.status
                FROM management m
                LEFT JOIN workers w ON m.worker_id = w.worker_id
                WHERE m.proposal_id = ?
            """, (self.proposal_id,))
            
            records = cursor.fetchall()
            
            # 4. Insert the fetched rows into the Treeview
            for row in records:
                self.tree.insert("", "end", values=row)
                
        except sqlite3.Error as e:
            messagebox.showerror("Database Error", f"Could not load entries:\n{e}")
        finally:
            conn.close()