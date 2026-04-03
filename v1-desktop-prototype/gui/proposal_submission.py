import tkinter as tk
from tkinter import filedialog, messagebox
import sqlite3
from controllers.proposal_controller import ProposalController
from database.db_connection import connect_db

class ProposalSubmissionGUI:
    def __init__(self, root, client_id):
        self.root = root
        self.client_id = client_id
        self.controller = ProposalController()

        self.root.title("Submit Proposal")
        self.root.geometry("600x550")
        self.root.configure(bg="#F5F5F5")  

        frame = tk.Frame(self.root, bg="#F5F5F5")
        frame.pack(expand=True, padx=20, pady=20)

        # Title
        tk.Label(frame, text="Submit Proposal", font=("Arial", 18, "bold"), bg="#F5F5F5").grid(row=0, column=0, columnspan=2, pady=10)

        # Client Info
        tk.Label(frame, text="Name:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=1, column=0, sticky="e", padx=5)
        self.name_label = tk.Label(frame, text="", font=("Arial", 12), bg="#F5F5F5")
        self.name_label.grid(row=1, column=1, sticky="w", padx=5)

        tk.Label(frame, text="Company:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=2, column=0, sticky="e", padx=5)
        self.company_label = tk.Label(frame, text="", font=("Arial", 12), bg="#F5F5F5")
        self.company_label.grid(row=2, column=1, sticky="w", padx=5)

        self.load_client_details()

        # Proposal Details
        tk.Label(frame, text="Project Name:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=3, column=0, sticky="e", padx=5)
        self.project_name_entry = tk.Entry(frame, width=40, font=("Arial", 12))
        self.project_name_entry.grid(row=3, column=1, padx=5)

        tk.Label(frame, text="Description:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=4, column=0, sticky="e", padx=5)
        self.description_entry = tk.Entry(frame, width=40, font=("Arial", 12))
        self.description_entry.grid(row=4, column=1, padx=5)

        tk.Label(frame, text="Select Service:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=5, column=0, sticky="e", padx=5)
        self.service_var = tk.StringVar(frame)
        self.service_var.set("Product Design")
        services = ["Product Design", "Prototyping", "Manufacturing"]
        tk.OptionMenu(frame, self.service_var, *services).grid(row=5, column=1, padx=5)

        # Upload Client Image
        tk.Label(frame, text="Client Image:", font=("Arial", 12, "bold"), bg="#F5F5F5").grid(row=6, column=0, sticky="e", padx=5)
        tk.Button(frame, text="Select Image", font=("Arial", 12), command=self.upload_client_image).grid(row=6, column=1, padx=5)
        self.client_image_label = tk.Label(frame, text="No file selected", font=("Arial", 12), bg="#F5F5F5")
        self.client_image_label.grid(row=7, column=1, padx=5)

        # Submit Buttons
        tk.Button(frame, text="Submit Proposal", font=("Arial", 14, "bold"), command=self.submit_proposal, bg="#4CAF50", fg="white").grid(row=8, column=0, columnspan=2, pady=10, ipadx=10)
        tk.Button(frame, text="Cancel", font=("Arial", 14, "bold"), command=self.root.destroy, bg="#E53935", fg="white").grid(row=9, column=0, columnspan=2, pady=5, ipadx=10)

    def load_client_details(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name, company FROM clients WHERE client_id = ?", (self.client_id,))
        client_data = cursor.fetchone()
        conn.close()

        if client_data:
            name, company = client_data
            self.name_label.config(text=name)
            self.company_label.config(text=company)
        else:
            messagebox.showerror("Error", "Client information not found!")

    def upload_client_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.jpg *.png *.jpeg")])
        if file_path:
            self.client_image_label.config(text=file_path)
            self.client_image_path = file_path
        else:
            self.client_image_path = None

    def submit_proposal(self):
        project_name = self.project_name_entry.get().strip()
        description = self.description_entry.get().strip()
        service = self.service_var.get().strip()
        client_image_path = getattr(self, "client_image_path", None)

        if not all([project_name, description, service, client_image_path]):
            messagebox.showerror("Error", "All fields must be filled out.")
            return

        try:
            conn = connect_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO proposals (client_id, project_name, proposal_description, services, client_image)
                VALUES (?, ?, ?, ?, ?)
            """, (self.client_id, project_name, description, service, client_image_path))
            conn.commit()  # ✅ Ensures changes are saved
            conn.close()   # ✅ Prevents locking issues

            messagebox.showinfo("Success", "Proposal submitted successfully!")
            self.root.destroy()
        except sqlite3.OperationalError as e:
            messagebox.showerror("Database Error", f"SQLite error: {e}")


if __name__ == "__main__":
    root = tk.Tk()
    ProposalSubmissionGUI(root, 1)
    root.mainloop()
