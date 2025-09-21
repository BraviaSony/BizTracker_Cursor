-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE expense_category AS ENUM (
  'office_supplies',
  'utilities',
  'rent',
  'marketing',
  'travel',
  'meals',
  'equipment',
  'software',
  'insurance',
  'other'
);

CREATE TYPE liability_type AS ENUM (
  'loan',
  'credit_card',
  'vendor_payment',
  'tax_payment',
  'other'
);

CREATE TYPE salary_status AS ENUM (
  'paid',
  'unpaid',
  'pending'
);

CREATE TYPE pdc_status AS ENUM (
  'pending',
  'cleared',
  'bounced',
  'cancelled'
);

CREATE TYPE capital_type AS ENUM (
  'equity',
  'loan',
  'investment',
  'grant',
  'other'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category expense_category NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liabilities table
CREATE TABLE public.liabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type liability_type NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  outstanding_amount DECIMAL(10,2) NOT NULL CHECK (outstanding_amount >= 0),
  due_date DATE,
  interest_rate DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE public.employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  monthly_salary DECIMAL(10,2) NOT NULL CHECK (monthly_salary > 0),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salaries table
CREATE TABLE public.salaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status salary_status DEFAULT 'unpaid',
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Cashflow table
CREATE TABLE public.cashflow (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  description TEXT,
  reference_id UUID, -- Can reference expenses, salaries, etc.
  reference_type TEXT, -- 'expense', 'salary', 'liability', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank PDC table
CREATE TABLE public.bank_pdc (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cheque_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status pdc_status DEFAULT 'pending',
  payee TEXT,
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Capital injections table
CREATE TABLE public.capital_injections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type capital_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  source TEXT,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);

CREATE INDEX idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX idx_liabilities_type ON public.liabilities(type);

CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_active ON public.employees(is_active);

CREATE INDEX idx_salaries_user_id ON public.salaries(user_id);
CREATE INDEX idx_salaries_employee_id ON public.salaries(employee_id);
CREATE INDEX idx_salaries_month_year ON public.salaries(month, year);
CREATE INDEX idx_salaries_status ON public.salaries(status);

CREATE INDEX idx_cashflow_user_id ON public.cashflow(user_id);
CREATE INDEX idx_cashflow_date ON public.cashflow(date);
CREATE INDEX idx_cashflow_type ON public.cashflow(type);

CREATE INDEX idx_bank_pdc_user_id ON public.bank_pdc(user_id);
CREATE INDEX idx_bank_pdc_due_date ON public.bank_pdc(due_date);
CREATE INDEX idx_bank_pdc_status ON public.bank_pdc(status);

CREATE INDEX idx_capital_injections_user_id ON public.capital_injections(user_id);
CREATE INDEX idx_capital_injections_date ON public.capital_injections(date);
CREATE INDEX idx_capital_injections_type ON public.capital_injections(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON public.salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cashflow_updated_at BEFORE UPDATE ON public.cashflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_pdc_updated_at BEFORE UPDATE ON public.bank_pdc FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capital_injections_updated_at BEFORE UPDATE ON public.capital_injections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_pdc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_injections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for expenses
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for liabilities
CREATE POLICY "Users can view own liabilities" ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liabilities" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own liabilities" ON public.liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own liabilities" ON public.liabilities FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employees
CREATE POLICY "Users can view own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for salaries
CREATE POLICY "Users can view own salaries" ON public.salaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own salaries" ON public.salaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own salaries" ON public.salaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own salaries" ON public.salaries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cashflow
CREATE POLICY "Users can view own cashflow" ON public.cashflow FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cashflow" ON public.cashflow FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cashflow" ON public.cashflow FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cashflow" ON public.cashflow FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bank_pdc
CREATE POLICY "Users can view own bank_pdc" ON public.bank_pdc FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank_pdc" ON public.bank_pdc FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank_pdc" ON public.bank_pdc FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank_pdc" ON public.bank_pdc FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for capital_injections
CREATE POLICY "Users can view own capital_injections" ON public.capital_injections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capital_injections" ON public.capital_injections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own capital_injections" ON public.capital_injections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own capital_injections" ON public.capital_injections FOR DELETE USING (auth.uid() = user_id);
