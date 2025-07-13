# Serverless Log Aggregation & Search

This repository implements a serverless log aggregation pipeline on AWS, storing logs in S3, ETL into Snowflake, and a Next.js UI for search.

Why “Serverless”?
-No servers to manage: You don’t provision, update, or scale any log-collection servers, ElasticSearch nodes, or database instances yourself.
-Automatic scaling: Lambdas automatically handle spikes in log volume, and S3 simply scales to your storage needs.
-Cost efficiency: You pay only for the compute time your Lambdas use, and for S3 storage/requests, rather than for always-on servers.
-Simplified operations: You rely on AWS to maintain the underlying infrastructure, OS updates, patching, HA, etc. so your team can focus on building features.

Example Flow:
-CloudWatch Logs collects application logs.
-EventBridge rule fires every hour, invoking Lambda export-logs.
-Lambda calls filterLogEvents(), writes a logs/<logGroup>/<timestamp>.json file into S3.
-An AWS Glue job (Spark or Python shell) is triggered or scheduled, reads S3 files, parses them into a tabular schema, and loads that into Snowflake.
-Next.js UI calls a Lambda/API Gateway or directly queries Snowflake to allow users to search and filter logs.

This pattern avoids any self-hosted log servers (like ELK or a managed Elasticsearch cluster) and leverages AWS’s fully managed, pay-as-you-go services end-to-end.

## Modules

- **infra**: Terraform code to provision S3 buckets and IAM resources.
- **lambdas/log_export**: Node.js Lambda to export CloudWatch Logs to S3.
- **etl**: AWS Glue Python job to parse logs from S3 and load into Snowflake.
- **ui**: Next.js application displaying log search UI.

## Setup

### 1. Infrastructure
```bash
cd infra
terraform init
terraform apply -auto-approve
```

### 2. Lambda
```bash
cd lambdas/log_export
zip -r log_export.zip *
```
- Create a Lambda function (Node.js 14.x), handler `index.handler`, role ARN from Terraform.
- Upload `log_export.zip`.
- Configure environment variables:  
  `RAW_BUCKET_NAME=<raw bucket>`,  
  `LOG_GROUP_NAME=<log group>`  
- Create a CloudWatch EventBridge rule to trigger every hour for this Lambda.

### 3. ETL (AWS Glue)
- Upload `glue_job.py` to a Glue Python Shell job.
- Assign IAM role from Terraform outputs.
- Configure job args: `--JOB_NAME`, and set environment variables or script options for Snowflake credentials.

### 4. UI
```bash
cd ui
npm install
npm run dev
```
- Copy `.env.local.example` to `.env.local` and fill in Snowflake credentials.
- Access at http://localhost:3000
