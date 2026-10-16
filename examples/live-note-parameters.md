---
title: Live Note Parameters MVP
doc_vars:
  PROJECT_ID: "demo-project"
  REGION: "us-central1"
  NAMESPACE: "default"
---

# Live Note Parameters

当前项目：{{PROJECT_ID}}；区域：{{REGION}}。

行内命令：`gcloud --project="{{PROJECT_ID}}" --region="{{REGION}}"`。

普通行内代码：`ordinary-inline-code`。

## 语法

```bash docvars
gcloud compute backend-services list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

## 固定示例

```bash
gcloud compute backend-services list --project="example-project"
```

## 同页同步

```bash docvars
printf 'project=%s region=%s' "{{PROJECT_ID}}" "{{REGION}}"
kubectl --context="{{PROJECT_ID}}" --namespace="{{NAMESPACE}}" get pods
```
