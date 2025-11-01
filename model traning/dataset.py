import csv
import random

# --- Configuration ---
FILENAME = 'synthetic_mri_data_with_group.csv' # New filename to distinguish
NUM_ROWS = 100
# ---------------------

# Define the headers, including the new 'Group' column
headers = ['MR Delay', 'Gender', 'Age', 'EDUC', 'SES', 'MMSE', 'CDR', 'eTIV', 'nWBV', 'ASF', 'Group']

def generate_random_row():
    """Generates a single row of synthetic data based on observed ranges and adds 'Group'."""
    
    # MR Delay: Integers, with a chance of being 0
    mr_delay = 0 if random.random() < 0.2 else random.randint(30, 2500)
    
    # Gender: 0 or 1
    gender = random.randint(0, 1)
    
    # Age: Integers, assuming an older cohort
    age = random.randint(60, 90)
    
    # EDUC: Integers, (e.g., years of education)
    educ = random.randint(10, 20)
    
    # SES: Float, looks like a categorical scale (e.g., 0.0, 1.0, 2.0)
    # We'll make it slightly more common for Nondemented to have lower SES for variety, but keep it random
    ses = random.choice([0.0, 1.0, 2.0, 3.0]) # Added 3.0 for more variety in SES
    
    # MMSE: Float, cognitive score typically 0-30
    # Will be influenced by CDR/Group later
    mmse = round(random.uniform(20.0, 30.0), 1)
    
    # CDR: Float, clinical dementia rating, common values
    # We will make CDR more influential on the Group.
    # Higher chance of 0.0 for Nondemented, higher chance of 0.5/1.0 for Demented
    cdr_choices = [0.0, 0.0, 0.0, 0.5, 0.5, 1.0]
    cdr = random.choice(cdr_choices)
    
    # Determine 'Group' based on 'CDR' for accuracy
    if cdr == 0.0:
        group = "Nondemented"
        # Adjust MMSE to be higher for Nondemented
        mmse = round(random.uniform(27.0, 30.0), 1) 
    else: # CDR is 0.5 or 1.0
        group = "Demented"
        # Adjust MMSE to be lower for Demented
        mmse = round(random.uniform(20.0, 27.0), 1)
        # Ensure MMSE doesn't go too low if CDR is only 0.5
        if cdr == 0.5 and mmse < 24.0:
            mmse = round(random.uniform(24.0, 27.0), 1)


    # eTIV: Integer, (e.g., intracranial volume)
    etiv = random.randint(1300, 2100)
    
    # nWBV: Float, (e.g., normalized whole brain volume)
    # Slightly lower for Demented to simulate atrophy, but keep overlap
    if group == "Demented":
        nwbv = round(random.uniform(0.650, 0.750), 3)
    else: # Nondemented
        nwbv = round(random.uniform(0.700, 0.850), 3)
    
    # ASF: Float, (e.g., atlas scaling factor)
    asf = round(random.uniform(0.850, 1.350), 3)
    
    return [mr_delay, gender, age, educ, ses, mmse, cdr, etiv, nwbv, asf, group]

# --- Main script execution ---
try:
    with open(FILENAME, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write the header row
        writer.writerow(headers)
        
        # Write the data rows
        for _ in range(NUM_ROWS):
            writer.writerow(generate_random_row())
            
    print(f"Successfully generated {NUM_ROWS} rows of synthetic data in '{FILENAME}'")

except IOError as e:
    print(f"Error: Could not write to file '{FILENAME}'.")
    print(e)
except Exception as e:
    print(f"An unexpected error occurred: {e}")