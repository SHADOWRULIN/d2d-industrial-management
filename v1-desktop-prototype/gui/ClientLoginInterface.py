import tkinter as tk
from tkinter import messagebox
import sqlite3
from gui.client_dashboard import ClientDashboard
from database.db_connection import connect_db

class ClientLoginInterface:
    def __init__(self, root):
        self.root = root
        self.root.title("Client Login")
        self.root.geometry("500x400")

        tk.Label(self.root, text="Client Login or Sign Up", font=("Arial", 18)).pack(pady=10)

        tk.Label(self.root, text="Name:").pack()
        self.name_entry = tk.Entry(self.root)
        self.name_entry.pack()

        tk.Label(self.root, text="Password:").pack()
        self.password_entry = tk.Entry(self.root, show="*")
        self.password_entry.pack()

        tk.Label(self.root, text="Phone (Sign-Up Only):").pack()
        self.phone_entry = tk.Entry(self.root)
        self.phone_entry.pack()

        tk.Label(self.root, text="Email (Sign-Up Only):").pack()
        self.email_entry = tk.Entry(self.root)
        self.email_entry.pack()

        tk.Label(self.root, text="Company (Sign-Up Only):").pack()
        self.company_entry = tk.Entry(self.root)
        self.company_entry.pack()

        tk.Button(self.root, text="Login or Sign Up", command=self.authenticate_client).pack(pady=10)

    def authenticate_client(self):
        name = self.name_entry.get().strip()
        password = self.password_entry.get().strip()
        phone = self.phone_entry.get().strip()
        email = self.email_entry.get().strip()
        company = self.company_entry.get().strip()

        if not name or not password:
            messagebox.showerror("Error", "Name and Password are required!")
            return

        conn = connect_db()
        cursor = conn.cursor()

        # Check if client exists
        cursor.execute("SELECT client_id FROM clients WHERE name = ? AND password = ?", (name, password))
        client_data = cursor.fetchone()

        if client_data:
            client_id = client_data[0]
            messagebox.showinfo("Success", f"Welcome back, {name}! Redirecting to dashboard...")
        else:
            # Ensure full details are provided for new clients
            if not phone or not email or not company:
                messagebox.showerror("Error", "Phone, Email, and Company are required for sign-up!")
                return

            cursor.execute("""
                INSERT INTO clients (name, password, phone, email, company) 
                VALUES (?, ?, ?, ?, ?)
            """, (name, password, phone, email, company))
            conn.commit()

            # Retrieve new client ID
            cursor.execute("SELECT client_id FROM clients WHERE name = ?", (name,))
            client_id = cursor.fetchone()[0]
            messagebox.showinfo("Success", f"Account created for {name}! Redirecting to dashboard...")

        conn.close()

        # Redirect to Client Dashboard
        new_window = tk.Toplevel(self.root)
        ClientDashboard(new_window, client_id, name)

if __name__ == "__main__":
    root = tk.Tk()
    ClientLoginInterface(root)
    root.mainloop()
