'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createClientSupabase } from '@/lib/supabase-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Cashflow {
  id: string
  type: 'inflow' | 'outflow'
  category: string
  amount: number
  date: string
  description: string | null
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

const CASHFLOW_TYPES = [
  { value: 'inflow', label: 'Inflow' },
  { value: 'outflow', label: 'Outflow' },
]

const CASHFLOW_CATEGORIES = {
  inflow: [
    { value: 'sales', label: 'Sales Revenue' },
    { value: 'investment', label: 'Investment' },
    { value: 'loan', label: 'Loan Received' },
    { value: 'refund', label: 'Refund' },
    { value: 'other_income', label: 'Other Income' },
  ],
  outflow: [
    { value: 'expenses', label: 'Expenses' },
    { value: 'salary', label: 'Salary Payments' },
    { value: 'loan_payment', label: 'Loan Payment' },
    { value: 'tax', label: 'Tax Payment' },
    { value: 'equipment', label: 'Equipment Purchase' },
    { value: 'other_expense', label: 'Other Expense' },
  ],
}

export default function CashflowPage() {
  const [cashflow, setCashflow] = useState<Cashflow[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCashflow, setEditingCashflow] = useState<Cashflow | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    amount: '',
    date: '',
    description: '',
  })
  
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/')
      return
    }
    await loadCashflow()
  }

  const loadCashflow = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (dateFilter) params.append('date', dateFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/cashflow?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load cashflow')
      }

      const { data } = await response.json()
      setCashflow(data || [])
    } catch (error) {
      console.error('Error loading cashflow:', error)
      toast.error('Failed to load cashflow')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.category || !formData.amount || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const cashflowData = {
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        date: formData.date,
        description: formData.description || null,
      }

      const url = editingCashflow ? `/api/cashflow/${editingCashflow.id}` : '/api/cashflow'
      const method = editingCashflow ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashflowData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save cashflow')
      }

      toast.success(editingCashflow ? 'Cashflow record updated successfully' : 'Cashflow record added successfully')
      await loadCashflow()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving cashflow:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save cashflow record')
    }
  }

  const handleEdit = (cashflowItem: Cashflow) => {
    setEditingCashflow(cashflowItem)
    setFormData({
      type: cashflowItem.type,
      category: cashflowItem.category,
      amount: cashflowItem.amount.toString(),
      date: cashflowItem.date,
      description: cashflowItem.description || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cashflow record?')) return

    try {
      const response = await fetch(`/api/cashflow/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete cashflow record')
      }

      toast.success('Cashflow record deleted successfully')
      await loadCashflow()
    } catch (error) {
      console.error('Error deleting cashflow:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete cashflow record')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCashflow(null)
    setFormData({
      type: '',
      category: '',
      amount: '',
      date: '',
      description: '',
    })
  }

  const filteredCashflow = cashflow.filter(item => {
    const matchesSearch = item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || item.type === typeFilter
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    const matchesDate = !dateFilter || item.date.startsWith(dateFilter)
    
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  const totalInflow = filteredCashflow
    .filter(item => item.type === 'inflow')
    .reduce((sum, item) => sum + item.amount, 0)
  
  const totalOutflow = filteredCashflow
    .filter(item => item.type === 'outflow')
    .reduce((sum, item) => sum + item.amount, 0)
  
  const netCashflow = totalInflow - totalOutflow

  const currentCategories = formData.type 
    ? CASHFLOW_CATEGORIES[formData.type as keyof typeof CASHFLOW_CATEGORIES] 
    : []

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Cashflow</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Track money flowing in and out of your business
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
              <TrendingUp className="h-4 w-4 text-success-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-600">
                {formatCurrency(totalInflow)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
              <TrendingDown className="h-4 w-4 text-error-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-error-600">
                {formatCurrency(totalOutflow)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
              <DollarSign className={`h-4 w-4 ${netCashflow >= 0 ? 'text-success-600' : 'text-error-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {formatCurrency(netCashflow)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
              <Select
                placeholder="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...CASHFLOW_TYPES
                ]}
              />
              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...Object.values(CASHFLOW_CATEGORIES).flat()
                ]}
              />
              <Input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by month"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cashflow List */}
        <Card>
          <CardHeader>
            <CardTitle>Cashflow Records</CardTitle>
            <CardDescription>
              {filteredCashflow.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCashflow.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                <p className="text-secondary-500">No cashflow records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCashflow.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'inflow' 
                            ? 'bg-success-50 dark:bg-success-900/20' 
                            : 'bg-error-50 dark:bg-error-900/20'
                        }`}>
                          {item.type === 'inflow' ? (
                            <TrendingUp className="h-4 w-4 text-success-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-error-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-secondary-900 dark:text-white">
                            {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {formatDate(item.date)}
                            {item.description && ` • ${item.description}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            item.type === 'inflow' 
                              ? 'text-success-600' 
                              : 'text-error-600'
                          }`}>
                            {item.type === 'inflow' ? '+' : '-'}{formatCurrency(item.amount)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.type === 'inflow'
                              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                              : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                          }`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCashflow ? 'Edit Cashflow Record' : 'Add New Cashflow Record'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value, category: '' })
              }}
              options={CASHFLOW_TYPES}
              placeholder="Select type"
              required
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={currentCategories}
              placeholder="Select category"
              required
              disabled={!formData.type}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCashflow ? 'Update' : 'Add'} Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
