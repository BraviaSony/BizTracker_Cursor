import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Liabilities', href: '/liabilities', icon: CreditCard },
  { name: 'Salaries', href: '/salaries', icon: Users },
  { name: 'Cashflow', href: '/cashflow', icon: TrendingUp },
  { name: 'Bank PDC', href: '/pdc', icon: FileText },
  { name: 'Capital', href: '/capital', icon: PlusCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-secondary-800 lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              BizFlow Tracker
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:hover:text-white'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-primary-500 dark:text-primary-400'
                        : 'text-secondary-400 group-hover:text-secondary-500 dark:group-hover:text-secondary-300'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-secondary-200 p-3 dark:border-secondary-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:hover:text-white"
              onClick={() => {
                // Handle logout
                console.log('Logout clicked')
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export { Sidebar }
