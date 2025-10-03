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
import { Plus, Search, Edit, Trash2, CreditCard, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Liability {
  id: string
  type: string
  name: string
  amount: number
  outstanding_amount: number
  due_date: string | null
  interest_rate: number | null
  notes: string | null
  created_at: string
}

const LIABILITY_TYPES = [
  { value: 'loan', label: 'Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'vendor_payment', label: 'Vendor Payment' },
  { value: 'tax_payment', label: 'Tax Payment' },
  { value: 'other', label: 'Other' },
]

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    amount: '',
    outstanding_amount: '',
    due_date: '',
    interest_rate: '',
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
    await loadLiabilities()
  }

  const loadLiabilities = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/liabilities?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load liabilities')
      }

      const { data } = await response.json()
      setLiabilities(data || [])
    } catch (error) {
      console.error('Error loading liabilities:', error)
      toast.error('Failed to load liabilities')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.name || !formData.amount || !formData.outstanding_amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const liabilityData = {
        type: formData.type,
        name: formData.name,
        amount: formData.amount,
        outstanding_amount: formData.outstanding_amount,
        due_date: formData.due_date || null,
        interest_rate: formData.interest_rate || null,
        notes: formData.notes || null,
      }

      const url = editingLiability ? `/api/liabilities/${editingLiability.id}` : '/api/liabilities'
      const method = editingLiability ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liabilityData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save liability')
      }

      toast.success(editingLiability ? 'Liability updated successfully' : 'Liability added successfully')
      await loadLiabilities()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving liability:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save liability')
    }
  }

  const handleEdit = (liability: Liability) => {
    setEditingLiability(liability)
    setFormData({
      type: liability.type,
      name: liability.name,
      amount: liability.amount.toString(),
      outstanding_amount: liability.outstanding_amount.toString(),
      due_date: liability.due_date || '',
      interest_rate: liability.interest_rate?.toString() || '',
      notes: liability.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return

    try {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete liability')
      }

      toast.success('Liability deleted successfully')
      await loadLiabilities()
    } catch (error) {
      console.error('Error deleting liability:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete liability')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLiability(null)
    setFormData({
      type: '',
      name: '',
      amount: '',
      outstanding_amount: '',
      due_date: '',
      interest_rate: '',
      notes: '',
    })
  }

  const filteredLiabilities = liabilities.filter(liability => {
    const matchesSearch = liability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         liability.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || liability.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const totalOutstanding = filteredLiabilities.reduce((sum, liability) => sum + liability.outstanding_amount, 0)
  const overdueLiabilities = filteredLiabilities.filter(liability => 
    liability.due_date && new Date(liability.due_date) < new Date()
  )

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
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Liabilities</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Track and manage your business liabilities and debts
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Liability
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <CreditCard className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-error-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueLiabilities.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <CreditCard className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLiabilities.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search liabilities..."
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
                  ...LIABILITY_TYPES
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liabilities List */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities List</CardTitle>
            <CardDescription>
              {filteredLiabilities.length} liability(ies) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLiabilities.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                <p className="text-secondary-500">No liabilities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLiabilities.map((liability) => {
                  const isOverdue = liability.due_date && new Date(liability.due_date) < new Date()
                  const isDueSoon = liability.due_date && 
                    new Date(liability.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    !isOverdue

                  return (
                    <div
                      key={liability.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors ${
                        isOverdue 
                          ? 'border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20' 
                          : isDueSoon
                          ? 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20'
                          : 'border-secondary-200 dark:border-secondary-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-secondary-900 dark:text-white">
                                {liability.name}
                              </h3>
                              {isOverdue && (
                                <span className="px-2 py-1 text-xs font-medium bg-error-100 text-error-800 rounded-full dark:bg-error-900 dark:text-error-200">
                                  Overdue
                                </span>
                              )}
                              {isDueSoon && !isOverdue && (
                                <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full dark:bg-warning-900 dark:text-warning-200">
                                  Due Soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                              {LIABILITY_TYPES.find(t => t.value === liability.type)?.label}
                              {liability.due_date && ` • Due ${formatDate(liability.due_date)}`}
                              {liability.interest_rate && ` • ${liability.interest_rate}% interest`}
                            </p>
                            {liability.notes && (
                              <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                {liability.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-secondary-900 dark:text-white">
                              {formatCurrency(liability.outstanding_amount)}
                            </p>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                              of {formatCurrency(liability.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(liability)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(liability.id)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingLiability ? 'Edit Liability' : 'Add New Liability'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={LIABILITY_TYPES}
              placeholder="Select liability type"
              required
            />
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter liability name"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Total amount"
                required
              />
              <Input
                label="Outstanding Amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.outstanding_amount}
                onChange={(e) => setFormData({ ...formData, outstanding_amount: e.target.value })}
                placeholder="Outstanding amount"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                placeholder="Interest rate"
              />
            </div>
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
                {editingLiability ? 'Update' : 'Add'} Liability
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
