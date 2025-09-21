import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { validateLiability } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let query = supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`)
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
    const { type, name, amount, outstanding_amount, due_date, interest_rate, notes } = body

    // Validate data
    const validation = validateLiability(body)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('liabilities')
      .insert({
        user_id: user.id,
        type,
        name,
        amount: parseFloat(amount),
        outstanding_amount: parseFloat(outstanding_amount),
        due_date: due_date || null,
        interest_rate: interest_rate ? parseFloat(interest_rate) : null,
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
