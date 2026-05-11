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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('ventures')
      .select(`
        *,
        brain_dumps (
          idea_text,
          ai_score,
          ai_verdict,
          ai_category
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: ventures, error, count } = await query;

    if (error) {
      console.error('Error fetching ventures:', error);
      return NextResponse.json({ error: 'Failed to fetch ventures' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ventures,
      total: count,
      hasMore: offset + limit < (count || 0)
    });

  } catch (error: any) {
    console.error('💥 Ventures API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      brainDumpId, 
      name, 
      description, 
      templateId,
      githubRepoUrl,
      vercelUrl 
    } = body;

    if (!userId || !brainDumpId || !name) {
      return NextResponse.json({ 
        error: 'User ID, brain dump ID, and name are required' 
      }, { status: 400 });
    }

    // Create new venture
    const { data: venture, error } = await supabase
      .from('ventures')
      .insert([{
        user_id: userId,
        brain_dump_id: brainDumpId,
        name,
        description,
        template_id: templateId,
        github_repo_url: githubRepoUrl,
        vercel_url: vercelUrl,
        status: 'building'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating venture:', error);
      return NextResponse.json({ error: 'Failed to create venture' }, { status: 500 });
    }

    // Update brain dump status
    await supabase
      .from('brain_dumps')
      .update({ status: 'deployed' })
      .eq('id', brainDumpId);

    // Log action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'CREATE_VENTURE',
      resource_type: 'ventures',
      resource_id: venture.id,
      new_values: { name, description, templateId }
    }]);

    return NextResponse.json({ 
      success: true, 
      venture 
    });

  } catch (error: any) {
    console.error('💥 Ventures API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, ventureId, updates } = body;

    if (!userId || !ventureId || !updates) {
      return NextResponse.json({ 
        error: 'User ID, venture ID, and updates are required' 
      }, { status: 400 });
    }

    // Get current venture for audit log
    const { data: currentVenture } = await supabase
      .from('ventures')
      .select('*')
      .eq('id', ventureId)
      .eq('user_id', userId)
      .single();

    if (!currentVenture) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    // Update venture
    const { data: updatedVenture, error } = await supabase
      .from('ventures')
      .update(updates)
      .eq('id', ventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating venture:', error);
      return NextResponse.json({ error: 'Failed to update venture' }, { status: 500 });
    }

    // Log action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'UPDATE_VENTURE',
      resource_type: 'ventures',
      resource_id: ventureId,
      old_values: currentVenture,
      new_values: updates
    }]);

    return NextResponse.json({ 
      success: true, 
      venture: updatedVenture 
    });

  } catch (error: any) {
    console.error('💥 Ventures API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const ventureId = searchParams.get('ventureId');

    if (!userId || !ventureId) {
      return NextResponse.json({ 
        error: 'User ID and venture ID are required' 
      }, { status: 400 });
    }

    // Get current venture for audit log
    const { data: currentVenture } = await supabase
      .from('ventures')
      .select('*')
      .eq('id', ventureId)
      .eq('user_id', userId)
      .single();

    if (!currentVenture) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    // Delete venture
    const { error } = await supabase
      .from('ventures')
      .delete()
      .eq('id', ventureId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting venture:', error);
      return NextResponse.json({ error: 'Failed to delete venture' }, { status: 500 });
    }

    // Log action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'DELETE_VENTURE',
      resource_type: 'ventures',
      resource_id: ventureId,
      old_values: currentVenture
    }]);

    return NextResponse.json({ 
      success: true, 
      message: 'Venture deleted successfully' 
    });

  } catch (error: any) {
    console.error('💥 Ventures API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
