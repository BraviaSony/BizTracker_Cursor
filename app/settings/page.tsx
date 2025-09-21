'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClientSupabase } from '@/lib/supabase'
import { User, Building, LogOut, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
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
    await loadProfile()
  }

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        company_name: data.company_name || '',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          company_name: formData.company_name || null,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated successfully')
      await loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to logout')
    }
  }

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
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Settings</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage your account and application preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Update your personal and company information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  value={profile?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <Input
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter your company name"
              />
              <div className="flex justify-end">
                <Button type="submit" loading={saving} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              View your account details and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Account Created
                  </label>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Last Updated
                  </label>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error-200 dark:border-error-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-error-600">
              <LogOut className="h-5 w-5" />
              <span>Account Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your account session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">Sign Out</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-error-300 text-error-600 hover:bg-error-50 dark:border-error-700 dark:text-error-400 dark:hover:bg-error-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
