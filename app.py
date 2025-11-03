from flask import Flask, jsonify
from predict_model import model_pred


app = Flask(__name__)

@app.route("/model_predict", methods = ["GET","POST"])
def model_predict():
    data = [[0,	0,87,14,2.0,27.0,0.0,1987,0.696,0.883]]
    value = model_pred(data)

    return jsonify(value) 

app.run(debug=True)