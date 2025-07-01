from flask import Flask, request, jsonify
from sentiment_analyzer import sentiment_analyzer

app = Flask("SentimentAnalyzer")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Sentiment Analyzer. Use /analyze/text to get the sentiment", "port": 5002})

@app.route("/analyze/<text>", methods=["GET"])
def analyze(text):
    result = sentiment_analyzer(text)
    if result['label'] is None:
        return jsonify({"error": "Invalid input"}), 400
    return jsonify(result)

if __name__ == "__main__":
    print("Starting Flask app on port 5002...")
    app.run(host="0.0.0.0", port=5002, debug=True)
