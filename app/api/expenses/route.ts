import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { validateExpense } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (date) {
      query = query.gte('date', `${date}-01`).lt('date', `${date}-32`)
    }

    if (search) {
      query = query.or(`notes.ilike.%${search}%,category.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, amount, date, notes } = body

    // Validate data
    const validation = validateExpense(body)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category,
        amount: parseFloat(amount),
        date,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
