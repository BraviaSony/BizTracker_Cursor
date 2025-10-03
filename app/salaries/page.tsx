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
import { Plus, Search, FileEdit as Edit, Trash2, Users, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Employee {
  id: string
  name: string
  position: string | null
  monthly_salary: number
  hire_date: string | null
  is_active: boolean
  created_at: string
}

interface Salary {
  id: string
  employee_id: string
  month: number
  year: number
  amount: number
  status: 'paid' | 'unpaid' | 'pending'
  paid_date: string | null
  notes: string | null
  created_at: string
  employee?: Employee
}

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const SALARY_STATUS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
]

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  
  const [salaryFormData, setSalaryFormData] = useState({
    employee_id: '',
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    status: 'unpaid',
    paid_date: '',
    notes: '',
  })

  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    position: '',
    monthly_salary: '',
    hire_date: '',
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
    await Promise.all([loadSalaries(), loadEmployees()])
  }

  const loadSalaries = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (monthFilter) params.append('month', monthFilter)
      if (yearFilter) params.append('year', yearFilter)

      const response = await fetch(`/api/salaries?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load salaries')
      }

      const { data } = await response.json()
      setSalaries(data || [])
    } catch (error) {
      console.error('Error loading salaries:', error)
      toast.error('Failed to load salaries')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees?active=true')
      if (!response.ok) {
        throw new Error('Failed to load employees')
      }

      const { data } = await response.json()
      setEmployees(data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Failed to load employees')
    }
  }

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!salaryFormData.employee_id || !salaryFormData.month || !salaryFormData.year || !salaryFormData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const salaryData = {
        employee_id: salaryFormData.employee_id,
        month: salaryFormData.month,
        year: salaryFormData.year,
        amount: salaryFormData.amount,
        status: salaryFormData.status,
        paid_date: salaryFormData.paid_date || null,
        notes: salaryFormData.notes || null,
      }

      const url = editingSalary ? `/api/salaries/${editingSalary.id}` : '/api/salaries'
      const method = editingSalary ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save salary')
      }

      toast.success(editingSalary ? 'Salary updated successfully' : 'Salary added successfully')
      await loadSalaries()
      handleCloseSalaryModal()
    } catch (error) {
      console.error('Error saving salary:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save salary')
    }
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeFormData.name || !employeeFormData.monthly_salary) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const employeeData = {
        name: employeeFormData.name,
        position: employeeFormData.position || null,
        monthly_salary: employeeFormData.monthly_salary,
        hire_date: employeeFormData.hire_date || null,
        is_active: true,
      }

      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees'
      const method = editingEmployee ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save employee')
      }

      toast.success(editingEmployee ? 'Employee updated successfully' : 'Employee added successfully')
      await loadEmployees()
      handleCloseEmployeeModal()
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save employee')
    }
  }

  const handleEditSalary = (salary: Salary) => {
    setEditingSalary(salary)
    setSalaryFormData({
      employee_id: salary.employee_id,
      month: salary.month.toString(),
      year: salary.year.toString(),
      amount: salary.amount.toString(),
      status: salary.status,
      paid_date: salary.paid_date || '',
      notes: salary.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeFormData({
      name: employee.name,
      position: employee.position || '',
      monthly_salary: employee.monthly_salary.toString(),
      hire_date: employee.hire_date || '',
    })
    setIsEmployeeModalOpen(true)
  }

  const handleDeleteSalary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return

    try {
      const { error } = await supabase
        .from('salaries')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Salary record deleted successfully')
      await loadSalaries()
    } catch (error) {
      console.error('Error deleting salary:', error)
      toast.error('Failed to delete salary record')
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Employee deleted successfully')
      await loadEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  const handleCloseSalaryModal = () => {
    setIsModalOpen(false)
    setEditingSalary(null)
    setSalaryFormData({
      employee_id: '',
      month: '',
      year: new Date().getFullYear().toString(),
      amount: '',
      status: 'unpaid',
      paid_date: '',
      notes: '',
    })
  }

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false)
    setEditingEmployee(null)
    setEmployeeFormData({
      name: '',
      position: '',
      monthly_salary: '',
      hire_date: '',
    })
  }

  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         salary.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || salary.status === statusFilter
    const matchesMonth = !monthFilter || salary.month.toString() === monthFilter
    const matchesYear = salary.year.toString() === yearFilter
    
    return matchesSearch && matchesStatus && matchesMonth && matchesYear
  })

  const totalPaid = filteredSalaries
    .filter(s => s.status === 'paid')
    .reduce((sum, salary) => sum + salary.amount, 0)
  
  const totalUnpaid = filteredSalaries
    .filter(s => s.status === 'unpaid')
    .reduce((sum, salary) => sum + salary.amount, 0)

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
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Salaries</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Manage employee salaries and payments
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEmployeeModalOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Salary
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-success-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
              <Clock className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalUnpaid)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <DollarSign className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSalaries.length}</div>
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
                placeholder="Search employees..."
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
                  ...SALARY_STATUS
                ]}
              />
              <Select
                placeholder="Filter by month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Months' },
                  ...MONTHS
                ]}
              />
              <Input
                type="number"
                placeholder="Year"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                min="2020"
                max="2030"
              />
            </div>
          </CardContent>
        </Card>

        {/* Salaries List */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Records</CardTitle>
            <CardDescription>
              {filteredSalaries.length} salary record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSalaries.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                <p className="text-secondary-500">No salary records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSalaries.map((salary) => (
                  <div
                    key={salary.id}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-secondary-900 dark:text-white">
                            {salary.employee?.name || 'Unknown Employee'}
                          </h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {MONTHS.find(m => parseInt(m.value) === salary.month)?.label} {salary.year}
                            {salary.employee?.position && ` • ${salary.employee.position}`}
                            {salary.paid_date && ` • Paid ${formatDate(salary.paid_date)}`}
                          </p>
                          {salary.notes && (
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                              {salary.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900 dark:text-white">
                            {formatCurrency(salary.amount)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            salary.status === 'paid' 
                              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                              : salary.status === 'pending'
                              ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                              : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                          }`}>
                            {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSalary(salary)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSalary(salary.id)}
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

        {/* Add/Edit Salary Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseSalaryModal}
          title={editingSalary ? 'Edit Salary' : 'Add New Salary'}
        >
          <form onSubmit={handleSalarySubmit} className="space-y-4">
            <Select
              label="Employee"
              value={salaryFormData.employee_id}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, employee_id: e.target.value })}
              options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
              placeholder="Select employee"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                value={salaryFormData.month}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, month: e.target.value })}
                options={MONTHS}
                placeholder="Select month"
                required
              />
              <Input
                label="Year"
                type="number"
                value={salaryFormData.year}
                onChange={(e) => setSalaryFormData({ ...salaryFormData, year: e.target.value })}
                placeholder="Year"
                required
              />
            </div>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={salaryFormData.amount}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, amount: e.target.value })}
              placeholder="Enter amount"
              required
            />
            <Select
              label="Status"
              value={salaryFormData.status}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, status: e.target.value })}
              options={SALARY_STATUS}
              placeholder="Select status"
              required
            />
            <Input
              label="Paid Date"
              type="date"
              value={salaryFormData.paid_date}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, paid_date: e.target.value })}
            />
            <Input
              label="Notes"
              value={salaryFormData.notes}
              onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
              placeholder="Optional notes"
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseSalaryModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSalary ? 'Update' : 'Add'} Salary
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add/Edit Employee Modal */}
        <Modal
          isOpen={isEmployeeModalOpen}
          onClose={handleCloseEmployeeModal}
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        >
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <Input
              label="Name"
              value={employeeFormData.name}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
              placeholder="Enter employee name"
              required
            />
            <Input
              label="Position"
              value={employeeFormData.position}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, position: e.target.value })}
              placeholder="Enter position"
            />
            <Input
              label="Monthly Salary"
              type="number"
              step="0.01"
              min="0"
              value={employeeFormData.monthly_salary}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, monthly_salary: e.target.value })}
              placeholder="Enter monthly salary"
              required
            />
            <Input
              label="Hire Date"
              type="date"
              value={employeeFormData.hire_date}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, hire_date: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseEmployeeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Update' : 'Add'} Employee
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
