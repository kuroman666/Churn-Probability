import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import xgboost as xgb

app = Flask(__name__)

# 允許所有來源跨域請求 (解決 GitHub Pages 連線 Render 的問題)
CORS(app)

# 全域變數存放模型
model = None

def load_model():
    global model
    try:
        # 嘗試載入模型，請確保檔案名稱與您上傳的一致
        model_path = 'churn_model_bank.pkl'
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print("✅ 模型載入成功！")
        else:
            print(f"❌ 找不到模型檔案: {model_path}")
            print("請確認您已將 .pkl 檔案上傳到 GitHub")
    except Exception as e:
        print(f"❌ 模型載入發生錯誤: {str(e)}")

# 應用程式啟動時載入模型
load_model()

@app.route('/', methods=['GET'])
def home():
    return "Bank AI Backend is Running! (Use /predict for API)"

@app.route('/predict', methods=['POST'])
def predict():
    global model
    if not model:
        # 如果模型沒載入成功，嘗試重新載入
        load_model()
        if not model:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500

    try:
        # 1. 接收資料
        data = request.get_json()
        
        # 2. 轉換為 DataFrame (需嚴格對應模型訓練時的欄位順序與名稱)
        input_data = pd.DataFrame([{
            'CreditScore': int(data.get('creditScore')),
            'Geography': str(data.get('geography')),
            'Gender': str(data.get('gender')),
            'Age': int(data.get('age')),
            'Tenure': int(data.get('tenure')),
            'Balance': float(data.get('balance')),
            'NumOfProducts': int(data.get('numOfProducts')),
            'HasCrCard': int(1 if data.get('hasCrCard') else 0),
            'IsActiveMember': int(1 if data.get('active') else 0),
            'EstimatedSalary': float(data.get('salary'))
        }])

        # 3. 處理類別特徵 (XGBoost enable_categorical=True 需要 category 型態)
        cat_cols = ['Geography', 'Gender']
        for col in cat_cols:
            input_data[col] = input_data[col].astype('category')

        # 4. 預測
        # predict_proba 回傳 [[不流失機率, 流失機率]]
        probability = model.predict_proba(input_data)[0][1]
        
        return jsonify({
            'probability': float(probability),
            'status': 'success'
        })

    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 這是給本地測試用的，Render 不會執行這一行，而是使用 Gunicorn
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)




