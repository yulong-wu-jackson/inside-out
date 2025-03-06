import csv
import json
import os
import glob

def convert_csv_to_json(csv_file_path, json_file_path):
    """
    Convert a CSV file to JSON format, using the first row as keys.
    
    Args:
        csv_file_path (str): Path to the CSV file
        json_file_path (str): Path where the JSON file will be saved
    """
    # Create a list to store all the data
    data = []
    
    try:
        # Read the CSV file
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            # Create a CSV reader
            csv_reader = csv.DictReader(csv_file)
            
            # Process each row in the CSV
            for row in csv_reader:
                # Skip empty rows
                if not row or all(v == '' for v in row.values()):
                    continue
                    
                # Create a dictionary for this row with proper type conversion
                row_dict = {}
                for key, value in row.items():
                    if key is None:  # Skip None keys (can happen with empty columns)
                        continue
                        
                    # Strip whitespace from key and value
                    key = key.strip() if key else key
                    value = value.strip() if isinstance(value, str) else value
                    
                    # Convert numeric values to appropriate types
                    if isinstance(value, str):
                        if value.isdigit():
                            row_dict[key] = int(value)
                        elif value.replace('.', '', 1).isdigit() and value.count('.') <= 1:
                            try:
                                row_dict[key] = float(value)
                            except ValueError:
                                row_dict[key] = value
                        else:
                            row_dict[key] = value
                    else:
                        row_dict[key] = value
                
                # Add this row's data to our list
                data.append(row_dict)
        
        # Write the data to a JSON file
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=2, ensure_ascii=False)
        
        print(f"Conversion complete! JSON file saved to: {json_file_path}")
        print(f"Total entries: {len(data)}")
        return True
        
    except Exception as e:
        print(f"Error converting {csv_file_path}: {str(e)}")
        return False

def process_all_csv_files():
    """
    Process all CSV files and convert them to JSON format.
    """
    # Define the directories
    current_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(current_dir, 'data', 'raw')
    output_dir = os.path.join(current_dir, 'data', 'rawJson')
    
    # Create the output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # List of all CSV files to convert
    csv_files = [
        os.path.join(raw_dir, 'famousMbti.csv'),
        os.path.join(raw_dir, 'mbtiPost.csv'),
        os.path.join(raw_dir, 'mbtiMusicCombined.csv')
    ]
    
    # Add all MBTI type CSV files from the Music_split_mbti directory
    mbti_split_dir = os.path.join(raw_dir, 'Music_split_mbti')
    if os.path.exists(mbti_split_dir):
        csv_files.extend(glob.glob(os.path.join(mbti_split_dir, '*_df.csv')))
    
    # Process each CSV file
    success_count = 0
    for csv_file_path in csv_files:
        if os.path.exists(csv_file_path):
            # Create the output JSON file path
            base_name = os.path.basename(csv_file_path)
            json_file_name = os.path.splitext(base_name)[0] + '.json'
            json_file_path = os.path.join(output_dir, json_file_name)
            
            print(f"Converting {csv_file_path} to JSON...")
            if convert_csv_to_json(csv_file_path, json_file_path):
                success_count += 1
        else:
            print(f"Warning: File not found - {csv_file_path}")
    
    print(f"Conversion completed. {success_count} of {len(csv_files)} files were successfully converted.")

if __name__ == "__main__":
    process_all_csv_files() 