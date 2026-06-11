# Boss Factory API Reference

> Last updated: 2026-05-14 | Version: v1.0.0

Complete reference for all REST API endpoints in Boss Factory. All endpoints except those explicitly marked require JWT authentication via Supabase session cookie.

---

## Table of Contents

| # | Endpoint | Method | Auth Required | Description |
|---|----------|--------|---------------|-------------|
| 1 | `/api/analyze-idea` | POST | ✅ | Analyze a business idea using Groq AI |
| 2 | `/api/admin/sync-secrets` | POST | ✅ (Admin) | Sync encrypted GitHub/Vercel secrets |
| 3 | `/api/dashboard/stats` | GET | ✅ | Get aggregated dashboard metrics |
| 4 | `/api/deploy-venture` | POST | ✅ | Trigger Vercel deployment |
| 5 | `/api/ventures` | GET | ✅ | List ventures with filtering |
| 6 | `/api/ventures` | POST | ✅ | Create a new venture |
| 7 | `/api/templates` | GET | ✅ | Get template(s) by ID or list all |

---

## Authentication

All authenticated endpoints use Supabase JWT sessions passed as cookies. The middleware (`middleware.ts`) automatically attaches `X-User-Id`, `X-JWT-Token`, `X-Email`, and `X-Auth-Status` headers to API requests.

**Token extraction:** API routes extract user ID via `supabase.auth.getUser(req)` which reads the session cookie.

**Admin check:** Admin verification happens at the endpoint level (currently checks against hardcoded email comparison).

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/analyze-idea` | 10 requests | per minute |
| `/api/admin/sync-secrets` | 5 requests | per minute |
| `/api/deploy-venture` | 3 requests | per hour |
| All others | No limit (authenticated) | — |

*Note: Rate limits are currently implemented as soft guards. Production deployment should add middleware-level rate limiting.*

---

## Endpoints

### 1. Analyze Idea

Submit a business idea for AI analysis powered by Groq.

- **URL:** `/api/analyze-idea`
- **Method:** `POST`
- **Auth:** Required (any logged-in user)
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "idea_name": "string (required, 3-100 chars)",
  "description": "string (required, 10-2000 chars)",
  "category": "string (optional, default 'miscellaneous')",
  "industry_tags": ["string"] (optional)
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "user_id": "auth-uuid",
    "idea_name": "AI-Powered Recipe Generator",
    "description": "...",
    "category": "food-tech",
    "ai_analysis": {
      "market_potential": "High",
      "complexity": "Medium",
      "monetization_score": 8.5,
      "competitive_landscape": "...",
      "recommendations": ["..."],
      "swot_summary": "...",
      "target_audience": "...",
      "tech_requirements": ["Next.js", "Supabase", "Groq SDK"]
    },
    "scores": {
      "viability_score": 85,
      "innovation_score": 72,
      "market_readiness": 78
    },
    "trending_keywords": ["AI", "recipes", "food-tech"],
    "deployment_suitability": "high",
    "created_at": "2026-05-14T12:00:00Z"
  }
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 400 | `{ "error": "Missing required fields..." }` | Missing `idea_name` or `description` |
| 400 | `{ "error": "Invalid category..." }` | Category not in allowed list |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 403 | `{ "error": "Daily idea limit reached (5/5)" }` | Exceeded daily quota |
| 500 | `{ "error": "Analysis failed...", "details": "..." }` | Groq API failure or DB error |

---

### 2. Sync Secrets (Admin Only)

Sync and store encrypted credentials for GitHub and Vercel integrations.

- **URL:** `/api/admin/sync-secrets`
- **Method:** `POST`
- **Auth:** Required + Admin role
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "github_token": "ghp_xxxxxxxxxxxx",
  "vercel_token": "vtok_xxxxxxxxxxxx",
  "encryption_key": "optional custom key (min 32 chars)"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Secrets synced successfully",
  "synced_secrets": ["github_token", "vercel_token"],
  "timestamp": "2026-05-14T12:00:00Z"
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 401 | `{ "error": "Unauthorized" }` | Not logged in |
| 403 | `{ "error": "Forbidden: Admin access required" }` | Logged in but not admin |
| 400 | `{ "error": "Both github_token and vercel_token are missing..." }` | Empty payload |
| 400 | `{ "error": "Encryption key must be at least 32 characters" }` | Invalid encryption key |
| 500 | `{ "error": "Secret sync failed..." }` | Database insert/update failure |

---

### 3. Dashboard Stats

Aggregate metrics displayed on the main dashboard.

- **URL:** `/api/dashboard/stats`
- **Method:** `GET`
- **Auth:** Required
- **Cache:** None (real-time)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "users_count": 142,
    "ventures_count": 38,
    "templates_count": 12,
    "total_analyses": 256,
    "active_ventures": 24,
    "deployed_ventures": 18,
    "brain_dumps_total": 89
  }
}
```

#### Field Descriptions

| Field | Source Table | Notes |
|-------|-------------|-------|
| `users_count` | `user_dashboards` | Count of distinct registered users |
| `ventures_count` | `ventures` + `ventures_v2` | Total ventures created |
| `templates_count` | `templates` | Available blueprint templates |
| `total_analyses` | `brain_dumps` | Total ideas analyzed |
| `active_ventures` | `ventures` | Count where status = 'active' or 'in_progress' |
| `deployed_ventures` | `ventures` | Count where status = 'deployed' or 'live' |
| `brain_dumps_total` | `brain_dumps` | Total entries in brain dump database |

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 500 | `{ "error": "Stats retrieval failed..." }` | Database query failure |

---

### 4. Deploy Venture

Trigger a Vercel deployment for an existing venture.

- **URL:** `/api/deploy-venture`
- **Method:** `POST`
- **Auth:** Required
- **Rate Limit:** 3 requests/hour

#### Request Body

```json
{
  "venture_id": "uuid-string (required)",
  "branch": "main (optional, default 'main')"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Deployment initiated",
  "deployment": {
    "id": "deploy-abc123",
    "url": "https://venture-name.vercel.app",
    "status": "building",
    "initiated_at": "2026-05-14T12:00:00Z"
  }
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 400 | `{ "error": "Venture ID is required" }` | Missing venture_id |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Venture not found" }` | Invalid venture_id |
| 500 | `{ "error": "Deployment failed..." }` | Vercel/GitHub API failure |

---

### 5. List Ventures

Retrieve ventures with optional filtering.

- **URL:** `/api/ventures`
- **Method:** `GET`
- **Auth:** Required

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | — | Filter by name/description |
| `status` | string | No | — | Filter by status (active, deployed, archived, etc.) |
| `owner_id` | string | No | — | Filter by specific user |
| `limit` | number | No | 50 | Max results |
| `offset` | number | No | 0 | Pagination offset |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "venture-uuid",
      "name": "AI Recipe App",
      "description": "Smart recipe generator",
      "status": "active",
      "user_id": "user-uuid",
      "repository_url": "https://github.com/user/ai-recipe-app",
      "demo_url": "https://ai-recipe-app.vercel.app",
      "created_at": "2026-05-14T12:00:00Z"
    }
  ],
  "total": 38,
  "page": 1,
  "has_more": true
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 500 | `{ "error": "Failed to fetch ventures..." }` | Database query failure |

---

### 6. Create Venture

Create a new venture record.

- **URL:** `/api/ventures`
- **Method:** `POST`
- **Auth:** Required
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "name": "string (required, 3-100 chars)",
  "description": "string (required, 10-500 chars)",
  "template_id": "string (optional)",
  "category": "string (optional, default 'web-app')"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "new-venture-uuid",
    "name": "AI Recipe App",
    "description": "Smart recipe generator",
    "status": "initialized",
    "user_id": "user-uuid",
    "template_id": "template-xyz",
    "created_at": "2026-05-14T12:00:00Z"
  }
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 400 | `{ "error": "Name is required..." }` | Missing/invalid name |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 409 | `{ "error": "Venture with this name already exists" }` | Duplicate name |
| 500 | `{ "error": "Failed to create venture..." }` | Database insert failure |

---

### 7. Get Template(s)

Retrieve one or all venture templates.

- **URL:** `/api/templates`
- **Method:** `GET`
- **Auth:** Required

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | No | — | Get single template by ID |

#### Single Template Response (with `?id=xyz`)

```json
{
  "success": true,
  "data": {
    "id": "template-xyz",
    "category": "saas",
    "name": "SaaS Starter",
    "description": "Full-stack SaaS template",
    "tech_stack": ["Next.js", "Supabase", "Stripe", "TailwindCSS"],
    "features": ["Auth", "Payments", "Dashboard", "API Routes"],
    "repo_url": "https://github.com/boss-factory/templates/tree/main/saas-starter",
    "demo_url": "https://saas-starter-demo.vercel.app",
    "version": "1.0.0",
    "file_structure": ["src/app/", "src/components/", "supabase/"],
    "estimated_deploy_time": "15 min"
  }
}
```

#### List All Templates Response (without `?id=`)

```json
{
  "success": true,
  "data": [
    /* array of template objects */
  ],
  "total": 12
}
```

#### Error Responses

| Status | Body | Scenario |
|--------|------|----------|
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Template not found" }` | Invalid `id` parameter |
| 500 | `{ "error": "Failed to fetch templates..." }` | Database query failure |

---

## Data Models (Used in Requests/Responses)

### BrainDump (from analyze-idea response)

```typescript
interface BrainDump {
  id: string;
  user_id: string;
  idea_name: string;
  description: string;
  category: string;
  ai_analysis: {
    market_potential: string;
    complexity: string;
    monetization_score: number;
    competitive_landscape: string;
    recommendations: string[];
    swot_summary: string;
    target_audience: string;
    tech_requirements: string[];
  };
  scores: {
    viability_score: number;
    innovation_score: number;
    market_readiness: number;
  };
  trending_keywords: string[];
  deployment_suitability: string;
  created_at: string;
}
```

### Venture

```typescript
interface Venture {
  id: string;
  name: string;
  description: string;
  status: "initialized" | "active" | "deploying" | "deployed" | "archived" | "failed";
  user_id: string;
  template_id?: string;
  category?: string;
  repository_url?: string;
  demo_url?: string;
  deployment_config?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}
```

### Template

```typescript
interface Template {
  id: string;
  category: string;
  name: string;
  description: string;
  tech_stack: string[];
  features: string[];
  repo_url: string;
  demo_url: string;
  version: string;
  file_structure?: string[];
  estimated_deploy_time?: string;
}
```

---

## Error Code Reference

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Standard response |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Validate request body/schema |
| 401 | Unauthorized | Check session/auth cookie |
| 403 | Forbidden | Verify admin role or permissions |
| 404 | Not Found | Check resource ID exists |
| 409 | Conflict | Duplicate resource (e.g., name collision) |
| 429 | Too Many Requests | Wait and retry (check rate limits above) |
| 500 | Internal Server Error | Check server logs; if persistent, contact support |

---

## Webhooks (Future)

Planned webhook endpoints for deployment events:

| URL | Method | Event | Payload |
|-----|--------|-------|---------|
| `/webhooks/github` | POST | Push to venture repo | GitHub push event |
| `/webhooks/vercel` | POST | Deployment complete | Vercel deploy event |
| `/webhooks/stripe` | POST | Payment events | Stripe webhook event |

*Not yet implemented. Coming in v2.0.*
