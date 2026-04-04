import tkinter as tk
from tkinter import messagebox, ttk
from PIL import Image, ImageTk  # ✅ Import for image handling
import sqlite3
import os
from gui.approval_interface import ApprovalInterface
from gui.project_management import ProjectManagementInterface
from database.db_connection import connect_db

class DirectorDashboard:
    def __init__(self, root):
        self.root = root
        self.root.title("Director Dashboard")
        self.root.geometry("700x450")

        # Set up main frame
        frame = tk.Frame(self.root)
        frame.pack(fill="both", expand=True, padx=20, pady=10)

        # ✅ Load images
        assets_path = os.path.join(os.getcwd(), "assets")
        logo_path = os.path.join(assets_path, "logo.jpg")
        director_img_path = os.path.join(assets_path, "director.jpeg")

        self.load_images(logo_path, director_img_path)

        # Grid Layout for UI
        tk.Label(frame, text="Welcome to Director Dashboard", font=("Arial", 18)).grid(row=0, column=1, columnspan=2, pady=10)

        input_frame = tk.Frame(frame)
        input_frame.grid(row=1, column=1, columnspan=2, pady=10)

        tk.Label(input_frame, text="Enter Proposal ID:").pack(side="left", padx=(0, 10))
        self.proposal_id_entry = tk.Entry(input_frame)
        self.proposal_id_entry.pack(side="left")

        tk.Button(frame, text="Validate Proposal ID", command=self.validate_proposal).grid(row=2, column=1, columnspan=2, pady=5)
        tk.Button(frame, text="Proceed to Proposal Approval / Project Management", command=self.manage_proposal).grid(row=3, column=1, columnspan=2, pady=10)

        # ✅ Treeview Table
        self.tree = ttk.Treeview(frame, columns=("Proposal ID", "Client", "Description", "Status"), show="headings")
        for col in self.tree["columns"]:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150 if col != "Description" else 250)
        self.tree.grid(row=4, column=1, columnspan=2, pady=10)

        self.load_proposals()

    def load_images(self, logo_path, director_img_path):
        """ Load images for logo and director photo """
        try:
            # ✅ Load logo on the left
            logo_img = Image.open(logo_path).resize((100, 100), Image.Resampling.LANCZOS)
            self.logo_photo = ImageTk.PhotoImage(logo_img)
            tk.Label(self.root, image=self.logo_photo).place(x=10, y=10)

            # ✅ Load director image on the right
            director_img = Image.open(director_img_path).resize((100, 100), Image.Resampling.LANCZOS)
            self.director_photo = ImageTk.PhotoImage(director_img)
            tk.Label(self.root, image=self.director_photo).place(x=580, y=10)

        except Exception as e:
            messagebox.showerror("Image Error", f"Failed to load images: {e}")

    def validate_proposal(self):
        proposal_id = self.proposal_id_entry.get()
        if not proposal_id.isdigit():
            messagebox.showerror("Error", "Invalid Proposal ID format.")
            return

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (proposal_id,))
        exists = cursor.fetchone()
        conn.close()

        if exists:
            messagebox.showinfo("Success", "Proposal ID is valid!")
        else:
            messagebox.showerror("Error", "Proposal ID does not exist!")

    def manage_proposal(self):
        proposal_id = self.proposal_id_entry.get()
        if not proposal_id.isdigit():
            messagebox.showerror("Error", "Invalid Proposal ID format.")
            return

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (proposal_id,))
        exists = cursor.fetchone()
        if not exists:
            conn.close()
            messagebox.showerror("Error", "Proposal ID does not exist in database.")
            return

        cursor.execute("SELECT status FROM approvals WHERE proposal_id = ?", (proposal_id,))
        result = cursor.fetchone()
        status = result[0].strip().lower() if result else None

        print(f"[DEBUG] Status for proposal {proposal_id} is: {status}")

        if status in [None, "pending"]:
            ApprovalInterface(tk.Toplevel(self.root), proposal_id)
        elif status == "approved":
            messagebox.showinfo("Approved", f"Proposal ID {proposal_id} has been approved. Redirecting to Project Management.")
            ProjectManagementInterface(tk.Toplevel(self.root), proposal_id)
        elif status == "rejected":
            messagebox.showinfo("Rejected", f"Proposal ID {proposal_id} has been rejected.")
        else:
            messagebox.showwarning("Unknown", f"Unknown status: {status}")

    def load_proposals(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT proposals.proposal_id, clients.name, proposals.proposal_description, proposals.status
            FROM proposals
            INNER JOIN clients ON proposals.client_id = clients.client_id
        """)
        proposals = cursor.fetchall()
        conn.close()

        self.tree.delete(*self.tree.get_children())
        for row in proposals:
            self.tree.insert("", "end", values=row)

if __name__ == "__main__":
    root = tk.Tk()
    DirectorDashboard(root)
    root.mainloop()
