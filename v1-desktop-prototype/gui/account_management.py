import tkinter as tk
from gui.bills_section import BillsSection  # Connect Bills Management
from gui.payment_management import PaymentManagementInterface  # Connect Payments
from gui.cost_summary import CostSummaryInterface  # Connect Cost Summary
from database.db_connection import connect_db

class AccountManagementInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id  # ✅ Store proposal ID
        self.root = root
        self.root.title(f"Account Management - Proposal ID {proposal_id}")
        self.root.geometry("600x400")

        tk.Label(self.root, text=f"Managing Accounts for Proposal ID: {proposal_id}", font=("Arial", 18)).pack(pady=10)

        # Three Main Sections
        tk.Button(self.root, text="Bills", command=self.open_bills_section).pack(pady=5)
        tk.Button(self.root, text="Payment", command=self.open_payment_section).pack(pady=5)  
        tk.Button(self.root, text="Cost Summary", command=self.open_cost_summary).pack(pady=5)  

    def open_bills_section(self):
        new_window = tk.Toplevel(self.root)
        BillsSection(new_window, self.proposal_id)  # ✅ Ensures bills connect to proposal ID

    def open_payment_section(self):
        new_window = tk.Toplevel(self.root)
        PaymentManagementInterface(new_window, self.proposal_id)  # ✅ Pass proposal_id

    def open_cost_summary(self):
        new_window = tk.Toplevel(self.root)
        CostSummaryInterface(new_window, self.proposal_id)  # ✅ Pass proposal_id

if __name__ == "__main__":
    root = tk.Tk()
    AccountManagementInterface(root, "1")  # Test Proposal ID
    root.mainloop()
