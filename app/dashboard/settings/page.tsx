'use client';

import { motion } from 'framer-motion';
import { Settings, User, Bell, Lock } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    username: user?.username || '',
    password: '',
  });

  const settingsSections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Update your profile information',
      items: [
        { label: 'Email', value: user?.email || '', disabled: true },
        { label: 'Username', value: formValues.username, disabled: false, key: 'username' },
      ],
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      items: [{ label: 'Email notifications', value: 'enabled', disabled: true }],
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Update your password and security settings',
      items: [{ label: 'Change password', value: formValues.password, disabled: false, key: 'password' }],
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account preferences
                  </p>
                </div>
              </div>

              {/* Settings Sections */}
              {settingsSections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-xl border border-primary/10 bg-card"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <Icon className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h2 className="text-lg font-semibold">{section.title}</h2>
                        <p className="text-muted-foreground text-sm">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((item, j) => (
                        <div key={j} className="space-y-2">
                          <Label>{item.label}</Label>
                          <Input
                            value={item.value}
                            disabled={item.disabled}
                            placeholder={item.disabled ? 'Not editable' : 'Enter value'}
                            onChange={
                              item.disabled
                                ? undefined
                                : (e) =>
                                    setFormValues((prev) => ({
                                      ...prev,
                                      //@ts-ignore
                                      [item.key]: e.target.value,
                                    }))
                            }
                          />
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-6">
                        Save Changes
                      </Button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl border border-destructive/20 bg-destructive/5"
              >
                <h2 className="text-lg font-semibold text-destructive mb-3">
                  Danger Zone
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  These actions cannot be undone. Please be careful.
                </p>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
