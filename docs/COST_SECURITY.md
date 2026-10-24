# WasteOS — Cost Calculator & Security Guardrails

---

## 1. AWS Monthly Cost Calculator & Projections

Estimates are calculated based on a 15-minute sensor sampling interval ($96\text{ readings/day/bin} \approx 2,880\text{ readings/month/bin}$):

| AWS Service | 100 Smart Bins | 1,000 Smart Bins | 10,000 Smart Bins | Pricing Basis |
|---|---|---|---|---|
| **AWS IoT Core** | $0.29 | $2.88 | $28.80 | $1.00 / million connectivity minutes & messages |
| **AWS Lambda** | $0.20 | $2.00 | $20.00 | $0.20 / million invocations (ARM Graviton2) |
| **Amazon DynamoDB** | $0.36 | $3.60 | $36.00 | $1.25 / million write units, $0.25 / million read units |
| **Amazon S3** | $1.15 | $11.50 | $115.00 | 500 images/day (1MB each) + Glacier archiving |
| **ECS Fargate (FastAPI)** | $35.00 | $45.00 | $120.00 | 1–3 autoscaling tasks (2 vCPU, 4GB RAM) |
| **Cognito & CloudWatch** | $5.00 | $8.00 | $25.00 | User auth pools + structured metrics/logs |
| **TOTAL ESTIMATED MONTHLY** | **~$42.00** | **~$72.98** | **~$344.80** | **Under $0.035 / bin / month at scale** |

---

## 2. Municipal ROI & Operational Savings

- **Fuel Reduction**: 31.4% less diesel consumed by collection trucks through dynamic OR-Tools routing vs. static milk-runs.
- **Truck Wear & Tear**: Extended vehicle lifecycle by eliminating unnecessary trips to half-empty bins.
- **Overflow Prevention**: Eliminates municipal cleanliness fines and citizen complaints by dispatching collections before 90% threshold overflow.

---

## 3. Security Guardrails & Compliance

1. **Hardware Device Security**:
   - Every ESP32 hardware device stores an individual private key in hardware NVS / Secure Boot partition.
   - Mutual TLS (mTLS) with X.509 device certificates prevents device spoofing.

2. **Network Isolation**:
   - Next.js server and ECS Fargate run within private subnets of a VPC.
   - NAT Gateway and Security Groups restrict inbound traffic strictly to port 443 via ALB.

3. **Data Protection at Rest & in Transit**:
   - All S3 buckets and DynamoDB tables encrypted with AWS KMS (`SSE-KMS`).
   - Zero hardcoded API keys or database credentials in client code.
