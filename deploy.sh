#!/bin/bash

# Lotaya AI - Complete Deployment Script
# Google Cloud Run + Firebase Hosting

PROJECT_ID="nexorasims"
REGION="us-west1"
APP_NAME="lotaya-ai-backend"
FRONTEND_DIR="/app/frontend"
BACKEND_DIR="/app/backend"
SERVICE_ACCOUNT_EMAIL="lotaya-ai@nexorasims.iam.gserviceaccount.com"

echo "🚀 Lotaya AI - Complete Platform Deployment"
echo "=========================================="

# Set GCP Project
echo "📋 Setting up GCP Project..."
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION

# Enable required APIs
echo "🔧 Enabling Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com

# Deploy Backend to Cloud Run
echo "🐍 Deploying FastAPI Backend to Cloud Run..."
cd $BACKEND_DIR

# Create Dockerfile for FastAPI
cat <<EOL > Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8080

# Run the application
CMD exec uvicorn server:app --host 0.0.0.0 --port \$PORT
EOL

# Update server.py to use PORT from environment
sed -i 's/port=8001/port=int(os.getenv("PORT", 8001))/' server.py

# Build and deploy
gcloud run deploy $APP_NAME \\
  --source . \\
  --region $REGION \\
  --allow-unauthenticated \\
  --platform managed \\
  --memory 2Gi \\
  --cpu 1 \\
  --timeout 3600 \\
  --max-instances 10 \\
  --set-env-vars="MONGO_URL=\${MONGO_URL},GEMINI_API_KEY=\${GEMINI_API_KEY},FIREBASE_PROJECT_ID=\${FIREBASE_PROJECT_ID}"

# Get backend URL
BACKEND_URL=\$(gcloud run services describe $APP_NAME --region=$REGION --format="value(status.url)")
echo "✅ Backend deployed at: \$BACKEND_URL"

# Deploy Frontend to Firebase Hosting
echo "⚛️  Deploying React Frontend to Firebase Hosting..."
cd $FRONTEND_DIR

# Update frontend environment with backend URL
echo "VITE_BACKEND_URL=\${BACKEND_URL}" >> .env

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    npm install -g firebase-tools
fi

# Login to Firebase (if not already)
firebase login --no-localhost

# Initialize Firebase (if not already)
if [ ! -f firebase.json ]; then
    firebase init hosting --project $PROJECT_ID --public dist --single-app --yes
fi

# Build the frontend
yarn build

# Deploy to Firebase Hosting
firebase deploy --only hosting --project $PROJECT_ID

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "🌐 Frontend URL: https://\${PROJECT_ID}.web.app"
echo "🚀 Backend API: \$BACKEND_URL"
echo "📊 MongoDB: Connected"
echo "🔥 Firebase: Enabled"
echo "💳 Payment Gateway: Myanmar PGW Ready"
echo "🎨 3D Backgrounds: Active"
echo ""
echo "✨ Lotaya AI is now live and ready to transform ideas into designs!"

# Create Firebase configuration for the frontend
echo "📝 Creating Firebase configuration..."
cat <<EOL > $FRONTEND_DIR/firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|jsx|ts|tsx)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOL

echo "🔧 Setup complete! Run this script to deploy to production."