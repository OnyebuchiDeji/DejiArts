import tkinter as tk

# Create the main window
root = tk.Tk()
root.title("Tkinter Scrolling Example")
root.geometry("300x300")

# Create a canvas widget to add scrollbars
canvas = tk.Canvas(root)
canvas.pack(side="left", fill="both", expand=True)

# Create a vertical scrollbar and link it to the canvas
v_scrollbar = tk.Scrollbar(root, orient="vertical", command=canvas.yview)
v_scrollbar.pack(side="right", fill="y")

# Create a frame to place inside the canvas
frame = tk.Frame(canvas)

# Add the frame to the canvas
canvas.create_window((0, 0), window=frame, anchor="nw")

# Link the canvas scrollbar to the canvas' view
canvas.config(yscrollcommand=v_scrollbar.set)

# Add some widgets inside the frame to make it scrollable
for i in range(20):
    label = tk.Label(frame, text=f"Label {i+1}")
    label.grid(row=i, column=0, pady=5)

# Update the scroll region of the canvas after adding widgets
frame.update_idletasks()
canvas.config(scrollregion=canvas.bbox("all"))

# Start the Tkinter main loop
root.mainloop()
