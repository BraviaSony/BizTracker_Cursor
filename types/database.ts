export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category: 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'travel' | 'meals' | 'equipment' | 'software' | 'insurance' | 'other'
          amount: number
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'travel' | 'meals' | 'equipment' | 'software' | 'insurance' | 'other'
          amount: number
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'travel' | 'meals' | 'equipment' | 'software' | 'insurance' | 'other'
          amount?: number
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      liabilities: {
        Row: {
          id: string
          user_id: string
          type: 'loan' | 'credit_card' | 'vendor_payment' | 'tax_payment' | 'other'
          name: string
          amount: number
          outstanding_amount: number
          due_date: string | null
          interest_rate: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'loan' | 'credit_card' | 'vendor_payment' | 'tax_payment' | 'other'
          name: string
          amount: number
          outstanding_amount: number
          due_date?: string | null
          interest_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'loan' | 'credit_card' | 'vendor_payment' | 'tax_payment' | 'other'
          name?: string
          amount?: number
          outstanding_amount?: number
          due_date?: string | null
          interest_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          name: string
          position: string | null
          monthly_salary: number
          hire_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          position?: string | null
          monthly_salary: number
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          position?: string | null
          monthly_salary?: number
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      salaries: {
        Row: {
          id: string
          user_id: string
          employee_id: string
          month: number
          year: number
          amount: number
          status: 'paid' | 'unpaid' | 'pending'
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employee_id: string
          month: number
          year: number
          amount: number
          status?: 'paid' | 'unpaid' | 'pending'
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employee_id?: string
          month?: number
          year?: number
          amount?: number
          status?: 'paid' | 'unpaid' | 'pending'
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cashflow: {
        Row: {
          id: string
          user_id: string
          type: 'inflow' | 'outflow'
          category: string
          amount: number
          date: string
          description: string | null
          reference_id: string | null
          reference_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'inflow' | 'outflow'
          category: string
          amount: number
          date: string
          description?: string | null
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'inflow' | 'outflow'
          category?: string
          amount?: number
          date?: string
          description?: string | null
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_pdc: {
        Row: {
          id: string
          user_id: string
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
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cheque_number: string
          bank_name: string
          amount: number
          issue_date: string
          due_date: string
          status?: 'pending' | 'cleared' | 'bounced' | 'cancelled'
          payee?: string | null
          purpose?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cheque_number?: string
          bank_name?: string
          amount?: number
          issue_date?: string
          due_date?: string
          status?: 'pending' | 'cleared' | 'bounced' | 'cancelled'
          payee?: string | null
          purpose?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      capital_injections: {
        Row: {
          id: string
          user_id: string
          type: 'equity' | 'loan' | 'investment' | 'grant' | 'other'
          amount: number
          date: string
          source: string | null
          description: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'equity' | 'loan' | 'investment' | 'grant' | 'other'
          amount: number
          date: string
          source?: string | null
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'equity' | 'loan' | 'investment' | 'grant' | 'other'
          amount?: number
          date?: string
          source?: string | null
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category: 'office_supplies' | 'utilities' | 'rent' | 'marketing' | 'travel' | 'meals' | 'equipment' | 'software' | 'insurance' | 'other'
      liability_type: 'loan' | 'credit_card' | 'vendor_payment' | 'tax_payment' | 'other'
      salary_status: 'paid' | 'unpaid' | 'pending'
      pdc_status: 'pending' | 'cleared' | 'bounced' | 'cancelled'
      capital_type: 'equity' | 'loan' | 'investment' | 'grant' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
