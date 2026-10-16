# 配置案例与代入效果

[返回 README](../README.zh-CN.md) · [English](examples.md)

下面均为完整 Markdown 笔记和虚构数据。复制到 Obsidian、启用插件并切换实时预览或阅读模式即可填写。改造现有笔记时，将 `doc_vars` 合并到已有 Frontmatter。

“代入后”展示的是可复制的命令文本，不是执行结果；HTTP 接口为示意地址。执行命令前自行核对当前值与引号。

## 1. 云环境操作手册

[可复用笔记源文件](../examples/cloud-runbook.md)。将 `PROJECT_ID` 填为 `atlas-staging`，`REGION` 填为 `europe-west1`。正文与两段交互命令一起变化，固定示例仍为 `example-project` / `asia-east1`。

### 完整配置

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

### 代入后

```bash
gcloud compute backend-services list \
  --project="atlas-staging" \
  --regions="europe-west1"

gcloud compute forwarding-rules list \
  --project="atlas-staging" \
  --regions="europe-west1"
```

## 2. Kubernetes 命名空间检查

[可复用笔记源文件](../examples/kubernetes-checks.md)。将 `CONTEXT` 填为 `ops-staging`，`NAMESPACE` 和 `APP` 填为 `payments`。Context 与 Namespace 分别定义，便于将同一笔记用于不同集群和命名空间。

### 完整配置

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

### 代入后

```bash
kubectl --context="ops-staging" --namespace="payments" \
  get pods --selector="app=payments" -o wide

kubectl --context="ops-staging" --namespace="payments" \
  get events --sort-by=.metadata.creationTimestamp
```

## 3. HTTP 请求笔记

[可复用笔记源文件](../examples/http-request.md)。将 `BASE_URL` 填为 `https://staging-api.example.com`、`RESOURCE_ID` 填为 `1042`、`REQUEST_ID` 填为 `demo-request-042`。行内接口地址同步变为 `https://staging-api.example.com/v1/widgets/1042`，请求代码块使用相同地址。

### 完整配置

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

### 代入后

```bash
curl --request GET \
  --header "X-Request-ID: demo-request-042" \
  "https://staging-api.example.com/v1/widgets/1042"
```
