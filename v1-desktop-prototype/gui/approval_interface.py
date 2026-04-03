import tkinter as tk
from tkinter import messagebox
from controllers.approval_controller import ApprovalController
from database.db_connection import connect_db

class ApprovalInterface:
    def __init__(self, root, proposal_id):
        self.root = root
        self.proposal_id = proposal_id
        self.controller = ApprovalController()

        self.root.title(f"Proposal Approval - ID {proposal_id}")
        self.root.geometry("600x300")

        tk.Label(self.root, text=f"Approve or Reject Proposal ID: {proposal_id}", font=("Arial", 16)).pack(pady=10)

        tk.Label(self.root, text="Select Approval Status:").pack()
        self.status_var = tk.StringVar(self.root)
        self.status_var.set("Approved")
        tk.OptionMenu(self.root, self.status_var, "Approved", "Rejected").pack()

        tk.Button(self.root, text="Submit Approval Decision", command=self.update_proposal_status).pack(pady=15)

    def update_proposal_status(self):
        status = self.status_var.get()
        if status == "Rejected":
            self.controller.reject_proposal(self.proposal_id)
            messagebox.showinfo("Rejected", f"Proposal ID {self.proposal_id} has been rejected and removed.")
        else:
            self.controller.approve_proposal(self.proposal_id)
            messagebox.showinfo("Approved", f"Proposal ID {self.proposal_id} has been approved.")
        self.root.destroy()
