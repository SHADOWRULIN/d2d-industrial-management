import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
import os
from PIL import Image, ImageTk  # ✅ Import image handling
from database.db_connection import connect_db

class InquiryInterface:
    def __init__(self, root, client_id, client_name):
        self.client_id = client_id
        self.client_name = client_name
        self.root = root
        self.root.title("Client Inquiry Portal")
        self.root.geometry("600x450")

        tk.Label(self.root, text=f"Inquiry Portal - {client_name}", font=("Arial", 16)).pack(pady=10)

        # Proposal Selection
        tk.Label(self.root, text="Select Proposal ID:").pack()
        self.proposal_var = tk.StringVar()
        self.proposal_dropdown = ttk.Combobox(self.root, textvariable=self.proposal_var)
        self.proposal_dropdown.pack()

        tk.Button(self.root, text="Check Status", command=self.check_status).pack(pady=10)

        # Status Display
        self.status_label = tk.Label(self.root, text="", font=("Arial", 12))
        self.status_label.pack(pady=5)

        # PDF Download Buttons (Initially Hidden)
        self.design_pdf_button = tk.Button(self.root, text="Download Design PDF", command=self.download_design_pdf)
        self.detail_pdf_button = tk.Button(self.root, text="Download Detail PDF", command=self.download_detail_pdf)

        # ✅ Placeholder for client image (Updated dynamically after selection)
        self.client_image_label = tk.Label(self.root)
        self.client_image_label.place(x=20, y=100)  # ✅ Correct placement

        self.load_client_proposals()

    def check_status(self):
        """ Check proposal status and load corresponding client image """
        selected_value = self.proposal_var.get()
        if not selected_value or " - " not in selected_value:
            messagebox.showerror("Error", "Please select a valid proposal ID!")
            return

        proposal_id, project_name = selected_value.split(" - ")

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT workflow_status, start_date, end_date, output_design_pdf_path, output_detail_pdf_path 
            FROM approvals WHERE proposal_id = ?
        """, (proposal_id,))
        result = cursor.fetchone()
        conn.close()

        if result:
            workflow_status, start_date, end_date, design_pdf, detail_pdf = result
            status_message = f"Project Name: {project_name}\nCurrent Phase: {workflow_status}\nStart Date: {start_date}\nEnd Date: {end_date}"
            self.status_label.config(text=status_message)

            self.load_client_image(proposal_id)  # ✅ Load client image dynamically
            self.toggle_pdf_buttons(design_pdf, detail_pdf)
        else:
            messagebox.showinfo("Not Found", "No approval status found for this proposal.")
            self.status_label.config(text="No matching proposal found.")

    def load_client_image(self, proposal_id):
        """ Fetch and display the client's profile image for the selected proposal """
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT client_image FROM proposals WHERE proposal_id = ?", (proposal_id,))
        image_path = cursor.fetchone()
        conn.close()

        if image_path and image_path[0] and os.path.exists(image_path[0]):
            try:
                img = Image.open(image_path[0]).resize((100, 100), Image.Resampling.LANCZOS)
                self.client_photo = ImageTk.PhotoImage(img)
                self.client_image_label.config(image=self.client_photo)  # ✅ Update dynamically
            except Exception as e:
                messagebox.showwarning("Image Error", f"Failed to load client image: {e}")
        else:
            messagebox.showwarning("Image Missing", "No image found for this proposal!")

    def load_client_proposals(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT proposal_id, project_name FROM proposals WHERE client_id = ?", (self.client_id,))
        proposals = cursor.fetchall()
        conn.close()

        if proposals:
            proposal_list = [f"{row[0]} - {row[1]}" for row in proposals]
            self.proposal_dropdown["values"] = proposal_list
        else:
            messagebox.showwarning("Notice", "No proposals found for this client.")
            self.proposal_dropdown["values"] = []

    def toggle_pdf_buttons(self, design_pdf, detail_pdf):
        if design_pdf and design_pdf.strip() and os.path.exists(design_pdf):
            self.design_pdf_path = design_pdf
            self.design_pdf_button.pack(pady=5)
        else:
            self.design_pdf_button.pack_forget()

        if detail_pdf and detail_pdf.strip() and os.path.exists(detail_pdf):
            self.detail_pdf_path = detail_pdf
            self.detail_pdf_button.pack(pady=5)
        else:
            self.detail_pdf_button.pack_forget()

    def download_design_pdf(self):
        if hasattr(self, 'design_pdf_path') and os.path.exists(self.design_pdf_path):
            os.startfile(self.design_pdf_path)
        else:
            messagebox.showerror("Error", "Design PDF not found!")

    def download_detail_pdf(self):
        if hasattr(self, 'detail_pdf_path') and os.path.exists(self.detail_pdf_path):
            os.startfile(self.detail_pdf_path)
        else:
            messagebox.showerror("Error", "Detail PDF not found!")

if __name__ == "__main__":
    root = tk.Tk()
    InquiryInterface(root, 1, "Test Client")
    root.mainloop()
