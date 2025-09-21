'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createClientSupabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, PlusCircle, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CapitalInjection {
  id: string
  type: 'equity' | 'loan' | 'investment' | 'grant' | 'other'
  amount: number
  date: string
  source: string | null
  description: string | null
  notes: string | null
  created_at: string
}

const CAPITAL_TYPES = [
  { value: 'equity', label: 'Equity' },
  { value: 'loan', label: 'Loan' },
  { value: 'investment', label: 'Investment' },
  { value: 'grant', label: 'Grant' },
  { value: 'other', label: 'Other' },
]

const TYPE_COLORS = {
  equity: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
  loan: 'text-warning-600 bg-warning-50 dark:bg-warning-900/20',
  investment: 'text-success-600 bg-success-50 dark:bg-success-900/20',
  grant: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800',
  other: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800',
}

export default function CapitalPage() {
  const [capitalInjections, setCapitalInjections] = useState<CapitalInjection[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCapital, setEditingCapital] = useState<CapitalInjection | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    date: '',
    source: '',
    description: '',
    notes: '',
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
    await loadCapitalInjections()
  }

  const loadCapitalInjections = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (dateFilter) params.append('date', dateFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/capital?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load capital injections')
      }

      const { data } = await response.json()
      setCapitalInjections(data || [])
    } catch (error) {
      console.error('Error loading capital injections:', error)
      toast.error('Failed to load capital injections')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.amount || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const capitalData = {
        type: formData.type,
        amount: formData.amount,
        date: formData.date,
        source: formData.source || null,
        description: formData.description || null,
        notes: formData.notes || null,
      }

      const url = editingCapital ? `/api/capital/${editingCapital.id}` : '/api/capital'
      const method = editingCapital ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capitalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save capital injection')
      }

      toast.success(editingCapital ? 'Capital injection updated successfully' : 'Capital injection added successfully')
      await loadCapitalInjections()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving capital injection:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save capital injection')
    }
  }

  const handleEdit = (capital: CapitalInjection) => {
    setEditingCapital(capital)
    setFormData({
      type: capital.type,
      amount: capital.amount.toString(),
      date: capital.date,
      source: capital.source || '',
      description: capital.description || '',
      notes: capital.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this capital injection?')) return

    try {
      const { error } = await supabase
        .from('capital_injections')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Capital injection deleted successfully')
      await loadCapitalInjections()
    } catch (error) {
      console.error('Error deleting capital injection:', error)
      toast.error('Failed to delete capital injection')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCapital(null)
    setFormData({
      type: '',
      amount: '',
      date: '',
      source: '',
      description: '',
      notes: '',
    })
  }

  const filteredCapital = capitalInjections.filter(capital => {
    const matchesSearch = capital.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capital.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capital.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || capital.type === typeFilter
    const matchesDate = !dateFilter || capital.date.startsWith(dateFilter)
    
    return matchesSearch && matchesType && matchesDate
  })

  const totalAmount = filteredCapital.reduce((sum, capital) => sum + capital.amount, 0)
  
  const totalByType = filteredCapital.reduce((acc, capital) => {
    acc[capital.type] = (acc[capital.type] || 0) + capital.amount
    return acc
  }, {} as Record<string, number>)

  const thisYearAmount = filteredCapital
    .filter(capital => new Date(capital.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, capital) => sum + capital.amount, 0)

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
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Capital Injections</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Track capital investments and funding received
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Capital
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capital</CardTitle>
              <PlusCircle className="h-4 w-4 text-success-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-600">
                {formatCurrency(totalAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(thisYearAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <PlusCircle className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCapital.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown by Type */}
        {Object.keys(totalByType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Capital by Type</CardTitle>
              <CardDescription>
                Breakdown of capital injections by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(totalByType).map(([type, amount]) => (
                  <div key={type} className="p-4 border border-secondary-200 rounded-lg dark:border-secondary-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                          {CAPITAL_TYPES.find(t => t.value === type)?.label}
                        </p>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}>
                        <PlusCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search capital injections..."
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
                  ...CAPITAL_TYPES
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

        {/* Capital List */}
        <Card>
          <CardHeader>
            <CardTitle>Capital Injections</CardTitle>
            <CardDescription>
              {filteredCapital.length} capital injection(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCapital.length === 0 ? (
              <div className="text-center py-8">
                <PlusCircle className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                <p className="text-secondary-500">No capital injections found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCapital.map((capital) => (
                  <div
                    key={capital.id}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${TYPE_COLORS[capital.type]}`}>
                          <PlusCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-secondary-900 dark:text-white">
                            {CAPITAL_TYPES.find(t => t.value === capital.type)?.label}
                          </h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {formatDate(capital.date)}
                            {capital.source && ` • Source: ${capital.source}`}
                            {capital.description && ` • ${capital.description}`}
                          </p>
                          {capital.notes && (
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                              {capital.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success-600">
                            +{formatCurrency(capital.amount)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[capital.type]}`}>
                            {capital.type.charAt(0).toUpperCase() + capital.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(capital)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(capital.id)}
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
          title={editingCapital ? 'Edit Capital Injection' : 'Add New Capital Injection'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={CAPITAL_TYPES}
              placeholder="Select capital type"
              required
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
              label="Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Enter source (e.g., investor name, bank)"
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCapital ? 'Update' : 'Add'} Capital
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
