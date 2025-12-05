from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)

DATA_FILE = "scores.csv"


def init_score_file():
    """Create CSV file if it doesn't exist."""
    if not os.path.exists(DATA_FILE):
        df = pd.DataFrame(columns=["timestamp", "score"])
        df.to_csv(DATA_FILE, index=False)


@app.route("/")
def index():
    """Render the game page and send current best score."""
    init_score_file()

    if os.path.getsize(DATA_FILE) > 0:
        df = pd.read_csv(DATA_FILE)
        if not df.empty:
            high_score = int(df["score"].max())
        else:
            high_score = 0
    else:
        high_score = 0

    return render_template("index.html", high_score=high_score)


@app.route("/submit_score", methods=["POST"])
def submit_score():
    """Receive score from frontend and save it using pandas & numpy."""
    data = request.get_json()
    score = int(data.get("score", 0))

    init_score_file()

    # Append new score
    new_row = pd.DataFrame(
        {
            "timestamp": [datetime.now().isoformat()],
            "score": [score],
        }
    )

    if os.path.getsize(DATA_FILE) > 0:
        df = pd.read_csv(DATA_FILE)
        df = pd.concat([df, new_row], ignore_index=True)
    else:
        df = new_row

    # Use NumPy + pandas for stats
    scores_array = df["score"].to_numpy()
    high_score = int(np.max(scores_array))
    avg_score = float(np.mean(scores_array))

    df.to_csv(DATA_FILE, index=False)

    return jsonify(
        {
            "message": "Score saved",
            "high_score": high_score,
            "average_score": round(avg_score, 2),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
