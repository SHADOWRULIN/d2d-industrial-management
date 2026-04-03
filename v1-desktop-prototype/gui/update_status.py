import tkinter as tk
from tkinter import filedialog, messagebox
from tkcalendar import DateEntry  # ✅ Import Date Picker
import sqlite3
from database.db_connection import connect_db

class UpdateStatusInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title(f"Update Status - Proposal ID {proposal_id}")
        self.root.geometry("600x500")

        tk.Label(self.root, text="Update Proposal Status", font=("Arial", 16)).pack(pady=10)

        # Upload Design PDF
        tk.Label(self.root, text="Upload Design PDF:").pack()
        tk.Button(self.root, text="Select File", command=self.upload_design_pdf).pack(pady=5)

        # Upload Detail PDF
        tk.Label(self.root, text="Upload Detail PDF:").pack()
        tk.Button(self.root, text="Select File", command=self.upload_detail_pdf).pack(pady=5)

        # Start Date Selection with Calendar Picker
        tk.Label(self.root, text="Select Start Date:").pack()
        self.start_date_entry = DateEntry(self.root, width=12, background='darkblue', foreground='white', borderwidth=2)
        self.start_date_entry.pack()

        # End Date Selection with Calendar Picker
        tk.Label(self.root, text="Select End Date:").pack()
        self.end_date_entry = DateEntry(self.root, width=12, background='darkblue', foreground='white', borderwidth=2)
        self.end_date_entry.pack()

        # Status Selection Dropdown
        tk.Label(self.root, text="Select Proposal Status:").pack()
        self.status_var = tk.StringVar(self.root)
        self.status_var.set("Design")
        statuses = ["Design", "Manufacturing", "Assembling", "Packing", "Delivery"]
        tk.OptionMenu(self.root, self.status_var, *statuses).pack()

        tk.Button(self.root, text="Update Status", command=self.update_proposal_status).pack(pady=10)

    def upload_file(self):
        file_path = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        return file_path if file_path else None

    def upload_design_pdf(self):
        self.design_pdf = self.upload_file()

    def upload_detail_pdf(self):
        self.detail_pdf = self.upload_file()

    def update_proposal_status(self):
        if not self.proposal_id.isdigit():
            messagebox.showerror("Error", "Invalid Proposal ID format.")
            return

        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE approvals 
            SET workflow_status = ?, output_design_pdf_path = ?, output_detail_pdf_path = ?, start_date = ?, end_date = ?
            WHERE proposal_id = ?
        """, (self.status_var.get(), self.design_pdf, self.detail_pdf, self.start_date_entry.get(), self.end_date_entry.get(), self.proposal_id))

        conn.commit()
        conn.close()

        messagebox.showinfo("Success", "Proposal status updated successfully!")

if __name__ == "__main__":
    root = tk.Tk()
    UpdateStatusInterface(root, "1")  # Test Proposal ID
    root.mainloop()
