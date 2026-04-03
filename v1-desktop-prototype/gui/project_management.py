import tkinter as tk
from tkinter import messagebox
import sqlite3  
from gui.update_status import UpdateStatusInterface
from gui.vendor_management import VendorManagementInterface
from gui.account_management import AccountManagementInterface
from gui.manufacturing_interface import ProcurementInterface
from gui.DeliveryInterface import DeliveryInterface  
from database.db_connection import connect_db

class ProjectManagementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id  
        self.root = root
        self.root.title(f"Proposal Management - ID {proposal_id}")
        self.root.geometry("600x400")

        tk.Label(self.root, text=f"Managing Proposal ID: {proposal_id}", font=("Arial", 16)).pack(pady=10)

        # Validate proposal existence in the database
        if not self.validate_proposal():
            messagebox.showerror("Error", f"Proposal ID {proposal_id} does not exist in the database!")
            self.root.destroy()
            return

        # Options for Proposal Management
        tk.Button(self.root, text="Update Status", command=self.update_status).pack(pady=5)
        tk.Button(self.root, text="Accounts Management", command=self.manage_accounts).pack(pady=5)
        tk.Button(self.root, text="Vendor Management", command=self.manage_vendor).pack(pady=5)
        tk.Button(self.root, text="Manufacturing", command=self.manage_manufacturing).pack(pady=5)
        tk.Button(self.root, text="Delivery", command=self.manage_delivery).pack(pady=5)  # ✅ Now redirects to Delivery

    def validate_proposal(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (self.proposal_id,))
        proposal_exists = cursor.fetchone()
        conn.close()
        return proposal_exists is not None  

    def update_status(self):
        new_window = tk.Toplevel(self.root)
        UpdateStatusInterface(new_window, self.proposal_id)

    def manage_accounts(self):
        new_window = tk.Toplevel(self.root)
        AccountManagementInterface(new_window, self.proposal_id)

    def manage_vendor(self):
        new_window = tk.Toplevel(self.root)
        VendorManagementInterface(new_window, self.proposal_id)

    def manage_manufacturing(self):
        new_window = tk.Toplevel(self.root)
        ProcurementInterface(new_window, self.proposal_id)

    def manage_delivery(self):  # ✅ Updated Delivery Section
        new_window = tk.Toplevel(self.root)
        DeliveryInterface(new_window, self.proposal_id)  

if __name__ == "__main__":
    root = tk.Tk()
    ProjectManagementInterface(root, "1")  
    root.mainloop()
