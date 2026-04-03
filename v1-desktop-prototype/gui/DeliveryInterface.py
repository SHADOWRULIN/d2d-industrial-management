import tkinter as tk
from tkinter import messagebox
from tkcalendar import DateEntry
import sqlite3
from database.db_connection import connect_db

class DeliveryInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Delivery Management")
        self.root.geometry("600x500")

        tk.Label(self.root, text="Delivery Management", font=("Arial", 18)).pack(pady=10)

        tk.Button(self.root, text="Packing", command=self.open_packing_section).pack(pady=5)
        tk.Button(self.root, text="Delivery", command=self.open_delivery_section).pack(pady=5)

    def open_packing_section(self):
        new_window = tk.Toplevel(self.root)
        PackingSection(new_window, self.proposal_id)

    def open_delivery_section(self):
        new_window = tk.Toplevel(self.root)
        DeliverySection(new_window, self.proposal_id)

class PackingSection:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Packing Management")
        self.root.geometry("600x500")

        tk.Label(self.root, text="Packing Management", font=("Arial", 18)).pack(pady=10)

        tk.Label(self.root, text="Worker Name:").pack()
        self.worker_name_entry = tk.Entry(self.root)
        self.worker_name_entry.pack()

        tk.Label(self.root, text="Start Date:").pack()
        self.start_date_entry = DateEntry(self.root)
        self.start_date_entry.pack()

        tk.Label(self.root, text="End Date:").pack()
        self.end_date_entry = DateEntry(self.root)
        self.end_date_entry.pack()

        tk.Button(self.root, text="Save Packing Data", command=self.save_packing_data).pack(pady=5)

    def save_packing_data(self):
        conn = connect_db()
        cursor = conn.cursor()
        
        # Ensure proposal_id exists before inserting
        cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (self.proposal_id,))
        proposal_exists = cursor.fetchone()

        if not proposal_exists:
            messagebox.showerror("Error", "Invalid Proposal ID. Packing Data cannot be saved!")
            return
        
        cursor.execute("""
            INSERT INTO packing (proposal_id, worker_name, start_date, end_date)
            VALUES (?, ?, ?, ?)
        """, (self.proposal_id, self.worker_name_entry.get(), self.start_date_entry.get_date(), self.end_date_entry.get_date()))

        conn.commit()
        conn.close()
        messagebox.showinfo("Success", "Packing details saved successfully!")

class DeliverySection:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Delivery Process")
        self.root.geometry("600x500")

        tk.Label(self.root, text="Delivery Process", font=("Arial", 18)).pack(pady=10)

        tk.Label(self.root, text="Delivery Address:").pack()
        self.address_entry = tk.Entry(self.root)
        self.address_entry.pack()

        tk.Button(self.root, text="Mark as Delivered", command=self.mark_delivery_done).pack(pady=5)

    def mark_delivery_done(self):
        conn = connect_db()
        cursor = conn.cursor()

        # Ensure proposal_id exists before inserting delivery data
        cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (self.proposal_id,))
        proposal_exists = cursor.fetchone()

        if not proposal_exists:
            messagebox.showerror("Error", "Invalid Proposal ID. Delivery Data cannot be saved!")
            return
        
        cursor.execute("""
            INSERT INTO delivery (proposal_id, address, status) VALUES (?, ?, ?)
        """, (self.proposal_id, self.address_entry.get(), "Completed"))

        conn.commit()
        conn.close()
        messagebox.showinfo("Success", "Delivery marked as completed!")

if __name__ == "__main__":
    root = tk.Tk()
    DeliveryInterface(root, "1")  
    root.mainloop()
