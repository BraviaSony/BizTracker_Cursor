import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employee_id = searchParams.get('employee_id')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    let query = supabase
      .from('salaries')
      .select(`
        *,
        employees (
          name,
          position
        )
      `)
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (employee_id) {
      query = query.eq('employee_id', employee_id)
    }

    if (month) {
      query = query.eq('month', parseInt(month))
    }

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    if (status) {
      query = query.eq('status', status)
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
    const { employee_id, month, year, amount, status, paid_date, notes } = body

    // Validate required fields
    if (!employee_id || !month || !year || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if salary record already exists for this employee, month, and year
    const { data: existingSalary } = await supabase
      .from('salaries')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('month', month)
      .eq('year', year)
      .eq('user_id', user.id)
      .single()

    if (existingSalary) {
      return NextResponse.json({ error: 'Salary record already exists for this employee, month, and year' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('salaries')
      .insert({
        user_id: user.id,
        employee_id,
        month: parseInt(month),
        year: parseInt(year),
        amount: parseFloat(amount),
        status: status || 'unpaid',
        paid_date: paid_date || null,
        notes: notes || null,
      })
      .select(`
        *,
        employees (
          name,
          position
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
