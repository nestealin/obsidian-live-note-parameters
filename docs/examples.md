# Example notebooks

[README](../README.md) · [中文案例](examples.zh-CN.md)

These complete Markdown notes use synthetic values. Copy a note into Obsidian, enable Live Note Parameters and switch to Live Preview or Reading. Merge `doc_vars` into the existing frontmatter when adapting an existing note.

The resolved commands below illustrate the text available to copy; they are not execution results. The HTTP endpoint is illustrative. Review values and quoting before running a command yourself.

## 1. Cloud runbook

[Open the reusable source](../examples/cloud-runbook.md). Set `PROJECT_ID` to `atlas-staging` and `REGION` to `europe-west1`. The project in the paragraph and both interactive commands changes together. The fixed reference stays at `example-project` / `asia-east1`.

### Complete note

````markdown
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
````

### Resolved commands

```bash
gcloud compute backend-services list \
  --project="atlas-staging" \
  --regions="europe-west1"

gcloud compute forwarding-rules list \
  --project="atlas-staging" \
  --regions="europe-west1"
```

## 2. Kubernetes checks

[Open the reusable source](../examples/kubernetes-checks.md). Set `CONTEXT` to `ops-staging`, `NAMESPACE` to `payments`, and `APP` to `payments`. Keep context and namespace as separate parameters so the same notebook works across clusters and namespaces.

### Complete note

````markdown
---
title: Kubernetes namespace checks
doc_vars:
  CONTEXT: "demo-cluster"
  NAMESPACE: "default"
  APP: "payments"
---

# Kubernetes namespace checks

Context: {{CONTEXT}} · Namespace: {{NAMESPACE}} · App label: {{APP}}

## List matching pods

```bash docvars
kubectl --context="{{CONTEXT}}" --namespace="{{NAMESPACE}}" \
  get pods --selector="app={{APP}}" -o wide
```

## Inspect events in the same namespace

```bash docvars
kubectl --context="{{CONTEXT}}" --namespace="{{NAMESPACE}}" \
  get events --sort-by=.metadata.creationTimestamp
```

## Fixed reference

```bash
kubectl --context="example-cluster" --namespace="staging" \
  get pods --selector="app=example-app" -o wide
```
````

### Resolved commands

```bash
kubectl --context="ops-staging" --namespace="payments" \
  get pods --selector="app=payments" -o wide

kubectl --context="ops-staging" --namespace="payments" \
  get events --sort-by=.metadata.creationTimestamp
```

## 3. HTTP request notebook

[Open the reusable source](../examples/http-request.md). Set `BASE_URL` to `https://staging-api.example.com`, `RESOURCE_ID` to `1042`, and `REQUEST_ID` to `demo-request-042`. The inline endpoint becomes `https://staging-api.example.com/v1/widgets/1042`; the request block uses the same endpoint.

### Complete note

````markdown
---
title: HTTP request notebook
doc_vars:
  BASE_URL: "https://api.example.com"
  RESOURCE_ID: "42"
  REQUEST_ID: "demo-request-001"
---

# HTTP request notebook

Base URL: {{BASE_URL}} · Resource: {{RESOURCE_ID}}

Endpoint: `{{BASE_URL}}/v1/widgets/{{RESOURCE_ID}}`

```bash docvars
curl --request GET \
  --header "X-Request-ID: {{REQUEST_ID}}" \
  "{{BASE_URL}}/v1/widgets/{{RESOURCE_ID}}"
```

## Fixed reference

```bash
curl --request GET "https://api.example.com/v1/widgets/42"
```

The domain and endpoint above are illustrative. This note does not make requests automatically.
````

### Resolved commands

```bash
curl --request GET \
  --header "X-Request-ID: demo-request-042" \
  "https://staging-api.example.com/v1/widgets/1042"
```
