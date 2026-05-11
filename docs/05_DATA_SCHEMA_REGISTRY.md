# 05_DATA_SCHEMA_REGISTRY

**Status:** ✅ **IMPLEMENTED**  
**Version:** 2.0 (Production Ready)  
**Owner:** The Sole CEO

## 1. Overview
This document defines the complete database schema for the Boss Factory ecosystem, including all tables, relationships, and security policies.

## 2. Core Database Schema

### 2.1 User Management Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  company TEXT,
  role TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Core Business Tables

#### `brain_dumps`
```sql
CREATE TABLE brain_dumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idea_text TEXT NOT NULL,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_verdict TEXT CHECK (ai_verdict IN ('GO', 'NO GO')),
  ai_category TEXT CHECK (ai_category IN ('SaaS', 'Content', 'E-commerce', 'Service')),
  ai_tags TEXT[],
  ai_reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'deployed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ventures`
```sql
CREATE TABLE ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brain_dump_id UUID REFERENCES brain_dumps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_id TEXT,
  github_repo_url TEXT,
  vercel_url TEXT,
  status TEXT DEFAULT 'building' CHECK (status IN ('building', 'deployed', 'failed', 'archived')),
  revenue DECIMAL(10,2) DEFAULT 0.00,
  costs DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Security & Secrets Tables

#### `system_secrets`
```sql
CREATE TABLE system_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL, -- Encrypted value
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'rotated')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `api_keys`
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  permissions TEXT[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.4 Analytics & Monitoring Tables

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `system_metrics`
```sql
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4),
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.5 Template Gallery Tables

#### `venture_templates`
```sql
CREATE TABLE venture_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  github_repo TEXT,
  demo_url TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_cost DECIMAL(10,2),
  revenue_potential DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT FALSE,
  deployment_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Security Policies (RLS)

### 3.1 User Data Access
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own brain dumps" ON brain_dumps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain dumps" ON brain_dumps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain dumps" ON brain_dumps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brain dumps" ON brain_dumps
  FOR DELETE USING (auth.uid() = user_id);
```

### 3.2 System Secrets Protection
```sql
-- Only authenticated users can view system secrets
CREATE POLICY "Authenticated users can view system secrets" ON system_secrets
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify system secrets
CREATE POLICY "Service role can manage system secrets" ON system_secrets
  FOR ALL USING (auth.role() = 'service_role');
```

## 4. Indexes for Performance

```sql
-- Brain dumps indexes
CREATE INDEX idx_brain_dumps_user_id ON brain_dumps(user_id);
CREATE INDEX idx_brain_dumps_status ON brain_dumps(status);
CREATE INDEX idx_brain_dumps_created_at ON brain_dumps(created_at DESC);
CREATE INDEX idx_brain_dumps_ai_score ON brain_dumps(ai_score DESC);

-- Ventures indexes
CREATE INDEX idx_ventures_user_id ON ventures(user_id);
CREATE INDEX idx_ventures_status ON ventures(status);
CREATE INDEX idx_ventures_created_at ON ventures(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- System metrics indexes
CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);
```

## 5. Database Functions

### 5.1 Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 5.2 Apply to Tables
```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brain_dumps_updated_at BEFORE UPDATE ON brain_dumps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventures_updated_at BEFORE UPDATE ON ventures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 6. Implementation Status
- [x] Logic Defined
- [x] Specs Written
- [x] Code Implemented
- [x] Tested

## 7. Migration Scripts

### 7.1 Initial Setup
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Run all CREATE TABLE statements above
-- Run all CREATE INDEX statements above
-- Run all CREATE POLICY statements above
-- Run all CREATE TRIGGER statements above
```

---
*Part of the Boss Factory Genesis Protocol. Do not delete.*
