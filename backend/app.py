import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from werkzeug.utils import secure_filename
from utils.parser import process_inventory_data

app = Flask(__name__)
# Enable CORS for the frontend origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__name__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB limit

ALLOWED_EXTENSIONS = {'csv'}

# In-memory store for dashboard data across requests (Demo purpsoes instead of a DB)
GLOBAL_DASHBOARD_DATA = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Inventra AI Backend is running."})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Basic validation
            df = pd.read_csv(filepath)
            
            # Very basic check for a date column and sales/qty column
            # In a real app we'd map columns dynamically or require a specific schema
            columns = [c.lower() for c in df.columns]
            
            # Process the data using statsmodels forecasting & inventory mathematical logic
            global GLOBAL_DASHBOARD_DATA
            GLOBAL_DASHBOARD_DATA = process_inventory_data(df)
            
            return jsonify({
                "message": "File uploaded and processed successfully",
                "filename": filename,
                "columns": columns,
                "rows_processed": len(df)
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to process CSV: {str(e)}"}), 500
            
    return jsonify({"error": "File type not allowed. Must be CSV."}), 400

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    if GLOBAL_DASHBOARD_DATA is None:
        return jsonify({
            "message": "No data uploaded yet. Please upload a CSV first.",
            "data": None
        }), 200
        
    return jsonify({
        "message": "Success",
        "data": GLOBAL_DASHBOARD_DATA
    }), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
