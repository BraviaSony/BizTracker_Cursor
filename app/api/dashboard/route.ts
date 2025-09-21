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

    // Get expenses total
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)

    // Get liabilities total
    const { data: liabilities } = await supabase
      .from('liabilities')
      .select('outstanding_amount')
      .eq('user_id', user.id)

    // Get salaries total
    const { data: salaries } = await supabase
      .from('salaries')
      .select('amount')
      .eq('user_id', user.id)

    // Get cashflow data
    const { data: cashflow } = await supabase
      .from('cashflow')
      .select('amount, type')
      .eq('user_id', user.id)

    // Get pending PDC
    const { data: pdc } = await supabase
      .from('bank_pdc')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    // Get capital injections
    const { data: capital } = await supabase
      .from('capital_injections')
      .select('amount')
      .eq('user_id', user.id)

    // Calculate totals
    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
    const totalLiabilities = liabilities?.reduce((sum, liability) => sum + liability.outstanding_amount, 0) || 0
    const totalSalaries = salaries?.reduce((sum, salary) => sum + salary.amount, 0) || 0
    
    const inflow = cashflow?.filter(c => c.type === 'inflow').reduce((sum, c) => sum + c.amount, 0) || 0
    const outflow = cashflow?.filter(c => c.type === 'outflow').reduce((sum, c) => sum + c.amount, 0) || 0
    const totalCashflow = inflow - outflow
    
    const pendingPDC = pdc?.reduce((sum, p) => sum + p.amount, 0) || 0
    const capitalInjected = capital?.reduce((sum, c) => sum + c.amount, 0) || 0

    // Get recent transactions
    const { data: recentExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentSalaries } = await supabase
      .from('salaries')
      .select(`
        *,
        employees (
          name,
          position
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      data: {
        stats: {
          totalExpenses,
          totalLiabilities,
          totalSalaries,
          totalCashflow,
          pendingPDC,
          capitalInjected,
        },
        recentExpenses: recentExpenses || [],
        recentSalaries: recentSalaries || [],
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
