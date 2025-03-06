import json
import os

def process_mbti_posts():
    """
    Process the raw MBTI post data and generate a count of posts by MBTI type.
    Saves the result to data/processedJson/postCount.json
    """
    print("Processing MBTI post data...")
    
    # Input and output file paths
    input_file = 'data/rawJson/post/mbtiPost.json'
    output_dir = 'data/processedJson'
    output_file = f'{output_dir}/postCount.json'
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")
    
    try:
        # Read the raw data
        with open(input_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        print(f"Loaded {len(raw_data)} MBTI post entries")
        
        # Count posts by MBTI type
        type_counts = {}
        for entry in raw_data:
            mbti_type = entry.get('type')
            if mbti_type:
                if mbti_type not in type_counts:
                    type_counts[mbti_type] = 0
                type_counts[mbti_type] += 1
        
        # Convert to array format for visualization
        result = [{"type": mbti_type, "count": count} for mbti_type, count in type_counts.items()]
        
        # Sort by count (descending)
        result.sort(key=lambda x: x["count"], reverse=True)
        
        # Write the processed data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        print(f"Successfully generated {output_file}")
        print(f"Found {len(result)} MBTI types with the following counts:")
        for item in result:
            print(f"  {item['type']}: {item['count']} posts")
            
    except Exception as e:
        print(f"Error processing MBTI post data: {e}")

if __name__ == "__main__":
    process_mbti_posts()