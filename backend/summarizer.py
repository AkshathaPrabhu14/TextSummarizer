import os
from groq import Groq
from dotenv import load_dotenv

# Ensure environment variables are loaded
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path)

def summarize_text(text: str) -> str:
    """
    Sends the provided text to the Groq API and returns a concise summary.
    
    Args:
        text (str): The text to be summarized.
        
    Returns:
        str: The generated summary.
        
    Raises:
        ValueError: If input text is empty or API key is missing.
        Exception: For general API call failures.
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "placeholder" in api_key:
        raise ValueError("Groq API key is missing. Please configure GROQ_API_KEY in your local backend/.env file or in your hosting provider's dashboard (e.g., Render environment variables).")
        
    try:
        # Initialize the Groq client lazily
        client = Groq(api_key=api_key)
        
        # Create completion request to the Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert, professional text summarizer. "
                        "Your task is to create a clear, concise, and structured summary of the user's text. "
                        "Maintain the core message, key facts, and essential details. "
                        "Avoid introduction filler like 'Here is a summary' or 'In summary'. "
                        "Output the summary in bullet points or paragraphs, whichever is most readable."
                    )
                },
                {
                    "role": "user",
                    "content": f"Please summarize the following text:\n\n{text}"
                }
            ],
            model="llama-3.3-70b-versatile", # Highly powerful and fast model on Groq
            temperature=0.3,                 # Lower temperature for more factual and focused summaries
            max_tokens=1024,                 # Limit length of response
        )
        
        # Extract the content of the response
        summary = chat_completion.choices[0].message.content
        return summary.strip()
        
    except Exception as e:
        # Raise standard exception to be caught in routes
        raise Exception(f"Groq API Error: {str(e)}")
