import requests
import json
import os
from dotenv import load_dotenv

# Try to use VADER sentiment analysis as fallback
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False

load_dotenv()

def get_access_token(api_key):
    """Get access token from IBM Cloud IAM"""
    iam_url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }
    
    try:
        response = requests.post(iam_url, headers=headers, data=data, timeout=10)
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            return None
    except requests.exceptions.RequestException:
        return None

def sentiment_analyzer_vader(text_to_analyze):
    """Fallback sentiment analysis using VADER"""
    if not VADER_AVAILABLE:
        return {"label": None, "score": None, "error": "VADER sentiment analyzer not available"}
    
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text_to_analyze)
    
    # Determine sentiment based on compound score
    compound = scores['compound']
    if compound >= 0.05:
        label = "POSITIVE"
        score = compound
    elif compound <= -0.05:
        label = "NEGATIVE"
        score = abs(compound)
    else:
        label = "NEUTRAL"
        score = 0.5
    
    return {"label": label, "score": round(score, 2)}

def sentiment_analyzer(text_to_analyze):
    api_key = os.getenv("WATSONX_API_KEY")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    server_url = os.getenv("SERVER_URL")

    # If Watson X credentials are not available, use VADER as fallback
    if not api_key or not project_id or not server_url:
        return sentiment_analyzer_vader(text_to_analyze)

    # Get access token
    access_token = get_access_token(api_key)
    if not access_token:
        # Fallback to VADER if authentication fails
        return sentiment_analyzer_vader(text_to_analyze)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    # Try with IBM Granite model
    payload = {
        "input": f"Analyze the sentiment of this text and respond with only 'positive', 'negative', or 'neutral': {text_to_analyze}",
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 10,
            "temperature": 0.1
        },
        "model_id": "ibm/granite-3b-code-instruct",
        "project_id": project_id
    }

    try:
        response = requests.post(server_url, headers=headers, json=payload, timeout=30)
        if response.status_code != 200:
            # Fallback to VADER if Watson X fails
            return sentiment_analyzer_vader(text_to_analyze)
        
        result = response.json()
        
        # Extract sentiment from the generated text
        if "results" in result and len(result["results"]) > 0:
            generated_text = result["results"][0].get("generated_text", "").strip().lower()
            
            # Simple sentiment mapping
            if "positive" in generated_text:
                return {"label": "POSITIVE", "score": 0.8}
            elif "negative" in generated_text:
                return {"label": "NEGATIVE", "score": 0.8}
            elif "neutral" in generated_text:
                return {"label": "NEUTRAL", "score": 0.5}
            else:
                return sentiment_analyzer_vader(text_to_analyze)
        else:
            return sentiment_analyzer_vader(text_to_analyze)
            
    except requests.exceptions.RequestException:
        return sentiment_analyzer_vader(text_to_analyze)
