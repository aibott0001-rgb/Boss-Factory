"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Rocket, 
  Brain, 
  BarChart3, 
  PieChart,
  Activity,
  Eye,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardSummary {
  totalIdeas: number;
  approvedIdeas: number;
  totalVentures: number;
  activeVentures: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roi: number;
}

interface Venture {
  id: string;
  name: string;
  description: string;
  status: 'building' | 'deployed' | 'failed' | 'archived';
  revenue: number;
  costs: number;
  github_repo_url?: string;
  vercel_url?: string;
  created_at: string;
  brain_dumps: {
    idea_text: string;
    ai_score?: number;
    ai_verdict?: 'GO' | 'NO GO';
    ai_category?: string;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function VentureDashboard({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentVentures, setRecentVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
        setRecentVentures(data.recentVentures);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-500 bg-green-500/10';
      case 'building': return 'text-blue-500 bg-blue-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'archived': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'GO': return 'text-green-500';
      case 'NO GO': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const metricCards: MetricCard[] = [
    {
      title: 'Total Ideas',
      value: summary.totalIdeas,
      icon: <Brain size={20} />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Active Ventures',
      value: summary.activeVentures,
      icon: <Rocket size={20} />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: <DollarSign size={20} />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(summary.netProfit),
      icon: <TrendingUp size={20} />,
      color: summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: summary.netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Venture Dashboard</h1>
          <p className="text-gray-400">Monitor your autonomous wealth generation empire</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-2">
          <BarChart3 size={16} />
          Export Report
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div key={index} className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm ${card.bgColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={card.color}>{card.icon}</div>
              {card.change && (
                <span className={`text-sm font-medium ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(card.change)}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-sm text-gray-400">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Rate */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-purple-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Approval Rate</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Approved Ideas</span>
              <span className="text-green-500">{summary.approvedIdeas}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Ideas</span>
              <span className="text-white">{summary.totalIdeas}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-2xl font-bold text-white">
                {summary.totalIdeas > 0 ? Math.round((summary.approvedIdeas / summary.totalIdeas) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Return on Investment</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-green-500">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Costs</span>
              <span className="text-red-500">{formatCurrency(summary.totalCosts)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(summary.roi)}
              </div>
              <div className="text-sm text-gray-400">ROI</div>
            </div>
          </div>
        </div>

        {/* Venture Status */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="text-green-500" size={20} />
            <h3 className="text-lg font-semibold text-white">Venture Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Deployed</span>
              <span className="text-green-500">{summary.activeVentures}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Building</span>
              <span className="text-blue-500">{summary.totalVentures - summary.activeVentures}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-2xl font-bold text-white">{summary.totalVentures}</div>
              <div className="text-sm text-gray-400">Total Ventures</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ventures */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Ventures</h3>
          <button className="text-purple-500 hover:text-purple-400 text-sm font-medium">
            View All
          </button>
        </div>

        {recentVentures.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-400">No ventures yet. Start by analyzing your first idea!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentVentures.map((venture) => (
              <div key={venture.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{venture.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(venture.status)}`}>
                        {venture.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{venture.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        Category: <span className="text-gray-300">{venture.brain_dumps.ai_category || 'Unknown'}</span>
                      </span>
                      <span className={getVerdictColor(venture.brain_dumps.ai_verdict)}>
                        Score: {venture.brain_dumps.ai_score || '--'}/100
                      </span>
                      <span className="text-green-500">
                        Revenue: {formatCurrency(venture.revenue)}
                      </span>
                      <span className="text-red-500">
                        Costs: {formatCurrency(venture.costs)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {venture.vercel_url && (
                      <a
                        href={venture.vercel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="View Live Site"
                      >
                        <Eye size={16} />
                      </a>
                    )}
                    {venture.github_repo_url && (
                      <a
                        href={venture.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="View Repository"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
