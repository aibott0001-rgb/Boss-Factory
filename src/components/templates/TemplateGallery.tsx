"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink, 
  Rocket, 
  DollarSign, 
  Clock,
  Tag,
  Grid,
  List,
  ChevronDown,
  Heart,
  Eye
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  github_repo?: string;
  demo_url?: string;
  difficulty_level: number;
  estimated_cost: number;
  revenue_potential: number;
  is_featured: boolean;
  deployment_count: number;
  success_rate: number;
  created_at: string;
}

const categories = ['All', 'SaaS', 'Content', 'E-commerce', 'Service'];
const difficulties = ['All', '1', '2', '3', '4', '5'];

export default function TemplateGallery({ userId }: { userId: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const templatesPerPage = 12;

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates?limit=50&featured=true`);
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        setFilteredTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(template => template.difficulty_level === parseInt(selectedDifficulty));
    }

    // Apply sorting
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'popular':
        filtered.sort((a, b) => b.deployment_count - a.deployment_count);
        break;
      case 'success':
        filtered.sort((a, b) => b.success_rate - a.success_rate);
        break;
      case 'revenue':
        filtered.sort((a, b) => b.revenue_potential - a.revenue_potential);
        break;
      case 'difficulty':
        filtered.sort((a, b) => a.difficulty_level - b.difficulty_level);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredTemplates(filtered);
    setPage(0);
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-purple-500'];
    return colors[level - 1] || 'text-gray-500';
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    return labels[level - 1] || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const deployTemplate = async (template: Template) => {
    try {
      // This would open a deployment modal or navigate to deployment page
      console.log('Deploying template:', template);
      // In real implementation, this would trigger the deployment flow
    } catch (error) {
      console.error('Error deploying template:', error);
    }
  };

  const displayedTemplates = filteredTemplates.slice(0, (page + 1) * templatesPerPage);
  const currentHasMore = displayedTemplates.length < filteredTemplates.length;

  const TemplateCard = ({ template }: { template: Template }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm hover:border-slate-600 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {template.is_featured && (
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
            )}
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {template.name}
            </h3>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">{template.description}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-300">
          {template.category}
        </span>
        <span className={`px-2 py-1 bg-slate-800 rounded text-xs ${getDifficultyColor(template.difficulty_level)}`}>
          {getDifficultyLabel(template.difficulty_level)}
        </span>
        {template.tags.slice(0, 2).map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-300">
            {tag}
          </span>
        ))}
        {template.tags.length > 2 && (
          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-400">
            +{template.tags.length - 2} more
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-500">
            {formatCurrency(template.revenue_potential)}
          </div>
          <div className="text-xs text-gray-500">Revenue Potential</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-500">
            {formatCurrency(template.estimated_cost)}
          </div>
          <div className="text-xs text-gray-500">Est. Cost</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Rocket size={14} />
            {template.deployment_count} deployments
          </span>
          <span className="flex items-center gap-1">
            <Star size={14} />
            {template.success_rate}% success
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => deployTemplate(template)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Rocket size={16} />
          Deploy Now
        </button>
        
        {template.demo_url && (
          <a
            href={template.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-1"
            title="View Demo"
          >
            <Eye size={16} />
          </a>
        )}
        
        {template.github_repo && (
          <a
            href={template.github_repo}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-1"
            title="View Source"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );

  const TemplateListItem = ({ template }: { template: Template }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm hover:border-slate-600 transition-all">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {template.is_featured && (
              <Star className="text-yellow-500 fill-yellow-500" size={20} />
            )}
            <h3 className="text-xl font-semibold text-white">{template.name}</h3>
            <span className={`px-3 py-1 bg-slate-800 rounded-full text-sm ${getDifficultyColor(template.difficulty_level)}`}>
              {getDifficultyLabel(template.difficulty_level)}
            </span>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-gray-300">
              {template.category}
            </span>
          </div>
          
          <p className="text-gray-400 mb-4">{template.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics & Actions */}
        <div className="text-right space-y-4">
          <div className="space-y-2">
            <div>
              <div className="text-lg font-semibold text-green-500">
                {formatCurrency(template.revenue_potential)}
              </div>
              <div className="text-xs text-gray-500">Revenue Potential</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-500">
                {formatCurrency(template.estimated_cost)}
              </div>
              <div className="text-xs text-gray-500">Est. Cost</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Rocket size={14} />
              {template.deployment_count}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} />
              {template.success_rate}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deployTemplate(template)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all flex items-center gap-2"
            >
              <Rocket size={16} />
              Deploy
            </button>
            
            {template.demo_url && (
              <a
                href={template.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                title="View Demo"
              >
                <Eye size={16} />
              </a>
            )}
            
            {template.github_repo && (
              <a
                href={template.github_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                title="View Source"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-slate-800 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Template Gallery</h1>
          <p className="text-gray-400">Choose from 1000+ pre-validated business models</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            >
              <option value="featured">Featured</option>
              <option value="popular">Most Popular</option>
              <option value="success">Highest Success Rate</option>
              <option value="revenue">Highest Revenue</option>
              <option value="difficulty">Easiest First</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedDifficulty === difficulty
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {difficulty === 'All' ? difficulty : getDifficultyLabel(parseInt(difficulty))}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {displayedTemplates.length} of {filteredTemplates.length} templates
        </p>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Search className="text-gray-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTemplates.map((template) => (
                <TemplateListItem key={template.id} template={template} />
              ))}
            </div>
          )}

          {/* Load More */}
          {currentHasMore && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage(page + 1)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
              >
                Load More Templates
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
