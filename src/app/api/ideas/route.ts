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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user's brain dumps
    const { data: ideas, error, count } = await supabase
      .from('brain_dumps')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ideas,
      total: count,
      hasMore: offset + limit < (count || 0)
    });

  } catch (error: any) {
    console.error('💥 Ideas API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ideaText, category, tags } = body;

    if (!userId || !ideaText) {
      return NextResponse.json({ 
        error: 'User ID and idea text are required' 
      }, { status: 400 });
    }

    // Create new brain dump
    const { data: idea, error } = await supabase
      .from('brain_dumps')
      .insert([{
        user_id: userId,
        idea_text: ideaText,
        ai_category: category,
        ai_tags: tags || [],
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'CREATE_IDEA',
      resource_type: 'brain_dumps',
      resource_id: idea.id,
      new_values: { idea_text: ideaText, category, tags }
    }]);

    return NextResponse.json({ 
      success: true, 
      idea 
    });

  } catch (error: any) {
    console.error('💥 Ideas API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, ideaId, updates } = body;

    if (!userId || !ideaId || !updates) {
      return NextResponse.json({ 
        error: 'User ID, idea ID, and updates are required' 
      }, { status: 400 });
    }

    // Get current idea for audit log
    const { data: currentIdea } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('id', ideaId)
      .eq('user_id', userId)
      .single();

    if (!currentIdea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Update the idea
    const { data: updatedIdea, error } = await supabase
      .from('brain_dumps')
      .update(updates)
      .eq('id', ideaId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating idea:', error);
      return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'UPDATE_IDEA',
      resource_type: 'brain_dumps',
      resource_id: ideaId,
      old_values: currentIdea,
      new_values: updates
    }]);

    return NextResponse.json({ 
      success: true, 
      idea: updatedIdea 
    });

  } catch (error: any) {
    console.error('💥 Ideas API Error:', error);
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
    const ideaId = searchParams.get('ideaId');

    if (!userId || !ideaId) {
      return NextResponse.json({ 
        error: 'User ID and idea ID are required' 
      }, { status: 400 });
    }

    // Get current idea for audit log
    const { data: currentIdea } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('id', ideaId)
      .eq('user_id', userId)
      .single();

    if (!currentIdea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Delete the idea
    const { error } = await supabase
      .from('brain_dumps')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting idea:', error);
      return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: 'DELETE_IDEA',
      resource_type: 'brain_dumps',
      resource_id: ideaId,
      old_values: currentIdea
    }]);

    return NextResponse.json({ 
      success: true, 
      message: 'Idea deleted successfully' 
    });

  } catch (error: any) {
    console.error('💥 Ideas API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
