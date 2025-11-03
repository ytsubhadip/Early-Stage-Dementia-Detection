import joblib
path = "C:\\Users\\Hp\\Desktop\\college project\\Early-Stage-Dementia-Detection\\model\\model.joblib"
model = joblib.load(path)

def model_pred(data):
    value = model.predict(data)
    print(value[0])
    return value[0]

if __name__ == "__main__":
    model_pred([[0,	0,87,14,2.0,27.0,0.0,1987,0.696,0.883]])

