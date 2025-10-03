'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { createClientSupabase } from '@/lib/supabase'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  FileText,
  PlusCircle,
  Receipt
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalExpenses: number
  totalLiabilities: number
  totalSalaries: number
  totalCashflow: number
  pendingPDC: number
  capitalInjected: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalLiabilities: 0,
    totalSalaries: 0,
    totalCashflow: 0,
    pendingPDC: 0,
    capitalInjected: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      await loadDashboardData()
    }

    checkAuth()
  }, [router, supabase.auth])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }
      
      const { data } = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AppLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      icon: Receipt,
      color: 'text-error-600',
      bgColor: 'bg-error-50 dark:bg-error-900/20',
    },
    {
      title: 'Outstanding Liabilities',
      value: formatCurrency(stats.totalLiabilities),
      icon: CreditCard,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
    },
    {
      title: 'Total Salaries',
      value: formatCurrency(stats.totalSalaries),
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      title: 'Net Cashflow',
      value: formatCurrency(stats.totalCashflow),
      icon: stats.totalCashflow >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalCashflow >= 0 ? 'text-success-600' : 'text-error-600',
      bgColor: stats.totalCashflow >= 0 ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20',
    },
    {
      title: 'Pending PDC',
      value: formatCurrency(stats.pendingPDC),
      icon: FileText,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50 dark:bg-secondary-800',
    },
    {
      title: 'Capital Injected',
      value: formatCurrency(stats.capitalInjected),
      icon: PlusCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50 dark:bg-success-900/20',
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Dashboard</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Overview of your business financial health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <Card key={index} className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your business finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/expenses" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800 transition-colors block text-center">
                <Receipt className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium">Add Expense</span>
              </Link>
              <Link href="/salaries" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800 transition-colors block text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium">Add Employee</span>
              </Link>
              <Link href="/liabilities" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800 transition-colors block text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium">Add Liability</span>
              </Link>
              <Link href="/pdc" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800 transition-colors block text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium">Add PDC</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
