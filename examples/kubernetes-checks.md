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
