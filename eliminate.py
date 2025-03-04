import os
import pandas as pd

# Define the folder containing the CSV files
folder_path = "TEMP3"  # 🔹 Change this to your actual folder path

# Define the column name mapping (modify as needed)
column_mapping = {'Temperature (°C)': 'TEMP(°C)'}

# Process all CSV files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):  # Ensure only CSV files are processed
        file_path = os.path.join(folder_path, filename)
        
        # Load CSV
        df = pd.read_csv(file_path)
        
        # Rename columns
        df.rename(columns=column_mapping, inplace=True)
        
        # Save updated CSV (overwrite or create a new file)
        df.to_csv(file_path, index=False)  # Overwrite original file
        # df.to_csv(os.path.join(folder_path, f"updated_{filename}"), index=False)  # Save as new file

        print(f"Updated: {filename}")

print("✅ Column renaming complete!")