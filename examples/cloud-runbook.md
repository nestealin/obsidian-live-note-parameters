---
title: Cloud service lookup
doc_vars:
  PROJECT_ID: "demo-project"
  REGION: "us-central1"
---

# Cloud service lookup

Project: {{PROJECT_ID}} · Region: {{REGION}}

Edit any purple field. Both commands update in this tab.

## Backend services

```bash docvars
gcloud compute backend-services list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

## Forwarding rules

```bash docvars
gcloud compute forwarding-rules list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

## Fixed reference

```bash
gcloud compute backend-services list \
  --project="example-project" \
  --regions="asia-east1"
```
