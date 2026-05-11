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
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('venture_templates')
      .select('*', { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (difficulty) {
      query = query.eq('difficulty_level', parseInt(difficulty));
    }

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates,
      total: count,
      hasMore: offset + limit < (count || 0)
    });

  } catch (error: any) {
    console.error('💥 Templates API Error:', error);
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
      name, 
      description, 
      category, 
      tags, 
      githubRepo, 
      demoUrl,
      difficultyLevel,
      estimatedCost,
      revenuePotential,
      isFeatured 
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ 
        error: 'Name, description, and category are required' 
      }, { status: 400 });
    }

    // Create new template
    const { data: template, error } = await supabase
      .from('venture_templates')
      .insert([{
        name,
        description,
        category,
        tags: tags || [],
        github_repo: githubRepo,
        demo_url: demoUrl,
        difficulty_level: difficultyLevel || 1,
        estimated_cost: estimatedCost || 0,
        revenue_potential: revenuePotential || 0,
        is_featured: isFeatured || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      template 
    });

  } catch (error: any) {
    console.error('💥 Templates API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { templateId, updates } = body;

    if (!templateId || !updates) {
      return NextResponse.json({ 
        error: 'Template ID and updates are required' 
      }, { status: 400 });
    }

    // Update template
    const { data: updatedTemplate, error } = await supabase
      .from('venture_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      template: updatedTemplate 
    });

  } catch (error: any) {
    console.error('💥 Templates API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json({ 
        error: 'Template ID is required' 
      }, { status: 400 });
    }

    // Delete template
    const { error } = await supabase
      .from('venture_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Template deleted successfully' 
    });

  } catch (error: any) {
    console.error('💥 Templates API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
