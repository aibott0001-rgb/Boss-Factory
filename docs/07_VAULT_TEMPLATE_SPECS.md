# 07_VAULT_TEMPLATE_SPECS.md

## Template Structure (JSON)
{
  "id": "tmpl_001",
  "name": "Niche Crypto News Hub",
  "category": "Affiliate Content",
  "stack": ["Next.js", "Tailwind", "CoinGecko API"],
  "steps": [
    {"action": "clone_repo", "source": "github.com/boss-factory/templates/crypto"},
    {"action": "inject_env", "keys": ["COINGECKO_API_KEY"]},
    {"action": "deploy", "target": "vercel"},
    {"action": "seed_content", "agent": "ContentAgent", "count": 50}
  ],
  "monetization": ["Affiliate Links", "AdSense"],
  "estimated_setup": "4 minutes",
  "projected_roi": "$500/mo"
}

## Categories
- SaaS Tools, Affiliate Blogs, Digital Products, Service Arbitrage, Media Channels.
