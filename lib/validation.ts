export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  return { isValid: true }
}

export const validateRequired = (value: any, fieldName: string): ValidationError | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { field: fieldName, message: `${fieldName} is required` }
  }
  return null
}

export const validateNumber = (value: any, fieldName: string, min?: number, max?: number): ValidationError | null => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return { field: fieldName, message: `${fieldName} must be a valid number` }
  }
  if (min !== undefined && num < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min}` }
  }
  if (max !== undefined && num > max) {
    return { field: fieldName, message: `${fieldName} must be at most ${max}` }
  }
  return null
}

export const validateDate = (value: any, fieldName: string): ValidationError | null => {
  if (!value) return null
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { field: fieldName, message: `${fieldName} must be a valid date` }
  }
  return null
}

export const validateExpense = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.category, 'Category'),
    validateRequired(data.amount, 'Amount'),
    validateRequired(data.date, 'Date'),
  ].filter(Boolean) as ValidationError[])

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.date) {
    const dateError = validateDate(data.date, 'Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateLiability = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.type, 'Type'),
    validateRequired(data.name, 'Name'),
    validateRequired(data.amount, 'Amount'),
    validateRequired(data.outstanding_amount, 'Outstanding Amount'),
  ].filter(Boolean) as ValidationError[])

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.outstanding_amount) {
    const outstandingError = validateNumber(data.outstanding_amount, 'Outstanding Amount', 0)
    if (outstandingError) errors.push(outstandingError)
  }

  if (data.interest_rate) {
    const interestError = validateNumber(data.interest_rate, 'Interest Rate', 0, 100)
    if (interestError) errors.push(interestError)
  }

  if (data.due_date) {
    const dateError = validateDate(data.due_date, 'Due Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateEmployee = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.name, 'Name'),
    validateRequired(data.monthly_salary, 'Monthly Salary'),
  ].filter(Boolean) as ValidationError[])

  if (data.monthly_salary) {
    const salaryError = validateNumber(data.monthly_salary, 'Monthly Salary', 0.01)
    if (salaryError) errors.push(salaryError)
  }

  if (data.hire_date) {
    const dateError = validateDate(data.hire_date, 'Hire Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateSalary = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.employee_id, 'Employee'),
    validateRequired(data.month, 'Month'),
    validateRequired(data.year, 'Year'),
    validateRequired(data.amount, 'Amount'),
  ].filter(Boolean) as ValidationError[])

  if (data.month) {
    const monthError = validateNumber(data.month, 'Month', 1, 12)
    if (monthError) errors.push(monthError)
  }

  if (data.year) {
    const yearError = validateNumber(data.year, 'Year', 2000, 2100)
    if (yearError) errors.push(yearError)
  }

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.paid_date) {
    const dateError = validateDate(data.paid_date, 'Paid Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateCashflow = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.type, 'Type'),
    validateRequired(data.category, 'Category'),
    validateRequired(data.amount, 'Amount'),
    validateRequired(data.date, 'Date'),
  ].filter(Boolean) as ValidationError[])

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.date) {
    const dateError = validateDate(data.date, 'Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validatePDC = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.cheque_number, 'Cheque Number'),
    validateRequired(data.bank_name, 'Bank Name'),
    validateRequired(data.amount, 'Amount'),
    validateRequired(data.issue_date, 'Issue Date'),
    validateRequired(data.due_date, 'Due Date'),
  ].filter(Boolean) as ValidationError[])

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.issue_date) {
    const issueDateError = validateDate(data.issue_date, 'Issue Date')
    if (issueDateError) errors.push(issueDateError)
  }

  if (data.due_date) {
    const dueDateError = validateDate(data.due_date, 'Due Date')
    if (dueDateError) errors.push(dueDateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateCapitalInjection = (data: any): ValidationResult => {
  const errors: ValidationError[] = []

  errors.push(...[
    validateRequired(data.type, 'Type'),
    validateRequired(data.amount, 'Amount'),
    validateRequired(data.date, 'Date'),
  ].filter(Boolean) as ValidationError[])

  if (data.amount) {
    const amountError = validateNumber(data.amount, 'Amount', 0.01)
    if (amountError) errors.push(amountError)
  }

  if (data.date) {
    const dateError = validateDate(data.date, 'Date')
    if (dateError) errors.push(dateError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
