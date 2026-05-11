-- Boss Factory Initial Database Schema
-- Version: 1.0
-- Created: 2025-01-11

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
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

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- Brain dumps table for idea capture
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

-- Ventures table for deployed projects
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

-- ============================================================================
-- SECURITY & SECRETS TABLES
-- ============================================================================

-- System secrets table for encrypted API keys
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

-- User API keys table
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

-- ============================================================================
-- ANALYTICS & MONITORING TABLES
-- ============================================================================

-- Audit logs table for compliance
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

-- System metrics table
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4),
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TEMPLATE GALLERY TABLES
-- ============================================================================

-- Venture templates table
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

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

-- Users indexes
CREATE INDEX idx_users_email ON users(email);

-- System secrets indexes
CREATE INDEX idx_system_secrets_name ON system_secrets(name);
CREATE INDEX idx_system_secrets_status ON system_secrets(status);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_service_name ON api_keys(service_name);
CREATE INDEX idx_api_keys_status ON api_keys(status);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply update timestamp triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brain_dumps_updated_at BEFORE UPDATE ON brain_dumps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventures_updated_at BEFORE UPDATE ON ventures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_secrets_updated_at BEFORE UPDATE ON system_secrets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venture_templates_updated_at BEFORE UPDATE ON venture_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile details" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Brain dumps policies
CREATE POLICY "Users can view own brain dumps" ON brain_dumps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain dumps" ON brain_dumps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain dumps" ON brain_dumps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brain dumps" ON brain_dumps
  FOR DELETE USING (auth.uid() = user_id);

-- Ventures policies
CREATE POLICY "Users can view own ventures" ON ventures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ventures" ON ventures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ventures" ON ventures
  FOR UPDATE USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- System secrets policies (more restrictive)
CREATE POLICY "Authenticated users can view system secrets" ON system_secrets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system secrets" ON system_secrets
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default venture templates
INSERT INTO venture_templates (name, description, category, tags, github_repo, demo_url, difficulty_level, estimated_cost, revenue_potential, is_featured) VALUES
('SaaS Landing Page', 'Modern landing page template for SaaS products', 'SaaS', ARRAY['landing', 'saas', 'marketing'], 'https://github.com/boss-factory/saas-landing', 'https://saas-landing-demo.vercel.app', 1, 0.00, 500.00, true),
('E-commerce Store', 'Full-featured e-commerce store with payment integration', 'E-commerce', ARRAY['ecommerce', 'shopify', 'payments'], 'https://github.com/boss-factory/ecommerce-store', 'https://ecommerce-demo.vercel.app', 3, 50.00, 2000.00, true),
('Content Blog', 'SEO-optimized blog with monetization features', 'Content', ARRAY['blog', 'seo', 'content'], 'https://github.com/boss-factory/content-blog', 'https://blog-demo.vercel.app', 2, 20.00, 1000.00, true),
('Service Booking', 'Appointment booking system for service businesses', 'Service', ARRAY['booking', 'calendar', 'service'], 'https://github.com/boss-factory/service-booking', 'https://booking-demo.vercel.app', 3, 30.00, 1500.00, false),
('SaaS Dashboard', 'Analytics dashboard for SaaS metrics', 'SaaS', ARRAY['dashboard', 'analytics', 'saas'], 'https://github.com/boss-factory/saas-dashboard', 'https://dashboard-demo.vercel.app', 4, 100.00, 3000.00, false);

-- Insert default system secrets (encrypted values should be properly encrypted in production)
INSERT INTO system_secrets (name, value, description, status) VALUES
('GROQ_API_KEY', 'encrypted_placeholder', 'Groq Cloud API key for AI processing', 'active'),
('SUPABASE_SERVICE_ROLE_KEY', 'encrypted_placeholder', 'Supabase service role key for admin operations', 'active'),
('GITHUB_TOKEN', 'encrypted_placeholder', 'GitHub personal access token for repository management', 'active'),
('VERCEL_TOKEN', 'encrypted_placeholder', 'Vercel API token for deployment automation', 'active');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User dashboard summary view
CREATE VIEW user_dashboard_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  COUNT(DISTINCT bd.id) as total_ideas,
  COUNT(DISTINCT CASE WHEN bd.ai_verdict = 'GO' THEN bd.id END) as approved_ideas,
  COUNT(DISTINCT v.id) as total_ventures,
  COUNT(DISTINCT CASE WHEN v.status = 'deployed' THEN v.id END) as active_ventures,
  COALESCE(SUM(v.revenue), 0) as total_revenue,
  COALESCE(SUM(v.costs), 0) as total_costs
FROM users u
LEFT JOIN brain_dumps bd ON u.id = bd.user_id
LEFT JOIN ventures v ON u.id = v.user_id
GROUP BY u.id, u.email, u.full_name;

-- Template popularity view
CREATE VIEW template_popularity AS
SELECT 
  vt.id,
  vt.name,
  vt.category,
  vt.deployment_count,
  vt.success_rate,
  COUNT(v.id) as actual_deployments,
  AVG(v.revenue) as avg_revenue,
  AVG(v.costs) as avg_costs
FROM venture_templates vt
LEFT JOIN ventures v ON vt.id::TEXT = v.template_id
GROUP BY vt.id, vt.name, vt.category, vt.deployment_count, vt.success_rate;

COMMIT;
