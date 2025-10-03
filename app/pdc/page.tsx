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
import { Plus, Search, FileEdit as Edit, Trash2, FileText, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PDC {
  id: string
  cheque_number: string
  bank_name: string
  amount: number
  issue_date: string
  due_date: string
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled'
  payee: string | null
  purpose: string | null
  notes: string | null
  created_at: string
}

const PDC_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS = {
  pending: 'text-warning-600 bg-warning-50 dark:bg-warning-900/20',
  cleared: 'text-success-600 bg-success-50 dark:bg-success-900/20',
  bounced: 'text-error-600 bg-error-50 dark:bg-error-900/20',
  cancelled: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800',
}

const STATUS_ICONS = {
  pending: Clock,
  cleared: CheckCircle,
  bounced: XCircle,
  cancelled: XCircle,
}

export default function PDCPage() {
  const [pdcs, setPdcs] = useState<PDC[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPDC, setEditingPDC] = useState<PDC | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const [formData, setFormData] = useState({
    cheque_number: '',
    bank_name: '',
    amount: '',
    issue_date: '',
    due_date: '',
    status: 'pending',
    payee: '',
    purpose: '',
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
    await loadPDCs()
  }

  const loadPDCs = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (bankFilter) params.append('bank_name', bankFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/pdc?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load PDC records')
      }

      const { data } = await response.json()
      setPdcs(data || [])
    } catch (error) {
      console.error('Error loading PDCs:', error)
      toast.error('Failed to load PDCs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.cheque_number || !formData.bank_name || !formData.amount || !formData.issue_date || !formData.due_date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const pdcData = {
        cheque_number: formData.cheque_number,
        bank_name: formData.bank_name,
        amount: formData.amount,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        status: formData.status,
        payee: formData.payee || null,
        purpose: formData.purpose || null,
        notes: formData.notes || null,
      }

      const url = editingPDC ? `/api/pdc/${editingPDC.id}` : '/api/pdc'
      const method = editingPDC ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdcData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save PDC')
      }

      toast.success(editingPDC ? 'PDC updated successfully' : 'PDC added successfully')
      await loadPDCs()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving PDC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save PDC')
    }
  }

  const handleEdit = (pdc: PDC) => {
    setEditingPDC(pdc)
    setFormData({
      cheque_number: pdc.cheque_number,
      bank_name: pdc.bank_name,
      amount: pdc.amount.toString(),
      issue_date: pdc.issue_date,
      due_date: pdc.due_date,
      status: pdc.status,
      payee: pdc.payee || '',
      purpose: pdc.purpose || '',
      notes: pdc.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PDC?')) return

    try {
      const { error } = await supabase
        .from('bank_pdc')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('PDC deleted successfully')
      await loadPDCs()
    } catch (error) {
      console.error('Error deleting PDC:', error)
      toast.error('Failed to delete PDC')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPDC(null)
    setFormData({
      cheque_number: '',
      bank_name: '',
      amount: '',
      issue_date: '',
      due_date: '',
      status: 'pending',
      payee: '',
      purpose: '',
      notes: '',
    })
  }

  const filteredPDCs = pdcs.filter(pdc => {
    const matchesSearch = pdc.cheque_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pdc.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pdc.payee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pdc.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || pdc.status === statusFilter
    const matchesBank = !bankFilter || pdc.bank_name.toLowerCase().includes(bankFilter.toLowerCase())
    const matchesDate = !dateFilter || pdc.due_date.startsWith(dateFilter)
    
    return matchesSearch && matchesStatus && matchesBank && matchesDate
  })

  const totalAmount = filteredPDCs.reduce((sum, pdc) => sum + pdc.amount, 0)
  const pendingAmount = filteredPDCs
    .filter(pdc => pdc.status === 'pending')
    .reduce((sum, pdc) => sum + pdc.amount, 0)
  
  const overduePDCs = filteredPDCs.filter(pdc => 
    pdc.status === 'pending' && new Date(pdc.due_date) < new Date()
  )

  const uniqueBanks = [...new Set(pdcs.map(pdc => pdc.bank_name))]

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
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Bank PDC</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Track post-dated cheques and their status
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add PDC
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <FileText className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-error-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overduePDCs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPDCs.length}</div>
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
                placeholder="Search PDCs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  ...PDC_STATUS
                ]}
              />
              <Select
                placeholder="Filter by bank"
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Banks' },
                  ...uniqueBanks.map(bank => ({ value: bank, label: bank }))
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

        {/* PDCs List */}
        <Card>
          <CardHeader>
            <CardTitle>PDC Records</CardTitle>
            <CardDescription>
              {filteredPDCs.length} PDC(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPDCs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                <p className="text-secondary-500">No PDC records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPDCs.map((pdc) => {
                  const isOverdue = pdc.status === 'pending' && new Date(pdc.due_date) < new Date()
                  const isDueSoon = pdc.status === 'pending' && 
                    new Date(pdc.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    !isOverdue
                  const StatusIcon = STATUS_ICONS[pdc.status]

                  return (
                    <div
                      key={pdc.id}
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
                          <div className={`p-2 rounded-lg ${STATUS_COLORS[pdc.status]}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-secondary-900 dark:text-white">
                                {pdc.cheque_number} - {pdc.bank_name}
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
                              Due {formatDate(pdc.due_date)}
                              {pdc.payee && ` • Payee: ${pdc.payee}`}
                              {pdc.purpose && ` • ${pdc.purpose}`}
                            </p>
                            {pdc.notes && (
                              <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                {pdc.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-secondary-900 dark:text-white">
                              {formatCurrency(pdc.amount)}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pdc.status]}`}>
                              {pdc.status.charAt(0).toUpperCase() + pdc.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pdc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pdc.id)}
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
          title={editingPDC ? 'Edit PDC' : 'Add New PDC'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cheque Number"
                value={formData.cheque_number}
                onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                placeholder="Enter cheque number"
                required
              />
              <Input
                label="Bank Name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Enter bank name"
                required
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Issue Date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={PDC_STATUS}
              placeholder="Select status"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Payee"
                value={formData.payee}
                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                placeholder="Enter payee name"
              />
              <Input
                label="Purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Enter purpose"
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
                {editingPDC ? 'Update' : 'Add'} PDC
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
