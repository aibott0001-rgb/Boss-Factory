import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch dashboard summary from view
    const { data: summary, error: summaryError } = await supabase
      .from('user_dashboard_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching dashboard summary:', summaryError);
      return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
    }

    // Fetch recent ideas
    const { data: recentIdeas, error: ideasError } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ideasError) {
      console.error('Error fetching recent ideas:', ideasError);
      return NextResponse.json({ error: 'Failed to fetch recent ideas' }, { status: 500 });
    }

    // Fetch recent ventures
    const { data: recentVentures, error: venturesError } = await supabase
      .from('ventures')
      .select(`
        *,
        brain_dumps (
          idea_text,
          ai_score,
          ai_verdict,
          ai_category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (venturesError) {
      console.error('Error fetching recent ventures:', venturesError);
      return NextResponse.json({ error: 'Failed to fetch recent ventures' }, { status: 500 });
    }

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('system_metrics')
      .select('*')
      .eq('tags->>user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      // Don't fail the request if analytics fail
    }

    // Calculate additional metrics
    const totalRevenue = summary?.total_revenue || 0;
    const totalCosts = summary?.total_costs || 0;
    const netProfit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? ((netProfit / totalCosts) * 100) : 0;

    // Get idea trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: ideaTrends, error: trendsError } = await supabase
      .from('brain_dumps')
      .select('created_at, ai_verdict')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (trendsError) {
      console.error('Error fetching idea trends:', trendsError);
    }

    // Process trends data
    const trendsByDay = {};
    if (ideaTrends) {
      ideaTrends.forEach(idea => {
        const day = new Date(idea.created_at).toISOString().split('T')[0];
        if (!trendsByDay[day]) {
          trendsByDay[day] = { total: 0, go: 0, noGo: 0 };
        }
        trendsByDay[day].total++;
        if (idea.ai_verdict === 'GO') {
          trendsByDay[day].go++;
        } else if (idea.ai_verdict === 'NO GO') {
          trendsByDay[day].noGo++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalIdeas: summary?.total_ideas || 0,
        approvedIdeas: summary?.approved_ideas || 0,
        totalVentures: summary?.total_ventures || 0,
        activeVentures: summary?.active_ventures || 0,
        totalRevenue,
        totalCosts,
        netProfit,
        roi: Math.round(roi * 100) / 100
      },
      recentIdeas: recentIdeas || [],
      recentVentures: recentVentures || [],
      analytics: analytics || [],
      trends: trendsByDay
    });

  } catch (error: any) {
    console.error('💥 Dashboard API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, metricName, metricValue, metricUnit, tags } = body;

    if (!userId || !metricName || metricValue === undefined) {
      return NextResponse.json({ 
        error: 'User ID, metric name, and metric value are required' 
      }, { status: 400 });
    }

    // Record system metric
    const { data: metric, error } = await supabase
      .from('system_metrics')
      .insert([{
        metric_name: metricName,
        metric_value: metricValue,
        metric_unit: metricUnit,
        tags: { ...tags, user_id: userId }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording metric:', error);
      return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      metric 
    });

  } catch (error: any) {
    console.error('💥 Dashboard API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
