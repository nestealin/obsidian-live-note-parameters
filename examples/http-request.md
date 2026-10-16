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
