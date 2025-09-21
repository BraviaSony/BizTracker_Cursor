import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bank_name = searchParams.get('bank_name')
    const search = searchParams.get('search')

    let query = supabase
      .from('bank_pdc')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (bank_name) {
      query = query.eq('bank_name', bank_name)
    }

    if (search) {
      query = query.or(`cheque_number.ilike.%${search}%,payee.ilike.%${search}%,purpose.ilike.%${search}%`)
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
    const { cheque_number, bank_name, amount, issue_date, due_date, status, payee, purpose, notes } = body

    // Validate required fields
    if (!cheque_number || !bank_name || !amount || !issue_date || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bank_pdc')
      .insert({
        user_id: user.id,
        cheque_number,
        bank_name,
        amount: parseFloat(amount),
        issue_date,
        due_date,
        status: status || 'pending',
        payee: payee || null,
        purpose: purpose || null,
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
