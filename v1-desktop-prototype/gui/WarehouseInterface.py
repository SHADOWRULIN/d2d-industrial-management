import tkinter as tk
from tkinter import filedialog, messagebox
import sqlite3
from database.db_connection import connect_db

class WarehouseInterface:
    def __init__(self, root, proposal_id):
        self.proposal_id = proposal_id
        self.root = root
        self.root.title("Warehouse Management")
        self.root.geometry("600x500")

        tk.Label(self.root, text="Warehouse Management", font=("Arial", 18)).pack(pady=10)

        # Warehouse Type Selection
        tk.Label(self.root, text="Select Warehouse Type:").pack()
        self.warehouse_type_var = tk.StringVar()
        self.warehouse_type_dropdown = tk.OptionMenu(self.root, self.warehouse_type_var, "Inhouse", "Outsource")
        self.warehouse_type_var.set("Inhouse")
        self.warehouse_type_dropdown.pack()

        tk.Button(self.root, text="Upload Inhouse PDF", command=self.upload_pdf).pack(pady=5)
        tk.Button(self.root, text="Download Outsource PDF", command=self.download_pdf).pack(pady=5)

    def upload_pdf(self):
        file_path = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if file_path:
            conn = connect_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO warehouse (proposal_id, type, pdf_path) VALUES (?, ?, ?)
            """, (self.proposal_id, "Inhouse", file_path))
            conn.commit()
            conn.close()
            messagebox.showinfo("Success", "Inhouse PDF uploaded successfully!")

    def download_pdf(self):
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT pdf_path FROM warehouse WHERE proposal_id = ? AND type = 'Outsource'
        """, (self.proposal_id,))
        pdf_path = cursor.fetchone()
        conn.close()

        if pdf_path:
            messagebox.showinfo("Download", f"Download from: {pdf_path[0]}")
        else:
            messagebox.showerror("Error", "No outsourced PDFs found!")

if __name__ == "__main__":
    root = tk.Tk()
    WarehouseInterface(root, "1")  
    root.mainloop()
