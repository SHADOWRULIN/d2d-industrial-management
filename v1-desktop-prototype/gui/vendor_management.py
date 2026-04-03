import tkinter as tk
from tkinter import ttk, messagebox
from tkcalendar import DateEntry
import sqlite3
import os
from database.db_connection import connect_db  

class VendorManagementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title(f"Vendor Management - Proposal ID {proposal_id}")
        self.root.geometry("950x700")

        self.material_data = []

        tk.Label(self.root, text="Vendor Management", font=("Arial", 18)).pack(pady=10)

        tk.Label(self.root, text="Select Vendor Type:").pack()
        self.vendor_type_var = tk.StringVar(value="Raw Material")
        vendor_options = ["Raw Material", "Parts/Items"]
        tk.OptionMenu(self.root, self.vendor_type_var, *vendor_options).pack()

        tk.Label(self.root, text="Select Vendor Name:").pack()
        self.vendor_name_var = tk.StringVar()
        self.vendor_name_combo = ttk.Combobox(self.root, textvariable=self.vendor_name_var, postcommand=self.load_vendor_names)
        self.vendor_name_combo.pack()

        tk.Label(self.root, text="Enter Vendor Phone Number:").pack()
        self.vendor_phone_entry = tk.Entry(self.root)
        self.vendor_phone_entry.pack()

        tk.Label(self.root, text="Purchase Date:").pack()
        self.purchase_date_entry = DateEntry(self.root, width=12, background='darkblue', foreground='white', borderwidth=2)
        self.purchase_date_entry.pack()

        tk.Label(self.root, text="Material Name:").pack()
        self.material_entry = tk.Entry(self.root)
        self.material_entry.pack()

        tk.Label(self.root, text="Quantity:").pack()
        self.quantity_entry = tk.Entry(self.root)
        self.quantity_entry.pack()

        tk.Label(self.root, text="Price per Unit:").pack()
        self.price_entry = tk.Entry(self.root)
        self.price_entry.pack()

        tk.Button(self.root, text="Add Material", command=self.add_material).pack(pady=5)

        self.tree = ttk.Treeview(self.root, columns=("SNo", "Material", "Quantity", "PricePerUnit", "TotalPrice", "PurchaseDate"), show='headings')
        for col, label in zip(self.tree["columns"], ["S.No.", "Material", "Quantity", "Price per Unit", "Total Price", "Purchase Date"]):
            self.tree.heading(col, text=label)
        self.tree.column("SNo", width=50)
        self.tree.pack(pady=10, fill=tk.X)

        tk.Button(self.root, text="Save Vendor Data", command=self.save_vendor_data).pack(pady=5)
        tk.Button(self.root, text="View Vendors", command=self.view_vendors).pack(pady=5)

        self.setup_database()

    def setup_database(self):
        conn = connect_db()  # Using the modular connection function
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendors (
                vendor_id INTEGER PRIMARY KEY AUTOINCREMENT,
                proposal_id TEXT,
                vendor_type TEXT,
                vendor_name TEXT,
                vendor_phone TEXT,
                material TEXT,
                quantity REAL,
                price REAL,
                purchase_date TEXT
            )
        """)
        conn.commit()
        conn.close()

    def load_vendor_names(self):
        try:
            conn = connect_db()
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT vendor_name FROM vendors")
            vendors = [row[0] for row in cursor.fetchall()]
            conn.close()
            self.vendor_name_combo['values'] = vendors
        except Exception as e:
            messagebox.showerror("Error", f"Could not load vendor names:\n{e}")

    def add_material(self):
        material = self.material_entry.get().strip()
        quantity = self.quantity_entry.get().strip()
        price = self.price_entry.get().strip()
        purchase_date = self.purchase_date_entry.get_date()

        if not all([material, quantity, price, purchase_date]):
            messagebox.showwarning("Warning", "Please fill all material fields including the purchase date.")
            return

        try:
            quantity_val = float(quantity)
            price_val = float(price)
            if quantity_val <= 0 or price_val <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror("Invalid Input", "Quantity and Price must be positive numbers.")
            return

        total_price = quantity_val * price_val
        sno = len(self.material_data) + 1
        self.tree.insert('', 'end', values=(sno, material, quantity_val, price_val, total_price, purchase_date))
        self.material_data.append((material, quantity_val, price_val, purchase_date))

        self.material_entry.delete(0, tk.END)
        self.quantity_entry.delete(0, tk.END)
        self.price_entry.delete(0, tk.END)

    def save_vendor_data(self):
        vendor_type = self.vendor_type_var.get()
        vendor_name = self.vendor_name_var.get().strip()
        vendor_phone = self.vendor_phone_entry.get().strip()

        if not all([vendor_type, vendor_name, vendor_phone]) or not self.material_data:
            messagebox.showerror("Error", "All fields must be filled and at least one material added.")
            return

        if not vendor_phone.isdigit() or not (10 <= len(vendor_phone) <= 15):
            messagebox.showerror("Invalid Phone", "Phone number must be 10–15 digits and numeric.")
            return

        conn = connect_db()
        cursor = conn.cursor()

        for material, quantity, price, purchase_date in self.material_data:
            cursor.execute("""
                INSERT INTO vendors (proposal_id, vendor_type, vendor_name, vendor_phone, material, quantity, price, purchase_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (self.proposal_id, vendor_type, vendor_name, vendor_phone, material, quantity, price, purchase_date))

        conn.commit()
        conn.close()

        messagebox.showinfo("Success", "Vendor data saved successfully.")
        self.tree.delete(*self.tree.get_children())
        self.material_data = []

    def view_vendors(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT vendor_name, vendor_type, vendor_phone, material, quantity, price, purchase_date
            FROM vendors WHERE proposal_id = ?
        """, (self.proposal_id,))
        vendors = cursor.fetchall()
        conn.close()

        if vendors:
            vendor_list = "\n".join([
                f"{v[0]} ({v[1]}) | Phone: {v[2]} | Material: {v[3]} | Qty: {v[4]} | Price/Unit: {v[5]} | Total: {v[4]*v[5]} | Date: {v[6]}"
                for v in vendors
            ])
        else:
            vendor_list = "No vendors found for this proposal."

        messagebox.showinfo("Existing Vendors", vendor_list)

if __name__ == "__main__":
    root = tk.Tk()
    VendorManagementInterface(root, "1")
    root.mainloop()
