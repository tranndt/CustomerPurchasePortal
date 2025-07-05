import os
from flask import Flask, request, jsonify
from sentiment_analyzer import sentiment_analyzer

app = Flask("SentimentAnalyzer")

@app.route("/", methods=["GET"])
def home():
    port = os.environ.get("PORT", 5002)
    return jsonify({"message": "Welcome to the Sentiment Analyzer. Use /analyze/text to get the sentiment", "port": port})

@app.route("/analyze/<text>", methods=["GET"])
def analyze(text):
    result = sentiment_analyzer(text)
    if result['label'] is None:
        return jsonify({"error": "Invalid input"}), 400
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    print(f"Starting Flask app on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
