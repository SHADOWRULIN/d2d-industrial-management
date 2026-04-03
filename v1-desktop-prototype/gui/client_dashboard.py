import tkinter as tk
from PIL import Image, ImageTk
from gui.proposal_submission import ProposalSubmissionGUI
from gui.inquiry_interface import InquiryInterface
from database.db_connection import connect_db

class ClientDashboard:
    def __init__(self, root, client_id, client_name):  # ✅ Uses authenticated client_id
        self.client_id = client_id
        self.client_name = client_name
        self.root = root
        self.root.title("Client Dashboard")
        self.root.geometry("800x500")

        # Load and place logo (left-aligned)
        self.logo_image = Image.open("v1-desktop-prototype/assets/logo.jpg")
        self.logo_image = self.logo_image.resize((100, 100), Image.Resampling.LANCZOS)
        self.logo_photo = ImageTk.PhotoImage(self.logo_image)

        self.logo_label = tk.Label(self.root, image=self.logo_photo, bg="white")
        self.logo_label.place(x=20, y=20)

        tk.Label(self.root, text=f"Welcome, {self.client_name}!", font=("Arial", 18)).pack(pady=10)

        tk.Button(self.root, text="Submit Proposal", command=self.open_proposal_submission).pack(pady=5)
        tk.Button(self.root, text="Inquiry", command=self.open_inquiry).pack(pady=5)

    def open_proposal_submission(self):
        new_window = tk.Toplevel(self.root)
        ProposalSubmissionGUI(new_window, self.client_id)  # ✅ Pass authenticated client_id

    def open_inquiry(self):
        new_window = tk.Toplevel(self.root)
        InquiryInterface(new_window, self.client_id, self.client_name)  # ✅ Ensure accurate proposal filtering

if __name__ == "__main__":
    root = tk.Tk()
    ClientDashboard(root, 1, "Test Client")  # ✅ Test case
    root.mainloop()
