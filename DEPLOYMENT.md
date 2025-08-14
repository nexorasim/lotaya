# Lotaya AI Deployment Guide for Google Cloud Run

This guide provides step-by-step instructions to deploy the Lotaya AI application to Google Cloud Run using Cloud Build. This setup automates the containerization and deployment process, ensuring a secure and scalable production environment.

## 1. Prerequisites

- A Google Cloud project with billing enabled.
- The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and initialized.
- Your project source code available in a Git repository (e.g., GitHub, Cloud Source Repositories) or locally.

## 2. Google Cloud Project Setup

Execute the following commands in your terminal to configure your project and enable the necessary APIs.

1.  **Set your Project ID**:
    Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID.
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

2.  **Enable Required APIs**:
    This enables Cloud Run, Cloud Build, Artifact Registry, and Secret Manager.
    ```bash
    gcloud services enable \
      run.googleapis.com \
      cloudbuild.googleapis.com \
      artifactregistry.googleapis.com \
      secretmanager.googleapis.com \
      iam.googleapis.com
    ```

## 3. Create an Artifact Registry Repository

This repository will store the Docker images for your application. We'll use `us-central1` as the region, but you can choose another one.

```bash
gcloud artifacts repositories create lotaya-ai-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for Lotaya AI"
```

## 4. Store the Gemini API Key in Secret Manager

Storing your API key in Secret Manager is a security best practice. Cloud Run will securely access this secret at runtime.

1.  **Create a secret**:
    ```bash
    gcloud secrets create lotaya-gemini-api-key --replication-policy="automatic"
    ```

2.  **Add your Gemini API key as a secret version**:
    Replace `YOUR_GEMINI_API_KEY` with your actual key.
    ```bash
    echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add lotaya-gemini-api-key --data-file=-
    ```

## 5. Grant Permissions to the Cloud Build Service Account

The Cloud Build service account needs permission to deploy to Cloud Run and access the API key secret.

1.  **Get your Project Number and assign it to a variable**:
    ```bash
    PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
    ```

2.  **Grant Cloud Run Admin and Service Account User roles**:
    This allows Cloud Build to deploy and manage the Cloud Run service.
    ```bash
    gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
      --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
      --role="roles/run.admin"

    gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
      --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
      --role="roles/iam.serviceAccountUser"
    ```

3.  **Grant Secret Accessor role**:
    This allows the Cloud Run service to access the secret at runtime.
    ```bash
    gcloud secrets add-iam-policy-binding lotaya-gemini-api-key \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```

## 6. Deploy the Application

With the setup complete, you can now deploy your application.

1.  **Commit Your Code**:
    Ensure all new files (`Dockerfile`, `cloudbuild.yaml`, `.gitignore`) are committed to your Git repository if you are using a Git-based trigger.

2.  **Submit the Build to Cloud Build**:
    Run the following command from the root directory of your project.
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```

Cloud Build will now execute the steps in `cloudbuild.yaml`: build the Docker image, push it to Artifact Registry, and deploy it to Cloud Run. Once finished, the command will output the public URL of your deployed service.

## 7. Continuous Monitoring

For production stability, you can set up a Google Cloud Uptime Check to monitor the `/health` endpoint of your service.

1.  Navigate to **Cloud Monitoring > Uptime checks** in the Google Cloud Console.
2.  Click **Create uptime check** and configure it to target your service's URL with the path `/health`.
3.  Set up alerting to be notified if your service becomes unresponsive.
