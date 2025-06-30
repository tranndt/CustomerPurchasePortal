from flask import Flask, request, jsonify
from sentiment_analyzer import sentiment_analyzer

app = Flask("SentimentAnalyzer")

@app.route("/analyze/<text>", methods=["GET"])
def analyze(text):
    result = sentiment_analyzer(text)
    if result['label'] is None:
        return jsonify({"error": "Invalid input"}), 400
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
