# Inventra-AI
# Problem Title:-
Inventory Demand Forecasting for Small & Medium Businesses

# Problem Description:-
Small and medium businesses often rely on manual forecasting or spreadsheets for inventory planning. These methods fail to capture trends, seasonality, and demand variability, leading to overstocking or stockouts. The lack of structured forecasting causes financial losses and inefficient supply chain management.

## Target Users:-
Retail store owners
E-commerce sellers
Warehouse managers
Inventory planners

## Existing Gaps:-
No automated demand prediction
No seasonality detection
No uncertainty estimation
No data-driven restocking suggestions
Heavy dependency on manual spreadsheets

## Problem Understanding & Approach
Root Cause Analysis
Businesses store data but do not analyze it properly
No structured time-series modeling
No statistical forecasting methods
Lack of risk-based inventory planning
## Solution Strategy:-
(Inventra AI)
Use historical sales data (CSV)
Convert data into time-series format
Apply forecasting models
Quantify uncertainty using confidence intervals
Generate reorder recommendations using inventory logic

## Proposed Solution:-
Solution Overview
A forecasting engine that takes historical sales data as input and outputs demand predictions with confidence intervals and restocking recommendations.

## Core Idea:-
Use classical time-series models (Moving Average, Exponential Smoothing, Holt-Winters) to build an interpretable and business-friendly forecasting tool.
Key Features
✔ CSV-based input
✔ SKU-level forecasting
✔ Trend & seasonality decomposition
✔ Confidence interval generation
✔ Reorder point calculation
✔ Visualization dashboard
✔ Multi-SKU support

## System Architecture:-
High-Level Flow
User → Frontend → Backend API → Forecasting Model → Database → Response
Architecture Description
User uploads CSV file via frontend
Backend processes data
Forecasting model generates predictions
System calculates confidence interval
Reorder logic computes restocking quantity
Results stored in database
Response returned to frontend with visualizations


## Database Design:-
Entities:
User
SKU
SalesData
Forecast
Inventory
Relationships:
One User → Many SKUs
One SKU → Many Sales Records
One SKU → One Forecast Record
Inventory linked to SKU

## Dataset Selected
Dataset Name
Historical Retail Sales Dataset (Custom CSV)
Source
Business-provided sales CSV / Simulated dataset
Data Type
Time-series sales data
Columns:
date, sku, sales
Selection Reason
Simple structure
Suitable for time-series modeling
Real-world retail applicability
Preprocessing Steps
Date parsing
Missing value handling
Outlier detection
Aggregation (daily/weekly/monthly)
Sorting by time

## Model Selected:-
Model Name
Holt-Winters Exponential Smoothing
Selection Reasoning
Captures trend
Handles seasonality
Interpretable
Suitable for retail demand
Alternatives Considered
Moving Average (baseline)
ARIMA
Prophet
LSTM (deep learning)
Evaluation Metrics
MAE (Mean Absolute Error)
RMSE (Root Mean Squared Error)
MAPE (Mean Absolute Percentage Error)

## Technology Stack
Frontend
Streamlit / React
Backend
Python (FastAPI / Flask)
ML/AI
Pandas
NumPy
Statsmodels
Database
SQLite / PostgreSQL
Deployment
Render / Railway / AWS / Local Server

## API Documentation & Testing:-
API Endpoints List
Endpoint 1: Upload Data
POST /upload
Uploads CSV file.
Endpoint 2: Generate Forecast
GET /forecast/
Returns forecast + confidence interval.
Endpoint 3: Reorder Recommendation
GET /reorder/
Returns reorder quantity & safety stock.
API Testing Screenshots
(Add Postman / Thunder Client screenshots here)

## Module-wise Development & Deliverables:-
Checkpoint 1: Research & Planning
Deliverables:
Problem analysis document
Model comparison study
Architecture design
Checkpoint 2: Backend Development
Deliverables:
API endpoints
CSV processing module
Database integration
Checkpoint 3: Frontend Development
Deliverables:
Upload interface
Dashboard
Forecast visualization
Checkpoint 4: Model Training
Deliverables:
Implement Moving Average
Implement Holt-Winters
Model evaluation results
Checkpoint 5: Model Integration
Deliverables:
API connected to model
End-to-end testing
Checkpoint 6: Deployment
Deliverables:
Live hosted link
Deployment documentation
## End-to-End Workflow
User uploads sales CSV
Data cleaned and processed
Model trained on historical data
Future demand forecast generated
Confidence interval calculated
Reorder recommendation computed
Results displayed on dashboard

##  Demo & Video
Demo Link:- inventra-ai.onrender.com
Demo Video:- https://drive.google.com/file/d/1HE49_rYSlcaFw3qPWW_BQIECPLM8rN74/view?usp=sharing
GitHub Repo:- https://github.com/Naman67780/Inventra-AI/tree/4eb19f30ad27a441c7dc0c3fe6daf9363bfb31d7

## Hackathon Deliverables Summary

During the hackathon, we successfully developed Inventra AI, an intelligent inventory forecasting web application designed to help small businesses and retail stores optimize stock management.

Key deliverables include:

A fully functional web dashboard for inventory insights.

CSV data upload functionality for sales data analysis.

Automated demand forecasting based on historical patterns.

Interactive data visualizations including charts and analytics.

A live deployed application accessible through a public URL.

A GitHub repository containing the complete source code and documentation.

A demo video demonstrating the platform's workflow and features.

The solution enables users to analyze sales trends and make smarter stocking decisions, reducing overstock and stockouts.

## Future Scope & Scalability
Short-Term

Improve forecasting accuracy using advanced machine learning models.

Add real-time inventory tracking.

Implement user authentication and store management.

Enable automatic restock recommendations based on demand predictions.

Improve dashboard analytics with more detailed insights.

Long-Term

Integrate with POS systems and ERP platforms.

Build a mobile application for store owners.

Add AI-powered demand prediction using deep learning models.

Support multi-store inventory management.

Implement cloud-based analytics for large retail chains.

## Known Limitations

Forecasting currently relies on limited historical data patterns.

The system does not yet support real-time inventory synchronization.

CSV data format must follow a specific structure for proper analysis.

Large datasets may increase processing time.

Advanced AI models and automated supply chain integration are not yet implemented.

nventra AI has the potential to significantly improve inventory efficiency for small and medium-sized businesses.

## Expected impact includes:

Reduced stock wastage through better demand prediction.

Prevention of stockouts, ensuring products remain available.

Data-driven decision making for inventory managers.

Improved operational efficiency for retail stores.

By leveraging data analytics and forecasting, the platform helps businesses optimize inventory levels and reduce operational costs.
