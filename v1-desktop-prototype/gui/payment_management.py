import tkinter as tk
from tkinter import ttk, messagebox
from tkcalendar import DateEntry
import sqlite3
import datetime
from database.db_connection import connect_db  

class PaymentManagementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title(f"Payment Management - Proposal ID {proposal_id}")
        self.root.geometry("850x600")

        tk.Label(self.root, text="Payment Management", font=("Arial", 18)).pack(pady=10)

        # Vendor Selection
        tk.Label(self.root, text="Select Vendor Name:").pack()
        self.vendor_name_var = tk.StringVar()
        self.vendor_name_combo = ttk.Combobox(self.root, textvariable=self.vendor_name_var, postcommand=self.load_vendor_names)
        self.vendor_name_combo.pack()

        tk.Label(self.root, text="Vendor Phone Number:").pack()
        self.vendor_phone_entry = tk.Entry(self.root)
        self.vendor_phone_entry.pack()

        tk.Label(self.root, text="Vendor Type:").pack()
        self.vendor_type_var = tk.StringVar()
        self.vendor_type_dropdown = ttk.Combobox(self.root, textvariable=self.vendor_type_var, values=["Raw Material", "Parts/Items"], state="readonly")
        self.vendor_type_dropdown.set("Raw Material")
        self.vendor_type_dropdown.pack()

        # Payment Status Update
        tk.Label(self.root, text="Update Payment Status:").pack()
        self.status_var = tk.StringVar()
        self.status_dropdown = ttk.Combobox(self.root, textvariable=self.status_var, values=["Paid", "Not Paid"], state="readonly")
        self.status_dropdown.set("Not Paid")
        self.status_dropdown.pack()

        # Date Selection for Payments (Now Using tkcalendar)
        tk.Label(self.root, text="Payment Date:").pack()
        self.payment_date_entry = DateEntry(self.root, width=12, background='darkblue', foreground='white', borderwidth=2)
        self.payment_date_entry.pack()

        # Buttons
        tk.Button(self.root, text="Retrieve Vendor", command=self.retrieve_vendor).pack(pady=5)
        tk.Button(self.root, text="Update Status", command=self.update_status).pack(pady=5)
        tk.Button(self.root, text="Save Payments", command=self.save_payments).pack(pady=5)
        tk.Button(self.root, text="Show All Payments", command=self.load_payments).pack(pady=5)

        # Payment Table
        self.tree = ttk.Treeview(self.root, columns=("SNo", "Vendor", "Phone", "Type", "Price", "Status", "Payment Date"), show="headings")
        for col, text in zip(self.tree["columns"], ["S.No.", "Vendor Name", "Phone", "Type", "Price", "Status", "Payment Date"]):
            self.tree.heading(col, text=text)
            self.tree.column(col, width=120)

        self.tree.pack(fill="both", expand=True, pady=10)

        self.serial_number = 1
        self.load_payments()

    def load_vendor_names(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT vendor_name FROM vendors WHERE proposal_id = ?", (self.proposal_id,))
        vendors = [row[0] for row in cursor.fetchall()]
        conn.close()
        self.vendor_name_combo['values'] = vendors

    def retrieve_vendor(self):
        vendor_name = self.vendor_name_var.get().strip()
        if not vendor_name:
            messagebox.showerror("Error", "Please select a vendor.")
            return

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT vendor_phone, vendor_type, SUM(quantity * price) FROM vendors
            WHERE proposal_id = ? AND vendor_name = ?
        """, (self.proposal_id, vendor_name))
        result = cursor.fetchone()
        conn.close()

        if result:
            phone, vtype, amount = result
            self.vendor_phone_entry.delete(0, tk.END)
            self.vendor_phone_entry.insert(0, phone)
            self.vendor_type_var.set(vtype)
            self.tree.insert("", "end", values=(self.serial_number, vendor_name, phone, vtype, amount, "Not Paid", ""))
            self.serial_number += 1
        else:
            messagebox.showerror("Not Found", "Vendor not found for this proposal.")

    def load_payments(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT vendor_name, vendor_phone, vendor_type, amount, status, payment_date 
            FROM payments WHERE proposal_id = ?
        """, (self.proposal_id,))
        payments = cursor.fetchall()
        conn.close()

        self.tree.delete(*self.tree.get_children())
        for idx, (name, phone, vtype, amount, status, date) in enumerate(payments, start=1):
            self.tree.insert("", "end", values=(idx, name, phone, vtype, amount, status, date))

        self.serial_number = len(payments) + 1

    def update_status(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a row to update.")
            return

        new_status = self.status_var.get()
        payment_date = self.payment_date_entry.get_date()
        if not new_status:
            messagebox.showwarning("Warning", "Please select a status.")
            return

        for item in selected:
            values = list(self.tree.item(item, "values"))
            values[5] = new_status
            values[6] = payment_date
            self.tree.item(item, values=values)

        messagebox.showinfo("Updated", f"Status updated to '{new_status}' for selected entry.")

    def save_payments(self):
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM payments WHERE proposal_id = ?", (self.proposal_id,))

        for row in self.tree.get_children():
            values = self.tree.item(row)["values"]
            cursor.execute("""
                INSERT INTO payments (
                    proposal_id, serial_number, vendor_name, vendor_phone, vendor_type,
                    amount, status, payment_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self.proposal_id,
                values[0],  # Serial
                values[1],  # Vendor Name
                values[2],  # Phone
                values[3],  # Type
                values[4],  # Amount
                values[5],  # Status
                values[6]   # Payment Date
            ))

        conn.commit()
        conn.close()
        messagebox.showinfo("Success", "Payment status updated and saved successfully!")

if __name__ == "__main__":
    root = tk.Tk()
    PaymentManagementInterface(root, "1")
    root.mainloop()
