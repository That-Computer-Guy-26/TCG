# TCG Backend - Cloud Run Deployment Guide

## Overview

Cloud Run allows you to run your Express backend as a serverless container. It:
- Scales from 0 to 1000+ instances automatically
- Costs $0 when not in use
- Handles traffic spikes effortlessly
- Integrates seamlessly with Firebase

## Prerequisites

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version

# Set project
gcloud config set project babysitter-b322c

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Deployment Methods

### Method 1: From Source (Easiest)

```bash
# Deploy directly from your repository
cd tcg-website-firebase

gcloud run deploy tcg-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 3600s \
  --set-env-vars FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
```

### Method 2: Using Docker (More Control)

```bash
# Build Docker image
docker build -t gcr.io/babysitter-b322c/tcg-backend .

# Push to Container Registry
docker push gcr.io/babysitter-b322c/tcg-backend

# Deploy to Cloud Run
gcloud run deploy tcg-backend \
  --image gcr.io/babysitter-b322c/tcg-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 3600s
```

### Method 3: Automated from GitHub Actions

Add to your `.github/workflows/deploy.yml`:

```yaml
deploy-backend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: babysitter-b322c
    
    - name: Configure Docker
      run: |
        gcloud auth configure-docker gcr.io
    
    - name: Build and push
      run: |
        docker build -t gcr.io/babysitter-b322c/tcg-backend .
        docker push gcr.io/babysitter-b322c/tcg-backend
    
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy tcg-backend \
          --image gcr.io/babysitter-b322c/tcg-backend:latest \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
```

## Configuration

### Environment Variables

Create `config.env` in Cloud Run deployment:

```bash
gcloud run deploy tcg-backend \
  --set-env-vars \
    FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com,\
    EMAIL_USER=your-email@gmail.com,\
    EMAIL_PASS=your-app-password,\
    TWILIO_ACCOUNT_SID=your-sid,\
    TWILIO_AUTH_TOKEN=your-token,\
    TWILIO_PHONE_NUMBER=+1234567890
```

### Memory & CPU

```bash
# Minimum (256 MB, 0.25 CPU)
--memory 256Mi \
--cpu 0.25

# Recommended (512 MB, 0.5 CPU)
--memory 512Mi \
--cpu 0.5

# Heavy load (2 GB, 2 CPU)
--memory 2Gi \
--cpu 2
```

### Scaling

```bash
# Max instances
--max-instances 100

# Min instances (keep warm)
--min-instances 0  # Scale to zero when idle

# Concurrency
--concurrency 80  # Max concurrent requests per instance
```

## Monitoring

### View Logs

```bash
# Real-time logs
gcloud run logs read tcg-backend --follow

# Filter by level
gcloud run logs read tcg-backend --limit 50 --region us-central1
```

### Setup Monitoring

```bash
# View metrics in Cloud Console
# https://console.cloud.google.com/run/detail/us-central1/tcg-backend/metrics
```

### Set Up Alerts

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert policy:
   - Condition: Error rate > 5%
   - Notification: Email
   - Duration: 5 minutes

## Cost Estimation

| Activity | Cost |
|----------|------|
| 1M requests/month | ~$0.40 |
| Idle time (scaled to 0) | $0.00 |
| Data transfer | First 1GB free |
| Execution time | Based on usage |

**Total**: $0.40-10/month depending on usage

## Testing

### Local

```bash
# Start locally
npm run dev
# Test at http://localhost:3000
```

### Cloud Run

```bash
# Get service URL
gcloud run services describe tcg-backend --region us-central1

# Test endpoint
curl https://tcg-backend-xxxxx.run.app/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "features": { ... }
# }
```

## Updating Deployment

### Deploy new version

```bash
# Build and deploy
gcloud run deploy tcg-backend \
  --source . \
  --platform managed \
  --region us-central1
```

### Rollback

```bash
# List all revisions
gcloud run revisions list

# Route traffic to previous version
gcloud run services update-traffic tcg-backend \
  --to-revisions previous=100
```

## Integration with Frontend

Update your frontend to use Cloud Run URL:

```javascript
// src/App.jsx
const API_BASE = process.env.VITE_API_URL || 
  'https://tcg-backend-xxxxx.run.app';
```

Or in `.env`:

```
VITE_API_URL=https://tcg-backend-xxxxx.run.app
```

## Troubleshooting

### Deployment fails

```bash
# Check logs
gcloud run logs read tcg-backend --limit 100

# Common issues:
# - Missing environment variables
# - Port not set to 3000
# - Container too large
# - Timeout too short
```

### Service times out

```bash
# Increase timeout
gcloud run deploy tcg-backend \
  --timeout 3600s  # 1 hour
```

### High latency

```bash
# Use min-instances to keep service warm
gcloud run deploy tcg-backend \
  --min-instances 1

# Costs: ~$7/month per minimum instance
```

## Security

### Require authentication

```bash
# Remove --allow-unauthenticated flag
gcloud run deploy tcg-backend \
  --platform managed \
  --region us-central1

# Add service account key in headers
```

### Setup IAM

```bash
# Allow specific service accounts
gcloud run services add-iam-policy-binding tcg-backend \
  --member=serviceAccount:my-app@project.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

## Custom Domain

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service tcg-backend \
  --domain api.thatcomputerguy.com

# Update DNS CNAME to:
# ghs.googleusercontent.com
```

## Next Steps

1. Deploy: `gcloud run deploy tcg-backend --source .`
2. Test: `curl https://your-service-url/health`
3. Monitor: Check Cloud Run console
4. Setup CI/CD: Add GitHub Actions
5. Configure custom domain: Map your domain
6. Setup alerts: Monitor errors & latency

---

**Deployed Service**:
- URL: Will be provided after deployment
- Region: us-central1
- Memory: 512 MB
- CPU: 0.5
- Timeout: 3600s
- Cost: ~$0.40-10/month

For questions: Gary (812) 373-6023
