import tkinter as tk
from gui.ClientLoginInterface import ClientLoginInterface  

def main():
    root = tk.Tk()
    ClientLoginInterface(root)  
    root.mainloop()

if __name__ == "__main__":
    main()
