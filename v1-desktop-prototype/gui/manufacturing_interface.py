import tkinter as tk
from tkinter import messagebox
from gui.manufacturing_management import ManagementInterface
from gui.WarehouseInterface import WarehouseInterface
from gui.WorkersInterface import WorkersInterface
from database.db_connection import connect_db

class ProcurementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Procurement Management")  # ✅ Updated title
        self.root.geometry("700x500")

        tk.Label(self.root, text="Procurement Management", font=("Arial", 18)).pack(pady=10)

        # Section Buttons
        tk.Button(self.root, text="Manufacturing", command=self.open_manufacturing_section).pack(pady=5)  # ✅ Updated button name
        tk.Button(self.root, text="Warehouse", command=self.open_warehouse_section).pack(pady=5)
        tk.Button(self.root, text="Workers", command=self.open_workers_section).pack(pady=5)

    def open_manufacturing_section(self):
        new_window = tk.Toplevel(self.root)
        ManagementInterface(new_window, self.proposal_id)  # ✅ Updated reference

    def open_warehouse_section(self):
        new_window = tk.Toplevel(self.root)
        WarehouseInterface(new_window, self.proposal_id)

    def open_workers_section(self):
        new_window = tk.Toplevel(self.root)
        WorkersInterface(new_window, self.proposal_id)

if __name__ == "__main__":
    root = tk.Tk()
    ProcurementInterface(root, "1")  # ✅ Updated name
    root.mainloop()
