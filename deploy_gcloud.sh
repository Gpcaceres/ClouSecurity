#!/bin/bash
set -euo pipefail

# Usage:
# PROJECT_ID=your-project-id ./deploy_gcloud.sh
# Optional env vars: REGION (default us-central1), REPO (default cloudsec-repo), ALLOW_UNAUTH (true/false)

if [ -z "${PROJECT_ID:-}" ]; then
  echo "ERROR: PROJECT_ID env var not set. Example: PROJECT_ID=brave-healer-468720-u5 ./deploy_gcloud.sh"
  exit 1
fi

REGION=${REGION:-us-central1}
REPO=${REPO:-cloudsec-repo}
SERVICE=${SERVICE:-cloudsec}
ALLOW_UNAUTH=${ALLOW_UNAUTH:-true}
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:latest"

echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Artifact Registry repo: $REPO"
echo "Image: $IMAGE"

gcloud config set project "$PROJECT_ID"

echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com --project "$PROJECT_ID"

echo "Creating Artifact Registry repository (if not exists) in $REGION..."
gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION" --description="Docker repo for cloudsec" --project "$PROJECT_ID"

echo "Building and pushing image using Cloud Build..."
gcloud builds submit --tag "$IMAGE" .

echo "Deploying to Cloud Run ($SERVICE)..."
if [ "$ALLOW_UNAUTH" = "true" ]; then
  gcloud run deploy "$SERVICE" --image "$IMAGE" --region "$REGION" --platform managed --allow-unauthenticated --project "$PROJECT_ID"
else
  gcloud run deploy "$SERVICE" --image "$IMAGE" --region "$REGION" --platform managed --project "$PROJECT_ID"
fi

echo "Deployment finished. Service URL:"
gcloud run services describe "$SERVICE" --platform managed --region "$REGION" --format='value(status.url)'

echo "Notes:"
echo "- Run this from a machine with 'gcloud' authenticated (gcloud auth login) and sufficient IAM permissions."
echo "- To use Secret Manager for the API key, create a secret and set it as an env var when deploying (see commented commands in the README)."
