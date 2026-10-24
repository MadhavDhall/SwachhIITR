# WasteOS — AWS Cloud Architecture & Deployment Guide

This document specifies the AWS production cloud architecture for WasteOS, detailing how IoT Core, DynamoDB, S3, Cognito, and ECS Fargate integrate seamlessly.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   ESP32 Smart Bin Nodes     |
                      +--------------+--------------+
                                     | MQTT / TLS (X.509)
                                     v
                      +-----------------------------+
                      |      AWS IoT Core           |
                      +--------------+--------------+
                                     | IoT SQL Rule: SELECT * FROM 'wasteos/sensors/+/data'
                                     v
                      +-----------------------------+
                      |     AWS Lambda Telemetry    |
                      +--------------+--------------+
                                     | Batch write & threshold alert checks
                                     v
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
    +------------------------+              +------------------------+
    |    Amazon DynamoDB     |              |     Amazon SNS / SES   |
    | (Single-Table Design)  |              |  (Operator Alert Push) |
    +------------------------+              +------------------------+
                 ^
                 | Read & dispatch queries
                 v
+------------------------------------+      +------------------------------------+
| Next.js App Router (Vercel / ECS)  |<---->|   Python FastAPI (ECS Fargate)     |
| - Command Center & BinSync Map     |      |   - Ultralytics YOLOv8 Inference   |
| - Waste Ledger & Verification      |      |   - Google OR-Tools VRP Solver     |
+------------------------------------+      +------------------------------------+
                 |                                       |
                 +-------------------+-------------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Amazon S3 Bucket        |
                      | (WasteDNA Imagery + KMS SSE)|
                      +-----------------------------+
```

---

## 2. Component Specifications

### 1. AWS IoT Core
- **Device Authentication**: X.509 Mutual TLS Client Certificates provisioned per ESP32 hardware device.
- **IoT SQL Rule**:
  ```sql
  SELECT *, topic(3) as bin_id, timestamp() as ingested_at
  FROM 'wasteos/sensors/+/data'
  ```
- **Rule Action**: Ingest directly into DynamoDB or trigger Lambda evaluation.

### 2. Amazon DynamoDB (Single-Table Design)
- **Table Name**: `wasteos_production`
- **Billing Mode**: On-Demand (PAY_PER_REQUEST)
- **Primary Keys**:
  - `PK` (Partition Key): String (`BIN#<bin_id>`, `SCAN#<scan_id>`, `ROUTE#<route_id>`)
  - `SK` (Sort Key): String (`METADATA`, `READING#<iso_timestamp>`, `STOP#<order>`)
- **Global Secondary Indexes (GSI)**:
  - `GSI1PK`: `ZONE#<zone_name>`, `GSI1SK`: `FILL#<fill_pct>` (allows querying highest fill bins in a zone in descending order).

### 3. Amazon S3 Storage
- **Bucket**: `s3://wasteos-scans-production`
- **Security**: Block All Public Access enabled, KMS Server-Side Encryption (`aws:kms`).
- **Presigned Upload Flow**: Frontend requests a short-lived presigned PUT URL from Next.js server; the browser uploads the image directly to S3 without passing bytes through the application server.
- **Lifecycle Rule**: Move raw imagery older than 90 days to S3 Glacier Flexible Retrieval.

### 4. Amazon Cognito
- **User Pool**: Configured with roles (`Admin`, `Operator`, `Driver`).
- **JWT Verification**: Next.js middleware and FastAPI routers validate standard Cognito ID tokens.

### 5. Python AI Microservice on AWS ECS Fargate
- Deployed as a containerized Fargate task behind an Application Load Balancer (ALB).
- Task CPU: 2 vCPU, 4GB Memory.
- Health Check: `GET /health`.
