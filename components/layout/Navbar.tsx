import React, { useState } from 'react'
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useEffect } from 'react'

interface NavbarProps {
  onMenuClick: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isDarkMode, onToggleDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)
  const supabase = createClientSupabase()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 shadow-sm dark:border-secondary-700 dark:bg-secondary-800 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className="h-8 w-8 p-0"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-error-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User avatar */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-secondary-900 dark:text-white">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
