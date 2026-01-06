# AWS Lambda Deployment Guide

This guide will help you deploy the StreamWise backend to AWS Lambda.

## Prerequisites

1. **AWS Account**: Sign up at https://aws.amazon.com
2. **AWS CLI**: Install from https://aws.amazon.com/cli/
3. **Node.js**: Version 18.x or higher
4. **Serverless Framework**: Install globally:
   ```bash
   npm install -g serverless
   ```

## Setup Steps

### 1. Configure AWS Credentials

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Set Environment Variables

Create a `.env` file in the `backend` directory:

```env
TMDB_API_KEY=your_tmdb_api_key_here
FALLBACK_API_KEY=your_fallback_key_here
NODE_ENV=production
```

### 4. Deploy to AWS Lambda

```bash
cd backend
serverless deploy
```

This will:
- Create a Lambda function
- Create an API Gateway endpoint
- Deploy your code
- Output your API Gateway URL

### 5. Get Your API Gateway URL

After deployment, you'll see output like:

```
endpoints:
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

Copy the base URL (e.g., `https://xxxxx.execute-api.us-east-1.amazonaws.com/dev`)

### 6. Update Frontend Config

Update `frontend/src/config.ts` with your Lambda API Gateway URL:

```typescript
export const API_BASE_URL = __DEV__
  ? "http://localhost:4000"
  : "https://xxxxx.execute-api.us-east-1.amazonaws.com/dev";
```

### 7. Test the Deployment

```bash
curl https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/health
```

Should return: `{"ok":true}`

## Local Development with Serverless

To test Lambda locally:

```bash
cd backend
serverless offline
```

This runs your Lambda function locally at `http://localhost:3000`

## Updating Environment Variables

To update environment variables after deployment:

1. Edit `serverless.yml` and update the `environment` section
2. Redeploy: `serverless deploy`

Or use AWS Console:
1. Go to Lambda → Functions → streamwise-backend-dev-api
2. Configuration → Environment variables
3. Edit and save

## Monitoring

View logs:
```bash
serverless logs -f api --tail
```

Or use AWS CloudWatch:
- Go to CloudWatch → Log groups
- Find `/aws/lambda/streamwise-backend-dev-api`

## Cost

AWS Lambda free tier includes:
- 1 million free requests per month
- 400,000 GB-seconds of compute time per month

For most use cases, this should be free or very low cost.

## Troubleshooting

**Deployment fails:**
- Check AWS credentials: `aws sts get-caller-identity`
- Ensure you have permissions for Lambda, API Gateway, CloudFormation

**Function times out:**
- Increase timeout in `serverless.yml`: `timeout: 60`

**CORS errors:**
- CORS is enabled in `serverless.yml` and `server.js`
- Check API Gateway CORS settings in AWS Console

**Environment variables not working:**
- Ensure variables are set in `serverless.yml` under `provider.environment`
- Redeploy after changes: `serverless deploy`

## Removing Deployment

To delete all AWS resources:

```bash
serverless remove
```
