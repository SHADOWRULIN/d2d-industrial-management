import tkinter as tk
from gui.director_dashboard import DirectorDashboard

def main():
    root = tk.Tk()
    DirectorDashboard(root)
    root.mainloop()

if __name__ == "__main__":
    main()
