import json
import re
from collections import Counter
import nltk
from nltk.corpus import stopwords
import os

# Download necessary NLTK data (only needs to be run once)
def download_nltk_data():
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except LookupError:
        print("Downloading NLTK data...")
        nltk.download('punkt')
        nltk.download('stopwords')

def clean_text(text):
    """Clean the text by removing URLs, special characters, etc."""
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Convert to lowercase
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_word_counts(posts, num_words=20):
    """Get word counts from a list of posts."""
    # Combine all posts
    all_text = " ".join(posts)
    
    # Clean the text
    clean_text_data = clean_text(all_text)
    
    # Tokenize
    words = nltk.word_tokenize(clean_text_data)
    
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    filtered_words = [word for word in words if word.lower() not in stop_words and len(word) > 2]
    
    # Count word frequencies
    word_counts = Counter(filtered_words)
    
    # Get the top N words
    top_words = word_counts.most_common(num_words)
    
    return [{"word": word, "count": count} for word, count in top_words]

def process_mbti_posts(input_file, output_file):
    """Process MBTI posts and create word count JSON."""
    try:
        print(f"Starting to process MBTI posts from {input_file}")
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Load JSON data
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Loaded {len(data)} entries from JSON file")
        
        # Group posts by MBTI type
        mbti_groups = {}
        for entry in data:
            mbti_type = entry["type"]
            post = entry["posts"]
            
            if mbti_type not in mbti_groups:
                mbti_groups[mbti_type] = []
            
            mbti_groups[mbti_type].append(post)
        
        print(f"Found {len(mbti_groups)} different MBTI types")
        for mbti_type, posts in mbti_groups.items():
            print(f"  - {mbti_type}: {len(posts)} posts")
        
        # Calculate word frequencies for each MBTI type
        result = []
        for mbti_type, posts in mbti_groups.items():
            print(f"\nProcessing {mbti_type}...")
            word_counts = get_word_counts(posts)
            result.append({
                "mbti_type": mbti_type,
                "word_counts": word_counts
            })
        
        # Write results to output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        print(f"Word count analysis complete. Results saved to {output_file}")
        return True
    
    except Exception as e:
        print(f"Error processing MBTI posts: {e}")
        return False

if __name__ == "__main__":
    # Download NLTK data if needed
    download_nltk_data()
    
    # Input and output file paths
    input_file = "data/rawJson/post/mbtiPost.json"
    output_file = "data/processedJson/mbti_word_counts.json"

    # Process the data
    process_mbti_posts(input_file, output_file) 