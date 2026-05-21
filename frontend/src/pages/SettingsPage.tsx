import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Settings as SettingsIcon,
  Users } from
'lucide-react';
import { ProfileTab } from '../components/settings/ProfileTab';
import { SecurityTab } from '../components/settings/SecurityTab';
import { NotificationsTab } from '../components/settings/NotificationsTab';
import { AppSettingsTab } from '../components/settings/AppSettingsTab';
import { TeamTab } from '../components/settings/TeamTab';
type Tab = 'profile' | 'security' | 'notifications' | 'app-settings' | 'team';
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const tabs = [
  {
    id: 'profile' as Tab,
    label: 'Profile',
    icon: User
  },
  {
    id: 'security' as Tab,
    label: 'Security',
    icon: Shield
  },
  {
    id: 'notifications' as Tab,
    label: 'Notifications',
    icon: Bell
  },
  {
    id: 'app-settings' as Tab,
    label: 'Application Settings',
    icon: SettingsIcon
  },
  {
    id: 'team' as Tab,
    label: 'Team',
    icon: Users
  }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-accent bg-blue-50 border-l-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'}`}>
                  
                  <Icon size={18} />
                  {tab.label}
                </button>);

            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'app-settings' && <AppSettingsTab />}
          {activeTab === 'team' && <TeamTab />}
        </div>
      </div>
    </div>);

}