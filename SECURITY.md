# Security Policy - ArenaFlow AI

This document provides a comprehensive overview of the deliberate security posture, architectural decisions, and safeguards implemented in ArenaFlow AI to protect the system and its users.

## 1. Multi-layered Security Controls

### A. API Key & Secret Protection
- **Zero Key Leaks**: No API credentials, tokens, or private endpoints are ever committed or exposed to the client-side bundle.
- **Server-Side Proxy Architecture**: All communication with the Google Gemini API occurs exclusively on the Node.js/Express backend server (`/api/*`). The browser never sees or interacts directly with the Google Gemini SDK or its credentials.
- **Environment Separation**: Secrets are injected strictly via container or server environment variables (`GEMINI_API_KEY`), which are never embedded or logged.

### B. Rate Limiting Coverage
- To prevent denial-of-service (DoS) attacks and curb potential Gemini API token abuse/runaway costs, **IP-based in-memory rate limiting** is applied to all state-mutation and AI-invoking routes:
  - `POST /api/update-density` (Limited to 30 requests/min)
  - `POST /api/risk-assessment` (Limited to 30 requests/min)
  - `POST /api/fan-chat` (Limited to 30 requests/min)
  - `POST /api/trigger-incident` (Limited to 30 requests/min)
  - `POST /api/reset` (Limited to 30 requests/min)
- Exceeding the rate limits returns a standard `429 Too Many Requests` error with a secure, clear explanation.

### C. Restrictive CORS Policies
- Explicitly configured CORS filters reject wildcard (`*`) requests.
- Validated origin rules are locked down to secure localhost ports (`http://localhost:3000`, `http://localhost:5173`, etc.) and designated production deployments (`https://arenaflow-ai.vercel.app` and matching Vercel domains).

### D. Strict Input Validation & Sanitization
- All incoming payloads are subject to rigorous server-side validation:
  - **Type constraints**: Ensuring parameters like `density` are typed strictly as numbers, and `zoneId` as strings.
  - **Value boundary limits**: Restricting crowd density exclusively to `0 - 100`.
  - **White-listed parameters**: Matching inputs against structured values (e.g., verifying `zoneId` belongs to `VALID_ZONES` and `severity` belongs to `INFO`, `WARNING`, or `CRITICAL`).
  - **Length boundaries**: Capping the maximum allowable character length for fan messages (`1000` chars) and incident descriptions (`500` chars).
  - **HTML Entity Escaping**: Utilizing a custom sanitizer on user-supplied strings to neutralize Cross-Site Scripting (XSS) and injection vulnerabilities before storage or transmission.

### E. Malformed JSON Rejection
- An Express middleware is mounted to intercept parsing failures of client payloads, intercepting malformed JSON structures and responding with a structured `400 Malformed JSON payload` instead of triggering server-side exceptions or unhandled stack dumps.

### F. HTTP Security Headers
The server enforces a highly secure set of browser-facing response headers:
- `X-Content-Type-Options: nosniff`: Prevents browsers from MIME-sniffing away from declared content types.
- `X-Frame-Options: DENY`: Mitigates clickjacking attacks.
- `X-XSS-Protection: 1; mode=block`: Re-enforces active XSS filters in legacy browsers.
- `Referrer-Policy: strict-origin-when-cross-origin`: Limits referrer data leakage.
- `Content-Security-Policy`: A structured CSP restricting script, style, connection, and image source domains to only self and authorized APIs/fonts, preventing rogue script injections.

### G. Error Response Sanitization & Safe Defaults
- Catch blocks across the routing layer intercept system-thrown errors.
- In production (`NODE_ENV === "production"`), raw system messages, stack traces, and internal file paths are replaced with a secure high-level fallback string (e.g., `AI Risk Engine assessment failed` or `Fan assistant failed`) to eliminate information disclosure vulnerabilities.

---

## 2. Dependency Vulnerability Analysis
- The codebase relies on minimal, highly-vetted packages to lower the potential attack surface.
- All transitive dependencies are periodically monitored and updated.

## 3. Reporting Vulnerabilities
If you identify any security issue, please contact safety-operations@arenaflow.ai instead of filing public issues on GitHub.
